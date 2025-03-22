import mongoose from "mongoose"
const Schema = new mongoose.Schema({
    date:{
        type:String,
        required:true,
    },
    sno:{
        type:String,
        required:true,
    },
    roomno:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
        required:true,
    },
    issuse:{
        type:String,
        required:true,
    },
})

export const complaint = mongoose.model("complaint",Schema)