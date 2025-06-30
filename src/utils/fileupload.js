import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// import dotenv from "dotenv";
import {upload} from "../middlewares/multer.js"

// dotenv.config({path:".env"});  



console.log("Cloudinary config loaded:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "❌",
});



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadonCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("File is uploaded", response.url);
    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error?.message || error);
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    return null;
  }
};

export default UploadonCloudinary;
