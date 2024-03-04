const mongoose=require('mongoose')
const FittingSchema=new mongoose.Schema({
    name:String,
    file: String,   
})

const FittingModel=mongoose.model("fitting", FittingSchema)
module.exports=FittingModel;