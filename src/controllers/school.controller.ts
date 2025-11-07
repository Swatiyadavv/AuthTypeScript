import { Request, Response } from "express";
import School from "../models/school.model";
import { successResponse, errorResponse } from "../formatter/responseFormatter";

// 🟢 Add or Update School
export const addOrUpdateSchool = async (req: Request, res: Response) => {
  try {
    const {
      id,
      schoolName,
      shortDescription,
      urlEndpoint,
      status,
      promoTitle,
      promoDescription,
      promoMedia,
      usp,
      features,
      metaTitle,
      metaKeywords,
      metaDescription,
    } = req.body;

    // Basic Validation
    if (!schoolName || !shortDescription || !urlEndpoint || !metaTitle || !metaKeywords || !metaDescription) {
      return res.status(400).json(errorResponse("Required fields are missing."));
    }

    // Validate Features count
    if (features && (features.length < 4 || features.length > 8)) {
      return res.status(400).json(errorResponse("Features must be between 4 and 8."));
    }

    // Unique check
    const existingSchool = await School.findOne({
      $or: [{ schoolName }, { urlEndpoint }],
      _id: { $ne: id },
    });

    if (existingSchool) {
      return res.status(400).json(errorResponse("School name or URL endpoint already exists."));
    }

    let school;

    if (id) {
      // Update school
      school = await School.findByIdAndUpdate(
        id,
        {
          schoolName,
          shortDescription,
          urlEndpoint,
          status,
          promoTitle,
          promoDescription,
          promoMedia,
          usp,
          features,
          metaTitle,
          metaKeywords,
          metaDescription,
        },
        { new: true }
      );
      if (!school) return res.status(404).json(errorResponse("School not found"));
    } else {
      // Add school
      school = await School.create({
        schoolName,
        shortDescription,
        urlEndpoint,
        status,
        promoTitle,
        promoDescription,
        promoMedia,
        usp,
        features,
        metaTitle,
        metaKeywords,
        metaDescription,
      });
    }

    return res.status(200).json(
      successResponse(id ? "School updated successfully" : "School added successfully", school)
    );
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to add/update school", err));
  }
};

// 🟢 Get all schools
export const getAllSchools = async (_req: Request, res: Response) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    return res.status(200).json(successResponse("Schools fetched successfully", schools));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to fetch schools", err));
  }
};

// 🟢 Delete school
export const deleteSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await School.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json(errorResponse("School not found"));
    return res.status(200).json(successResponse("School deleted successfully"));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to delete school", err));
  }
};

export const searchSchools = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.query;

    const filter: any = {};

    // 🔍 Search by name or description (case-insensitive)
    if (name)
      filter.schoolName = { $regex: new RegExp(name as string, "i") };

    if (description)
      filter.shortDescription = { $regex: new RegExp(description as string, "i") };

    // 🎯 Filter by status if given
    if (status)
      filter.status = status;

    const schools = await School.find(filter).sort({ createdAt: -1 });

    return res
      .status(200)
      .json(successResponse("Schools fetched successfully", schools));
  } catch (err) {
    return res
      .status(500)
      .json(errorResponse("Failed to search schools", err));
  }
};