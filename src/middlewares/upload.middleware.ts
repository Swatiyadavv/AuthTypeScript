import multer from 'multer';
import path from "path";
import fs from "fs";

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, fileName);
  },
});

export const upload = multer({ storage });
