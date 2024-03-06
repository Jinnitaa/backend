const mongoose=require('mongoose')
const MessageSchema=new mongoose.Schema({
    name:String,
    email: String,   
    number: String, 
    message: String, 
})

const MessageModel=mongoose.model("message", MessageSchema)
module.exports=MessageModel;