const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const restrictTo = require("../../../shared/middleware/rbac.middleware.js");
const postController = require("../controllers/post.controller.js");
const { USER_ROLES } = require("../../user/constants/user.constants.js");

router.get("/", authMiddleware, postController.getAllPosts);
router.get("/:id", authMiddleware, postController.getPostById);
router.get("/:id/comments", authMiddleware, postController.getCommentsByPostId);
router.post("/", authMiddleware, restrictTo(USER_ROLES.TRAFFIC_AUTHORITY, USER_ROLES.SYSTEM_ADMIN), postController.createPost);
router.post("/:id/comments", authMiddleware, postController.createComment);
router.post("/:id/like", authMiddleware, postController.toggleLike);
router.delete("/:id", authMiddleware, postController.deletePost);
router.patch("/:id", authMiddleware, postController.editPost);
router.delete("/:id/comments/:commentId", authMiddleware, postController.deleteComment);
router.patch("/:id/comments/:commentId", authMiddleware, postController.editComment);

module.exports = router;
