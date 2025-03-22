import mongoose from "mongoose";

const schema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },

    role:{
        type:String,
        default:"admin"
    },
},{timestamps:true})  
export const admin = mongoose.model("admin",schema)