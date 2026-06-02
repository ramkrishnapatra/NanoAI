import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import "dotenv/config"
const connectDB=async ()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)  
      console.log(`\n mongoDb connected`)
    } catch (error) {
       console.log("mongodb connection error")
       process.exit(1) 
    }
}
export default connectDB