const router = require("express").Router();
const authMiddleware = require("../../../shared/middleware/auth.middleware.js");
const userController = require("../controllers/user.controller.js");

router.get("/", authMiddleware, userController.getUsers);
router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, userController.updateUser);
router.delete("/me", authMiddleware, userController.deleteMe);
router.put("/:userId/role", authMiddleware, userController.updateUserRole);

module.exports = router;
