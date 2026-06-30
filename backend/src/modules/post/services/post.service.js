const db = require("../../../infrastructure/database/db.js");
const ApiError = require("../../../shared/utils/apiError.js");
const { mapPost, mapComment } = require("../repositories/post.model.js");

const getAllPosts = async (userId) => {
  const result = await db.query(
    `SELECT p.*, u.full_name as author_name,
            COUNT(DISTINCT pl.id)::int  AS like_count,
            BOOL_OR(pl.user_id = $1)    AS is_liked
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN post_likes pl ON pl.post_id = p.id
     WHERE p.is_published = TRUE
     GROUP BY p.id, u.full_name
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows.map((row) => ({
    ...mapPost(row),
    like_count: row.like_count || 0,
    is_liked: row.is_liked || false,
  }));
};

const getPostById = async (postId, userId) => {
  const result = await db.query(
    `SELECT p.*, u.full_name as author_name,
            COUNT(DISTINCT pl.id)::int  AS like_count,
            BOOL_OR(pl.user_id = $2)    AS is_liked
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN post_likes pl ON pl.post_id = p.id
     WHERE p.id = $1
     GROUP BY p.id, u.full_name`,
    [postId, userId]
  );
  if (!result.rows[0]) return null;
  return {
    ...mapPost(result.rows[0]),
    like_count: result.rows[0].like_count || 0,
    is_liked: result.rows[0].is_liked || false,
  };
};

const getCommentsByPostId = async (postId, userId) => {
  const result = await db.query(
    `SELECT c.*, u.full_name as author_name,
            COUNT(DISTINCT cl.id)::int  AS like_count,
            BOOL_OR(cl.user_id = $2)    AS is_liked
     FROM comments c
     JOIN users u ON u.id = c.author_id
     LEFT JOIN comment_likes cl ON cl.comment_id = c.id
     WHERE c.post_id = $1
     GROUP BY c.id, u.full_name
     ORDER BY c.created_at ASC`,
    [postId, userId || null]
  );
  return result.rows.map((row) => ({
    ...mapComment(row),
    like_count: row.like_count || 0,
    is_liked: row.is_liked || false,
  }));
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
  const existing = await db.query(
    `SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );
  if (existing.rows[0]) {
    await db.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
  } else {
    await db.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [postId, userId]);
  }
  return getPostById(postId, userId);
};

const toggleCommentLike = async ({ userId, commentId }) => {
  const existing = await db.query(
    `SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2`,
    [commentId, userId]
  );
  if (existing.rows[0]) {
    await db.query(`DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2`, [commentId, userId]);
  } else {
    await db.query(`INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [commentId, userId]);
  }
  const result = await db.query(
    `SELECT c.*, u.full_name as author_name,
            COUNT(DISTINCT cl.id)::int AS like_count,
            BOOL_OR(cl.user_id = $2)   AS is_liked
     FROM comments c
     JOIN users u ON u.id = c.author_id
     LEFT JOIN comment_likes cl ON cl.comment_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, u.full_name`,
    [commentId, userId]
  );
  return {
    ...mapComment(result.rows[0]),
    like_count: result.rows[0]?.like_count || 0,
    is_liked: result.rows[0]?.is_liked || false,
  };
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
  createPost, createComment, toggleLike, toggleCommentLike,
  deletePost, editPost, deleteComment, editComment,
};
