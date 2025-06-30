import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import UploadonCloudinary from "../utils/fileupload.js";
import ApiResponse from "../utils/ApiResponse.js";  
import jwt from "jsonwebtoken"


const generateaccessandrefreshtoken = async(userId)=>{
   try {
      const user = await User.findOne
      const accessToken= user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
       
      user.refreshToken = refreshToken 
      await user.save({validateBeforeSave:false})
       

      return {accessToken,refreshToken}

   } catch (error) {
      throw new ApiError(500,"Something went wrong while generating tokens")
   }
}



const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  //validation--not empty
  //check if the user is already registered or not
  //check for avatar
  //upload images to cloudinary
  //create new object -- create entry in database
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { fullname, email, username, password } = req.body;
  if (!fullname) {
    throw new ApiError(400, "Fullname is required");
  }
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const exisitinguser = await User.findOne({
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  });

  if (exisitinguser) {
    throw new ApiError(409, "User with same email or username already exist");
  }

  
  console.log("req.files:", req.files);   

  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  const coverimagelocalpath = req.files?.coverImage?.[0]?.path;

  console.log("Avatar path:", avatarlocalpath);


  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar file is required");
  }

    
    if(!avatarlocalpath) {
        throw new ApiError(400, "Avatar is required")
    }


    console.log("Incoming request body:", req.body);
    console.log("Incoming files:", req.files);
    console.log("Avatar path:", avatarlocalpath);
    console.log("Cover path:", coverimagelocalpath);


  const avatar = await UploadonCloudinary(avatarlocalpath);
  if (!avatar) {
  throw new ApiError(500, "Avatar upload failed");
  } 
  const coverImage = await UploadonCloudinary(coverimagelocalpath);


  console.log(avatar.url)

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new ApiError(500, "Something went wrong while registering user ");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "User registered succesfully"));
});

export { registerUser };



//login user

const loginuser = asyncHandler(async(req,res)=>{
    const {username,password} = req.body    
    
    if (!username) {
        throw new ApiError(400,"Username is necessary")
    }
   
    const user = await User.findOne({username})
    
    if(!user){
      throw new ApiError(400,"User doesnt exist")
    }

    const isPassword = await user.isPasswordCorrect(password)
    if(!isPassword){
      throw new ApiError(400,"Password is incorrect")
    } 

    const {refreshToken,accessToken}= await generateaccessandrefreshtoken(user._id)

    const loggedinuser = User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly:true,
      secure:true
    }
   
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)


})


 const logoutuser = asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refreshToken:undefined
          }
        }
     )
     const options = {
      httpOnly:true,
      secure:true
    }
    return response.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new ApiResponse(200,{},"User logout successfully")
    )
 })
 


 const refreshaccesstoken = asyncHandler(async(req,res)=>{
        const incomingrefreshToken =   req.cookie.refreshToken || req.body.refreshToken
             if(!incomingrefreshToken){
              throw new ApiError(401,"Unauthorized request")
             }

             
            try {
              const decodedtoken = jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
              const user = await User.findById(decodedtoken?._id)
              
              if(!user){
                throw new ApiError(401,"Invalid refresh token")
              }
              
  
              if (incomingrefreshToken !== user?.refreshToken) {
                  throw new ApiError(401,"Refresh token is expired or used")
              }
  
              const options = {
                httpOnly:true,
                secure:true
              }
  
  
             const {accessToken,newrefreshToken} =  await generateaccessandrefreshtoken(user._id)
  
              return res
              .status(200)
              .cookie("accessToken",accessToken,options)
              .cookie("refreshToken",newrefreshToken,options)
              .json(
                new ApiResponse(
                  200,
                  {accessToken,newrefreshToken},
                  "Access token refreshed"
                )
              )
  
            } catch (error) {
                throw new  ApiError(404,error?.message || "Invalid refresh token")
            }



      
 })

   const changecurrentpassword = asyncHandler(async(req,res)=>{
         const {newpassword,oldpassword}=req.body

         const user = await User.findById(req.user?._id)

         const ispasswordCorrect = await user.isPasswordCorrect(oldpassword)

         user.password = newpassword
         await user.save({validateBeforeSave:false})

         return res.status(200).json(
          new ApiResponse(
            200,{},"Password changed successfully"
          )
         )
            
   })


   const getcurrentuser = asyncHandler(async(req,res)=>{
          return res.status(200).json(
            
            new ApiResponse(200,req.user,"Current user fetched successfully")
          )
   })


   const updateAccountdetails = asyncHandler(async()=>{
        const{fullname,email}= req.body
        if(!fullname || !email){
          throw new ApiError(400,"All fields are required")
        }

  const user =await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set:{
              fullname:fullname,
              email:email
            }
          },
          {new:true}
   ).select("-password")

   return res.status(200).json(
    new ApiResponse(200,user,"Account details updated")
   )
   }
   )

   const updateUseravatar = asyncHandler(async(req,res)=>{
         const avatarlocalpath=req.file?.path
          
         if(!req.file?.path){
          throw new ApiError("Avatar file is missing")
         }

        const avatar=  await UploadonCloudinary(avatarlocalpath)
         
        if(!avatar.url){
          throw new ApiError("Error while uploading avatar")
         }

        const user = await User.findByIdAndUpdate(
           req.user?._id,
           {
            set:{
              avatar:avatar.url
            }
           },
           {new:true}

        ).select("-password")

         return response.status(200).json(
          new ApiResponse(
          200,
          {user},
          "Avatar updated"
          )
        )


   })


   const updateUsercoverImage = asyncHandler(async(req,res)=>{
         const coverImagelocalpath=req.file?.path
          
         if(!req.file?.path){
          throw new ApiError("Cover Image file is missing")
         }

        const coverImage=  await UploadonCloudinary(coverImagelocalpath)
         
        if(!coverImage.url){
          throw new ApiError("Error while uploading coverImage")
         }

        const user = await User.findByIdAndUpdate(
           req.user?._id,
           {
            set:{
              coverImage:coverImage.url
            }
           },
           {new:true}

        ).select("-password")


        return response.status(200).json(
          new ApiResponse(
          200,
          {user},
          "Cover Image updated"
          )
        )


   })
    


export {loginuser}
export {logoutuser}
export {refreshaccesstoken}
export {changecurrentpassword}
export {getcurrentuser}
export {updateAccountdetails}
export {updateUseravatar}
export {updateUsercoverImage}