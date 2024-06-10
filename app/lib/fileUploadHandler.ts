// utils/fileUploadHandler.ts
import multer from "multer";

// Configure Multer to store uploaded files in the 'uploads/' directory
const upload = multer({ dest: "uploads/" });

export const uploadMiddleware = upload.single("file");
