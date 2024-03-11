
const mongoose=require('mongoose')
const VideoSchema = new mongoose.Schema({
    title: String,
    description: String,
    link: String,
    
  });

const VideoModel=mongoose.model("video", VideoSchema)
module.exports=VideoModel;