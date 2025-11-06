import { Router } from "express";
import {
  addOrUpdateSubject,
  getSubjects,
  removeSubject,
  findSubjects,
} from "../controllers/subject.controller";

const router = Router();

router.post("/add-update", addOrUpdateSubject);
router.get("/", getSubjects);
router.get("/search", findSubjects);
router.delete("/:id", removeSubject);

export default router;
