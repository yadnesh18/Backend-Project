import mongoose from moongoose 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new moongoose.Schema({
      videoFIle:{
        type:String,
        required:true,
      },
      thumbnail:{
        type:String,
        required:true,
      },
      title:{
        type:String,
        required:true,
      },
      description:{
        type:String,
        required:true,
      },
       duration:{
        type:Number,
        required:true,
      },
      views:{
        type:Number,
        default:0,
      },
      isPublished:{
        type:Boolean,
        default:true,
      },
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
      }
},{timestamps:true})    


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = moongoose.model("Video",videoSchema)