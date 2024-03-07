
const mongoose=require('mongoose')
const ResourceSchema = new mongoose.Schema({
    title: String,
    file: String,
    
  });

const ResourceModel=mongoose.model("resource", ResourceSchema)
module.exports=ResourceModel;