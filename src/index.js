import dotenv from "dotenv";
import express from "express"
import app from "./app.js"; 


dotenv.config({ path: ".env" });


import connectDB from "./db/index.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () =>
    {
        console.log(`server is running at port at ${process.env.PORT} `)
    })}).catch((error)=>{
        console.log("server is not running",error)
    })




