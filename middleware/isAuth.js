import jwt from "jsonwebtoken"
import { admin } from "../models/admin.js"

export const isAuth = async (req, res,next) => {
    try {
        const token = req.headers.token
        if (!token) {
            return res.status(403).json({
                message: "please login to access",
            })
        }
        const decodedData=jwt.verify(token,process.env.JWT_SECRET)
        const user= await admin.findById(decodedData._id)
        if(!user){
            return res.status(403).json({
                message: "User not Found..",
            }) 
        }
        if(user.role!=="admin"){
            return res.status(403).json({
                message: "Access denied. Admins only.",
            }) 
        }
        req.std=user
        next()
    } catch (error) {
        return res.status(403).json({
            message: "please login to access",
        })
    }
}