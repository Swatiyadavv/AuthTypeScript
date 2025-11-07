import { Router } from "express";
import {
  addOrUpdateCounsellor,
  getAllCounsellors,
  deleteCounsellor,
  searchCounsellors,
  toggleCounsellorStatus,
} from "../controllers/counsellor.controller";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";

const router = Router();

router.use(verifyAccessToken);

router.post("/add-or-update", addOrUpdateCounsellor);
router.get("/all", getAllCounsellors);
router.get("/search", searchCounsellors);
router.delete("/:id", deleteCounsellor);
router.patch("/toggle-status/:id", toggleCounsellorStatus);

export default router;
