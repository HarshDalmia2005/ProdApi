import { eq } from "drizzle-orm";
import db from "../config/database.js";
import { users } from "../models/user.model.js";
import bcrypt from "bcrypt";
import logger from "../config/logger.js";

export const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.info("Error comparing passwords:", error);
    throw error;
  }
};

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.info("Error hashing password:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));
    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }
    const hashedPassword = await hashPassword(userData.password);
    const newUser = { ...userData, password: hashedPassword };
    const [createdUser] = await db.insert(users).values(newUser).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });
    logger.info("User created successfully:", createdUser);
    return createdUser;
  } catch (error) {
    logger.info("Error creating user:", error);
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  } catch (error) {
    logger.info("Error finding user:", error);
    throw error;
  }
};

export const verifyCredentials = async (email, password) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    logger.info("Error verifying credentials:", error);
    throw error;
  }
};
