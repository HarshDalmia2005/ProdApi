import logger from "../config/logger.js";
import { createUser, verifyCredentials } from "../services/auth.service.js";
import { formatValidation } from "../utils/format.js";
import { signupSchema, signinSchema } from "../validations/auth.validation.js";
import { jwttoken } from "../utils/jwt.js";
import { cookies } from "../utils/cookies.js";

export const signup = async (req, res, next) => {
  try {
    const validationRes = signupSchema.safeParse(req.body);
    if (!validationRes.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidation(validationRes.error),
      });
    }

    const user = await createUser(validationRes.data);
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, "token", token);

    logger.info(`User Registered Successfully:${user.email}`);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("SignUp Error", error);
    if (error.message === "User with this email already exists") {
      return res.status(409).json({ error: "Email already exist" });
    }

    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationRes = signinSchema.safeParse(req.body);
    if (!validationRes.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidation(validationRes.error),
      });
    }

    const { email, password } = validationRes.data;
    const user = await verifyCredentials(email, password);

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, "token", token);

    logger.info(`User Signed in Successfully: ${email}`);
    res.status(200).json({
      message: "Signed in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("SignIn Error", error);
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    next(error);
  }
};

export const signout = async (req, res) => {
  cookies.clear(res, "token");
  res.status(200).json({ message: "Signed out successfully" });
};
