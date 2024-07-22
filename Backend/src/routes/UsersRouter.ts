import express from "express";
import { UserService } from "../services/UserService";
import { usersResourceNA } from "../Resources";

const UsersRouter = express.Router();
const userService = new UserService();

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: "Get Users not Admin"
 *     deprecated: false
 *     description: "Retrieve all users"
 *     tags:
 *       - "User"
 *     responses:
 *       "200":
 *         description: "OK"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties: {}
 *       "403":
 *         description: "Forbidden - Invalid authorization"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 error:
 *                   type: "string"
 *                   example: "Invalid authorization."
 *       "404":
 *         description: "Not Found - Users not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 error:
 *                   type: "string"
 *                   example: "Users not found."
 *     security:
 *       - bearerAuth: []
 */
UsersRouter.get("/users", async (req, res, next) => {
  try {
    const users: usersResourceNA = await userService.getUsersNotAdmin();
    res.status(200).send(users);
  } catch (err) {
    res.status(404);
    next(err);
  }
});
export default UsersRouter;
