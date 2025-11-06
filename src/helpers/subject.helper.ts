import Subject, { ISubject } from "../models/subject.model";

// 🔹 Find subject by name
export const findSubjectByName = async (name: string): Promise<ISubject | null> => {
  return await Subject.findOne({ subjectName: name });
};

// 🔹 Find subject by ID
export const findSubjectById = async (id: string): Promise<ISubject | null> => {
  return await Subject.findById(id);
};

// 🔹 Create new subject
export const createSubject = async (data: Partial<ISubject>): Promise<ISubject> => {
  return await Subject.create(data);
};

// 🔹 Update existing subject
export const updateSubject = async (id: string, data: Partial<ISubject>): Promise<ISubject | null> => {
  return await Subject.findByIdAndUpdate(id, data, { new: true });
};

// 🔹 Get all subjects
export const getAllSubjects = async (): Promise<ISubject[]> => {
  return await Subject.find().sort({ createdAt: -1 });
};

// 🔹 Delete subject
export const deleteSubject = async (id: string): Promise<ISubject | null> => {
  return await Subject.findByIdAndDelete(id);
};

// 🔹 Search subjects dynamically
export const searchSubjects = async (query: any): Promise<ISubject[]> => {
  const filter: any = {};
  if (query.subjectName)
    filter.subjectName = { $regex: new RegExp(query.subjectName as string, "i") };
  return await Subject.find(filter).sort({ createdAt: -1 });
};
