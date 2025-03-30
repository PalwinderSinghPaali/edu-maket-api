import util from "util";
import multer from "multer";
const maxSize = 200 * 1024 * 1024;
import path from "path";
import { application } from "express";

// Allowed MIME Types (Whitelist)
const ALLOWED_MIME_TYPES = ["image/jpg","image/jpeg", "image/png", "application/pdf", "application/doc", "application/docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ,"application/zip", "video/mp4", "video/webm" ,"video/x-msvideo", "video/mpeg", "video/ogg", "application/zip", "application/x-zip-compressed"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".zip", ".mp4", ".webm", ".avi", ".mpeg", ".ogv", ".zip"];
const MAX_FILENAME_LENGTH = 100;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./upload");
    },
    filename: (req, file, cb) => {
      let sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_"); 
      sanitizedFilename = sanitizedFilename.trim(); 
      sanitizedFilename = sanitizedFilename.replace(/\.+$/, ""); 
      
      if (sanitizedFilename.length > MAX_FILENAME_LENGTH) {
          return cb(new multer.MulterError("LIMIT_FIELD_VALUE", "Filename too long"), "");
      }

      if (/\.(php|exe|sh|bat|js|jsp|asp|aspx|rb|py)(\..+)?$/i.test(sanitizedFilename)) {
          return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Forbidden file extension"), "");
      }

      if (/\.[^.]+\.[^.]+$/.test(sanitizedFilename)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE","Invalid file name format (double extension)"), "");
    }

      cb(null, `${Date.now()}-${sanitizedFilename}`);
    },
  });
  

  const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(mimeType)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type"));
    }


    // if (/\.[^.]+\.[^.]+$/.test(file.originalname)) {  
    //     return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file name format (double extension)"));
    // }
  
    cb(null, true);
};
  
  let uploadFile = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  }).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
export default uploadFileMiddleware;