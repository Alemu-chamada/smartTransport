const asyncHandler = require("../../../shared/utils/asyncHandler.js");
const { success } = require("../../../shared/utils/response.js");
const postService = require("../services/post.service.js");

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await postService.getAllPosts(req.user.id);
  return success(res, {
    message: "Posts retrieved successfully",
    data: { posts }
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user.id);
  return success(res, {
    message: "Post retrieved successfully",
    data: { post }
  });
});

const getCommentsByPostId = asyncHandler(async (req, res) => {
  const comments = await postService.getCommentsByPostId(req.params.id, req.user?.id);
  return success(res, { message: "Comments retrieved successfully", data: { comments } });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await postService.toggleLike({ userId: req.user.id, postId: req.params.id });
  return success(res, { message: "Like toggled successfully", data: { post } });
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const comment = await postService.toggleCommentLike({ userId: req.user.id, commentId: req.params.commentId });
  return success(res, { message: "Comment like toggled", data: { comment } });
});

module.exports = {
  getAllPosts, getPostById, getCommentsByPostId,
  createPost, createComment, toggleLike, toggleCommentLike,
  deletePost, editPost, deleteComment, editComment,
};
  const post = await postService.createPost({
    userId: req.user.id,
    title: req.body.title,
    content: req.body.content
  });
  return success(res, {
    message: "Post created successfully",
    data: { post }
  });
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await postService.createComment({
    userId: req.user.id,
    postId: req.params.id,
    content: req.body.content
  });
  return success(res, {
    message: "Comment created successfully",
    data: { comment }
  });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await postService.toggleLike({
    userId: req.user.id,
    postId: req.params.id
  });
  return success(res, {
    message: "Like toggled successfully",
    data: { post }
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePost({ userId: req.user.id, role: req.user.role, postId: req.params.id });
  return success(res, { message: "Post deleted successfully", data: result });
});

const editPost = asyncHandler(async (req, res) => {
  const post = await postService.editPost({ userId: req.user.id, role: req.user.role, postId: req.params.id, ...req.body });
  return success(res, { message: "Post updated successfully", data: { post } });
});

const deleteComment = asyncHandler(async (req, res) => {
  const result = await postService.deleteComment({ userId: req.user.id, role: req.user.role, commentId: req.params.commentId });
  return success(res, { message: "Comment deleted successfully", data: result });
});

const editComment = asyncHandler(async (req, res) => {
  const comment = await postService.editComment({ userId: req.user.id, commentId: req.params.commentId, content: req.body.content });
  return success(res, { message: "Comment updated successfully", data: { comment } });
});

module.exports = {
  getAllPosts, getPostById, getCommentsByPostId,
  createPost, createComment, toggleLike,
  deletePost, editPost, deleteComment, editComment,
};
