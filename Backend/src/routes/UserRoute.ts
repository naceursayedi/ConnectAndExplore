import express from "express";
import {
  body,
  param,
  validationResult,
} from "express-validator";
import { UserService } from "../services/UserService";
import { upload, deleteProfilePicture } from "../utils/FileUpload";
import { requiresAuthentication } from "./authentication";
import { userResource, userResourceNA } from "../Resources";
const UserRouter = express.Router();
const userService = new UserService();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with user data and an optional profile picture.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *              type: object
 *              properties:
 *                profilePicture:
 *                  type: string
 *                  example: []
 *                  format: binary
 *                email:
 *                  type: string
 *                  example: "John@doe.com"
 *                name[first]:
 *                  type: string
 *                  example: "Test"
 *                name[last]:
 *                  type: string
 *                  example: "User"
 *                password:
 *                  type: string
 *                  example: "12abcAB!"
 *                birthDate:
 *                  type: string
 *                  example: "2000-01-01"
 *                gender:
 *                  type: string
 *                  example: "Male"
 *                address[postalCode]:
 *                  type: string
 *                  example: "12345"
 *                address[city]:
 *                  type: string
 *                  example: "Berlin"
 *              required:
 *                - email
 *                - password
 *                - gender
 *                - birthDate
 *                - name[first]
 *                - name[last]
 *                - address[postalCode]
 *                - address[city]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IUser'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             example:
 *               error: User already exists
 *       500:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             example:
 *               error: Registration failed
 */
UserRouter.post(
  "/register",
  upload.single("profilePicture"),
  [
    body("email").isEmail(),
    body("name.first")
      .isString()
      .isLength({ min: 3, max: 100 })
      .withMessage("First name is required."),
    body("name.last")
      .isString()
      .isLength({ min: 3, max: 100 })
      .withMessage("Last name is required."),
    body("password").isStrongPassword(),
    body("isAdministrator").optional().isBoolean(),
    body("address.postalCode")
      .notEmpty()
      .withMessage("Postal code is required."),
    body("address.city").notEmpty().withMessage("City is required."),
    body("profilePicture").optional().isString(),
    body("birthDate").isDate(),
    body("gender").isString().notEmpty(),
    body("socialMediaUrls.facebook").optional().isString(),
    body("socialMediaUrls.instagram").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          // Delete the file
          deleteProfilePicture(req.file.path);
        }
        return res.status(400).json({ errors: errors.array() });
      } else {
        if (req.file) {
          req.body.profilePicture = `/${req.file.filename}`;
        }
        const newUser = await userService.registerUser(req.body);
        return res.status(201).json(newUser);
      }
    } catch (error) {
      if (error.message === "User already exists") {
        return res.status(409).json({ Error: "User already exists" });
      } else {
        return res.status(500).json({ Error: "Registration failed" });
      }
    }
  }
);
/**
 * @swagger
 * /api/users/{userid}:
 *   get:
 *     summary: "Get User"
 *     deprecated: false
 *     description: "Retrieve a user by ID"
 *     tags:
 *       - "User"
 *     parameters:
 *       - name: "userid"
 *         in: "path"
 *         required: true
 *         type: "string"
 *         description: "The ID of the user to retrieve"
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
 *                   example: "Invalid authorization, cannot get User."
 *       "404":
 *         description: "Not Found - Invalid userID"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 error:
 *                   type: "string"
 *                   example: "No user with this ID exists."
 *     security:
 *       - bearerAuth: []
 */
UserRouter.get(
  "/:userid",
  requiresAuthentication,
  param("userid").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userid = req.params.userid;
    if (req.role !== "a" && userid !== req.userId) {
      res.status(403);
      next(new Error("Invalid authorization, can not get User."));
    } else {
      try {
        const user: userResource = await userService.getUser(userid);
        res.status(200).json(user);
      } catch (err) {
        res.status(404);
        next(err);
      }
    }
  }
);
/**
 * @swagger
 * /api/users/user/{userid}:
 *   get:
 *     summary: "Get User without admin"
 *     deprecated: false
 *     description: "Retrieve a user by ID"
 *     tags:
 *       - "User"
 *     parameters:
 *       - name: "userid"
 *         in: "path"
 *         required: true
 *         type: "string"
 *         description: "The ID of the user to retrieve"
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
 *                   example: "Invalid authorization, cannot get User."
 *       "404":
 *         description: "Not Found - Invalid userID"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 error:
 *                   type: "string"
 *                   example: "No user with this ID exists."
 *     security:
 *       - bearerAuth: []
 */
UserRouter.get(
  "/user/:userid",
  param("userid").isMongoId(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userid = req.params.userid;
    try {
      const user: userResourceNA = await userService.getUserInfo(userid);
      res.status(200).json(user);
    } catch (err) {
      res.status(404);
      next(err);
    }
  }
);
/**
 * @swagger
 * /api/users/{userid}:
 *   put:
 *     summary: Update user details
 *     description: Update user details for a specific user.
 *     tags:
 *       - User
 *     parameters:
 *       - name: "userid"
 *         in: "path"
 *         required: true
 *         type: "string"
 *         description: "The ID of the user to update"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 example: []
 *                 format: binary
 *               email:
 *                 type: string
 *                 example: "John@doe.com"
 *               name[first]:
 *                     type: string
 *                     example: "Test"
 *               name[last]:
 *                     type: string
 *                     example: "User"
 *               password:
 *                 type: string
 *                 example: "12abcAB!12abcAB!"
 *               oldPassword:
 *                 type: string
 *                 example: "12abcAB!"
 *               birthDate:
 *                 type: string
 *                 example: "2000-01-01"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               address[postalCode]:
 *                 type: string
 *                 example: "12345"
 *               address[city]:
 *                 type: string
 *                 example: "Berlin"
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IUser'
 *       403:
 *         description: Invalid authorization
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid authorization, cannot update user
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               error: User not found
 *       500:
 *         description: Update failed
 *         content:
 *           application/json:
 *             example:
 *               error: Update failed
 */
UserRouter.put(
  "/:userid",
  requiresAuthentication,
  upload.single("profilePicture"),
  [param("userid").isMongoId()],
  // validate,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        // Delete the file
        deleteProfilePicture(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }
    const userid = req.params.userid;
    if (req.role === "a" || userid === req.userId) {
      const user: userResource = await userService.getUser(userid);

      try {
        if (req.file) {
          req.body.profilePicture = `/${req.file.filename}`;
          if (user.profilePicture) {
            deleteProfilePicture(user.profilePicture);
          }
        }
      } catch (err) {
        deleteProfilePicture(req.body.profilePicture);
        res.status(404).json({
          Error: "Can not delete Profile picture - no such file or directory",
        });
      }
    }
    //req.body.name = JSON.parse(req.body.name);
    const userResource = req.body as userResource; //matchedData(req) as userResource;
    userResource.id = userid;
    if (req.role === "a") {
      try {
        const updatedUser: userResource =
          await userService.updateUserWithAdmin(userResource);
        res.status(200).send(updatedUser);
      } catch (err) {
        res.status(404);
        next(err);
      }
    } else {
      if (req.userId !== userid) {
        res.status(403);
        next(new Error("Invalid authorization, can not update user."));
      } else {
        // To delete Profile picture in settings page
        try {
          if (req.body.deletePicture === "true") {
            if (userResource.profilePicture) {
              deleteProfilePicture(userResource.profilePicture);

              let oldPw!: string;
              const updatedUser = await userService.updateUserWithPw(
                userResource,
                oldPw
              );
              res.status(200).send(updatedUser);
            }
          }
        } catch (err) {
          res.status(404).json({
            Error: "Can not delete Profile picture - no such file or directory",
          });
        }

        try {
          let oldPw!: string;
          if (req.body.oldPassword) {
            oldPw = req.body.oldPassword;
          }
          const updatedUser = await userService.updateUserWithPw(
            userResource,
            oldPw
          );
          res.status(200).send(updatedUser);
        } catch (err) {
          res.status(403);
          next(new Error("Invalid authorization, probably invalid password."));
        }
      }
    }
  }
);
/**
 * @swagger
 * /api/users/{userid}:
 *   delete:
 *     summary: "Delete User"
 *     deprecated: false
 *     description: "Delete a user by ID"
 *     tags:
 *       - "User"
 *     parameters:
 *       - name: "userid"
 *         in: "path"
 *         required: true
 *         type: "string"
 *         description: "The ID of the user to delete"
 *     responses:
 *       "204":
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
 *                   example: "Invalid authorization, cannot delete user."
 *       "404":
 *         description: "Not Found - Probably invalid userid"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 error:
 *                   type: "string"
 *                   example: "Probably invalid userid, cannot delete user."
 *     security:
 *       - bearerAuth: []
 */

UserRouter.delete(
  "/:userid",
  requiresAuthentication,
  param("userid").isMongoId(),
  async (req, res, next) => {
    const userid = req.params.userid;
    try {
      if (req.role === "a") {
        const user: userResource = await userService.getUser(userid);
        const isDeleted: boolean = await userService.deleteUser(userid, false);
        try {
          if (user.profilePicture) {
            deleteProfilePicture(user.profilePicture);
          }
        } catch (err) {
          res.status(404).json({
            Error: "Can not delete Profile picture - no such file or directory",
          });
        }
        res.status(204).send(isDeleted);
      } else {
        if (req.userId === userid) {
          const user: userResource = await userService.getUser(userid);
          const isDeleted: boolean = await userService.deleteUser(userid, true);
          try {
            if (user.profilePicture) {
              deleteProfilePicture(user.profilePicture);
            }
          } catch (err) {
            res.status(404).json({
              Error:
                "Can not delete Profile picture - no such file or directory",
            });
          }
          res.status(204).send(isDeleted);
        } else {
          res.send(403);
          next(new Error("Invalid authorization, can not delete user."));
        }
      }
    } catch (err) {
      res.send(404);
      next(new Error("Probably invalid userid, can not delete user."));
    }
  }
);
export default UserRouter;
