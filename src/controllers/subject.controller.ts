import { Request, Response } from "express";
import {
  findSubjectByName,
  findSubjectById,
  createSubject,
  updateSubject,
  getAllSubjects,
  deleteSubject,
  searchSubjects,
} from "../helpers/subject.helper";

// 🟢 ADD or UPDATE Subject
export const addOrUpdateSubject = async (req: Request, res: Response) => {
  try {
    const { id, subjectName } = req.body;

    if (!subjectName) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    let subject;

    if (id) {
      // ✅ Update existing subject
      subject = await updateSubject(id, { subjectName });
      if (!subject)
        return res.status(404).json({ success: false, message: "Subject not found" });
    } else {
      // ✅ Add new subject
      const existing = await findSubjectByName(subjectName);
      if (existing)
        return res.status(400).json({ success: false, message: "Subject already exists" });
      subject = await createSubject({ subjectName });
    }

    return res.status(200).json({
      success: true,
      message: id ? "Subject updated successfully" : "Subject added successfully",
      data: subject,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to add/update subject",
      error: err.message,
    });
  }
};

// 🟢 GET all subjects
export const getSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await getAllSubjects();
    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      data: subjects,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: err.message,
    });
  }
};

// 🟢 DELETE subject
export const removeSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSubject(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Subject not found" });
    return res.status(200).json({ success: true, message: "Subject deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: err.message,
    });
  }
};

// 🟢 SEARCH subjects
export const findSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await searchSubjects(req.query);
    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      data: subjects,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to search subjects",
      error: err.message,
    });
  }
};
