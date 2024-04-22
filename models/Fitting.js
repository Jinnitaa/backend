const mongoose=require('mongoose')
const FittingSchema=new mongoose.Schema({
    name:String,
    file: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    
    },
})

const FittingModel=mongoose.model("fitting", FittingSchema)
module.exports=FittingModel;