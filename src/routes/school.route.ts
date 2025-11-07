import { Router } from "express";
import { addOrUpdateSchool, getAllSchools, deleteSchool,searchSchools } from "../controllers/school.controller";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";

const router = Router();

router.use(verifyAccessToken);

router.post("/add-or-update", addOrUpdateSchool);
router.get("/all", getAllSchools);
router.delete("/:id", deleteSchool);
router.get("/search", searchSchools);

export default router;
