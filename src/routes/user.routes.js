import { Router } from "express";
import { loginuser, logoutuser, registerUser,refreshaccesstoken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


// import multer from "../middlewares/multer.js";

const router = Router()

router.route("/register").post(
    upload.fields([
      {
        name:"avatar",
        maxCount:1
      },
      {
        name:"coverImage",
        maxCount:1
      }
    ]),
    (req, res, next) => {
    console.log("Multer processed files:", req.files);
    console.log("Request body:", req.body);
    next(); // Continue to registerUser
    },
    registerUser)



router.route("/login").post(loginuser)


router.route("/logout").post(verifyJWT,logoutuser)

router.route("/refresh-token").post(refreshaccesstoken)

export default router