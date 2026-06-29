const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const { mapPost, mapComment } = require("../repositories/post.model.js");

const getAllPosts = async (userId) => {
  const result = await db.query(
    `SELECT p.*, u.full_name as author_name
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.is_published = TRUE
     ORDER BY p.created_at DESC`
  );
  return result.rows.map((row) => ({
    ...mapPost(row),
    like_count: 0,
    is_liked: false
  }));
};

const getPostById = async (postId, userId) => {
  const result = await db.query(
    `SELECT p.*, u.full_name as author_name
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = $1`,
    [postId]
  );
  return {
    ...mapPost(result.rows[0]),
    like_count: 0,
    is_liked: false
  };
};

const getCommentsByPostId = async (postId) => {
  const result = await db.query(
    `SELECT c.*, u.full_name as author_name
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows.map(mapComment);
};

const createPost = async ({ userId, title, content }) => {
  if (!title || !content) {
    throw new ApiError(422, "Title and content are required.", "VALIDATION_ERROR");
  }
  const result = await db.query(
    `INSERT INTO posts (author_id, title, content, is_published)
     VALUES ($1, $2, $3, TRUE)
     RETURNING *`,
    [userId, title, content]
  );
  return getPostById(result.rows[0].id, userId);
};

const createComment = async ({ userId, postId, content }) => {
  if (!content) {
    throw new ApiError(422, "Content is required.", "VALIDATION_ERROR");
  }
  const result = await db.query(
    `INSERT INTO comments (post_id, author_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [postId, userId, content]
  );
  const commentResult = await db.query(
    `SELECT c.*, u.full_name as author_name
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.id = $1`,
    [result.rows[0].id]
  );
  return mapComment(commentResult.rows[0]);
};

const toggleLike = async ({ userId, postId }) => {
  // Like functionality not supported in current schema
  return getPostById(postId, userId);
};

const deletePost = async ({ userId, role, postId }) => {
  const postResult = await db.query("SELECT * FROM posts WHERE id = $1", [postId]);
  const post = postResult.rows[0];
  if (!post) throw new ApiError(404, "Post not found.", "NOT_FOUND");
  if (role !== "system_admin" && post.author_id !== userId) {
    throw new ApiError(403, "You can only delete your own posts.", "FORBIDDEN");
  }
  await db.query("DELETE FROM comments WHERE post_id = $1", [postId]);
  await db.query("DELETE FROM posts WHERE id = $1", [postId]);
  return { deleted: true };
};

const editPost = async ({ userId, role, postId, title, content }) => {
  const postResult = await db.query("SELECT * FROM posts WHERE id = $1", [postId]);
  const post = postResult.rows[0];
  if (!post) throw new ApiError(404, "Post not found.", "NOT_FOUND");
  if (role !== "system_admin" && post.author_id !== userId) {
    throw new ApiError(403, "You can only edit your own posts.", "FORBIDDEN");
  }
  const result = await db.query(
    `UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = now()
     WHERE id = $3 RETURNING *`,
    [title || null, content || null, postId]
  );
  return getPostById(result.rows[0].id, userId);
};

const deleteComment = async ({ userId, role, commentId }) => {
  const commentResult = await db.query("SELECT * FROM comments WHERE id = $1", [commentId]);
  const comment = commentResult.rows[0];
  if (!comment) throw new ApiError(404, "Comment not found.", "NOT_FOUND");
  if (role !== "system_admin" && comment.author_id !== userId) {
    throw new ApiError(403, "You can only delete your own comments.", "FORBIDDEN");
  }
  await db.query("DELETE FROM comments WHERE id = $1", [commentId]);
  return { deleted: true };
};

const editComment = async ({ userId, commentId, content }) => {
  const commentResult = await db.query("SELECT * FROM comments WHERE id = $1", [commentId]);
  const comment = commentResult.rows[0];
  if (!comment) throw new ApiError(404, "Comment not found.", "NOT_FOUND");
  if (comment.author_id !== userId) {
    throw new ApiError(403, "You can only edit your own comments.", "FORBIDDEN");
  }
  const result = await db.query(
    `UPDATE comments SET content = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [content, commentId]
  );
  const updated = await db.query(
    `SELECT c.*, u.full_name as author_name FROM comments c JOIN users u ON u.id = c.author_id WHERE c.id = $1`,
    [result.rows[0].id]
  );
  return mapComment(updated.rows[0]);
};

module.exports = {
  getAllPosts, getPostById, getCommentsByPostId,
  createPost, createComment, toggleLike,
  deletePost, editPost, deleteComment, editComment,
};
