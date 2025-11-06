import { Router } from "express";
import { addOrUpdateUser, getAllUsers, deleteUser ,  searchUsers,} from "../controllers/user.controller";
import { verifyAccessToken } from "../middlewares/verifyAccessToken";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.use(verifyAccessToken); // All routes secured

router.post("/add-or-update", upload.single("picture"), addOrUpdateUser);
router.get("/", getAllUsers);
router.delete("/:id", deleteUser);
router.get("/search", verifyAccessToken, searchUsers);
export default router;
