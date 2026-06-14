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
  const comments = await postService.getCommentsByPostId(req.params.id);
  return success(res, {
    message: "Comments retrieved successfully",
    data: { comments }
  });
});

const createPost = asyncHandler(async (req, res) => {
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

module.exports = {
  getAllPosts,
  getPostById,
  getCommentsByPostId,
  createPost,
  createComment,
  toggleLike
};
