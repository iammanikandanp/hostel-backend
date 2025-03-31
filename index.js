import express from "express";
import dotenv from 'dotenv';
import connectdb from "./database/db.js";
import cors from "cors";
dotenv.config()

const app=express()
app.use(express.json())

app.use(cors())
import router from "./routes/stdreg.js"
app.use('/api/v1/',router)


const port = process.env.PORT || 5000;

 app.listen(port,()=>{
    console.log(`server running on http://localhost:${port}`)
    connectdb()
 })
