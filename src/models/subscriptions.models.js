import moongoose from "moongoose"
import { User } from "./user.models"


const subscriptionschema = new moongoose.Schema({
     subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
     },
     channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
     }

},{timestamps:true})



export const Subscription = moongoose.model("Subscription",subscriptionschema)