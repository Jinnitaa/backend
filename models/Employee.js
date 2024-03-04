const mongoose=require('mongoose')
const EmployeeSchema=new mongoose.Schema({
    name:String,
    file: String,
    department:String,
    jobTitle:String,
    email:String,
    telegram:String,
    
})

const EmployeeModel=mongoose.model("employee", EmployeeSchema)
module.exports=EmployeeModel;