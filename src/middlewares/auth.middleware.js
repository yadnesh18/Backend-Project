import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
     try {
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
   
   
        if(!token){
           throw new ApiError("No Token")
        }
   
   
   
         const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
         const user = await User.findById(decodedtoken?._id).select("-password -refreshToken")
   
         if(!user){
           throw new ApiError("Invalid access token")
         }
   
        req.user = user;
        next()
     } catch (error) {
        throw new ApiError("error.message")
     }

})