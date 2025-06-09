import { v2 as cloudinary } from "cloudinary";

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dbiagftww",
        api_key: process.env.CLOUDINARY_API_KEY || "745175226367569",
        api_secret: process.env.CLOUDINARY_API_SECRET || "LM_zOaQQG4Fzr9FEmQVi1QjjOEc",
        secure: true
    }
)

export default cloudinary