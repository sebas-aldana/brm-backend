import express from "express";
import { body } from "express-validator";
const router = express.Router();
import { register, login } from "../controllers/auth.js";

/**
 * @api {post} /auth/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Authentication
 *
 * @apiBody {String} name User's full name
 * @apiBody {String} email User's email address
 * @apiBody {String{6,}} password User's password (min 6 characters)
 * @apiBody {String="admin","cliente"} [role=cliente] User's role (optional, defaults to "cliente")
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} user User object
 * @apiSuccess {Number} user.id User ID
 * @apiSuccess {String} user.name User's full name
 * @apiSuccess {String} user.email User's email
 * @apiSuccess {String} user.role User's role
 *
 * @apiError (400) {Object} error Error object with validation messages
 * @apiError (400) {String} error.message Error message
 * @apiError (500) {Object} error Server error
 */
router.post(
  "/register",
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  register
);

/**
 * @api {post} /auth/login User Login
 * @apiName UserLogin
 * @apiGroup Authentication
 *
 * @apiBody {String} email User's email address
 * @apiBody {String} password User's password
 *
 * @apiSuccess {String} token JWT token for authentication
 *
 * @apiError (400) {Object} error Error object with validation messages
 * @apiError (401) {Object} error Unauthorized - Invalid credentials
 * @apiError (500) {Object} error Server error
 */

router.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  login
);

export default router;
