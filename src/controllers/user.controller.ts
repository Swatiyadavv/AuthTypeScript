import { Request, Response } from "express";
import User from "../models/user.model";
import { successResponse, errorResponse } from "../formatter/responseFormatter";
import { UserRole } from "../enums/role.enum";

// 🟢 ADD or UPDATE User
export const addOrUpdateUser = async (req: Request, res: Response) => {
  try {
    // 🔹 Extract fields safely (handles single or array values)
    const rawBody = req.body as Record<string, any>;
    const id = Array.isArray(rawBody.id) ? rawBody.id[0] : rawBody.id;
    const name = Array.isArray(rawBody.name) ? rawBody.name[0] : rawBody.name;
    const email = Array.isArray(rawBody.email) ? rawBody.email[0] : rawBody.email;
    const role = Array.isArray(rawBody.role) ? rawBody.role[0] : rawBody.role;
    const employeeId = Array.isArray(rawBody.employeeId)
      ? rawBody.employeeId[0]
      : rawBody.employeeId;
    const activeValue = Array.isArray(rawBody.active)
      ? rawBody.active[0]
      : rawBody.active;
    const active =
      typeof activeValue === "boolean"
        ? activeValue
        : activeValue === "true" || activeValue === "1";

    const picture = req.file ? `/uploads/${req.file.filename}` : undefined;

    // 🔹 Validation
    if (!name || !email || !role) {
      return res
        .status(400)
        .json(errorResponse("Name, email, and role are required"));
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json(errorResponse("Invalid role"));
    }

    let user;

    if (id) {
      // ✅ Update existing user
      user = await User.findByIdAndUpdate(
        id,
        { name, email, role, employeeId, picture, active },
        { new: true }
      );
      if (!user) {
        return res.status(404).json(errorResponse("User not found"));
      }
    } else {
      // ✅ Add new user
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json(errorResponse("Email already exists"));
      }

      user = await User.create({
        name,
        email,
        role,
        employeeId,
        picture,
        active,
      });
    }

    return res.status(200).json(
      successResponse(
        id ? "User updated successfully" : "User added successfully",
        user
      )
    );
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to add/update user", err));
  }
};


// 🟢 GET all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json(successResponse("Users fetched successfully", users));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to fetch users", err));
  }
};

// 🟢 DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json(errorResponse("User not found"));
    return res.status(200).json(successResponse("User deleted successfully"));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to delete user", err));
  }
};
// 🟢 SEARCH users (by name, email, role, active status, etc.)
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, role, employeeId, active } = req.query;

    // Build filter dynamically
    const filter: any = {};

    if (name) filter.name = { $regex: new RegExp(name as string, "i") };
    if (email) filter.email = { $regex: new RegExp(email as string, "i") };
    if (employeeId) filter.employeeId = { $regex: new RegExp(employeeId as string, "i") };
    if (role) filter.role = role; // must match enum
    if (active !== undefined) filter.active = active === "true";

    const users = await User.find(filter).sort({ createdAt: -1 });

    return res
      .status(200)
      .json(successResponse("Users fetched successfully", users));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to search users", err));
  }
};
