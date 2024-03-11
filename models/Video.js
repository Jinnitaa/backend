
const mongoose=require('mongoose')
const VideoSchema = new mongoose.Schema({
    title: String,
    link: String,
    
  });

const VideoModel=mongoose.model("video", VideoSchema)
module.exports=VideoModel;