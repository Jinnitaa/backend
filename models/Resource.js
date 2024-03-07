
const mongoose=require('mongoose')
const ResourceSchema = new mongoose.Schema({
    filename: String,
    path: String,
  });

const ResourceModel=mongoose.model("resource", ResourceSchema)
module.exports=ResourceModel;