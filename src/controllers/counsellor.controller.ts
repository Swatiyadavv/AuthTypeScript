import { Request, Response } from "express";
import Counsellor from "../models/counsellor.model";
import { successResponse, errorResponse } from "../formatter/responseFormatter";

// 🟢 Add or Update Counsellor
export const addOrUpdateCounsellor = async (req: Request, res: Response) => {
  try {
    const {
      id,
      profilePic,
      name,
      email,
      phone,
      isGeneral,    
      bindToSchools,
      enableVirtualCounselling,
      availability,
      status,
    } = req.body;

    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json(errorResponse("Required fields are missing."));
    }

    // Email unique check
    const existing = await Counsellor.findOne({ email, _id: { $ne: id } });
    if (existing) return res.status(400).json(errorResponse("Email already exists."));

    // Validation rules for virtual counselling
    if (enableVirtualCounselling && (!availability || availability.length === 0)) {
      return res.status(400).json(errorResponse("Availability is required for virtual counselling."));
    }

    // If "General Counsellor" is true, clear bindToSchools
    const schoolsToBind = isGeneral ? [] : bindToSchools;

    let counsellor;

    if (id) {
      counsellor = await Counsellor.findByIdAndUpdate(
        id,
        {
          profilePic,
          name,
          email,
          phone,
          isGeneral,
          bindToSchools: schoolsToBind,
          enableVirtualCounselling,
          availability: enableVirtualCounselling ? availability : [],
          status,
        },
        { new: true }
      );
      if (!counsellor) return res.status(404).json(errorResponse("Counsellor not found."));
    } else {
      counsellor = await Counsellor.create({
        profilePic,
        name,
        email,
        phone,
        isGeneral,
        bindToSchools: schoolsToBind,
        enableVirtualCounselling,
        availability: enableVirtualCounselling ? availability : [],
        status,
      });
    }

    return res
      .status(200)
      .json(successResponse(id ? "Counsellor updated successfully" : "Counsellor added successfully", counsellor));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to add/update counsellor", err));
  }
};

// 🟢 Get All Counsellors
export const getAllCounsellors = async (_req: Request, res: Response) => {
  try {
    const counsellors = await Counsellor.find().populate("bindToSchools").sort({ createdAt: -1 });
    return res.status(200).json(successResponse("Counsellors fetched successfully", counsellors));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to fetch counsellors", err));
  }
};

// 🟢 Search Counsellor
export const searchCounsellors = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, status } = req.query;
    const filter: any = {};

    if (name) filter.name = { $regex: new RegExp(name as string, "i") };
    if (email) filter.email = { $regex: new RegExp(email as string, "i") };
    if (phone) filter.phone = { $regex: new RegExp(phone as string, "i") };
    if (status) filter.status = status;

    const counsellors = await Counsellor.find(filter).populate("bindToSchools").sort({ createdAt: -1 });
    return res.status(200).json(successResponse("Counsellors fetched successfully", counsellors));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to search counsellors", err));
  }
};

// 🟢 Delete Counsellor
export const deleteCounsellor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Counsellor.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json(errorResponse("Counsellor not found"));
    return res.status(200).json(successResponse("Counsellor deleted successfully"));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to delete counsellor", err));
  }
};

// 🟢 Toggle Active/Inactive
export const toggleCounsellorStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const counsellor = await Counsellor.findById(id);
    if (!counsellor) return res.status(404).json(errorResponse("Counsellor not found"));

    counsellor.status = counsellor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await counsellor.save();

    return res.status(200).json(successResponse("Counsellor status updated successfully", counsellor));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to update status", err));
  }
};
