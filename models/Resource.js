
const mongoose=require('mongoose')
const ResourceSchema = new mongoose.Schema({
    title: String,
    filename: String,
    path: String,
  });

const ResourceModel=mongoose.model("resource", ResourceSchema)
module.exports=ResourceModel;