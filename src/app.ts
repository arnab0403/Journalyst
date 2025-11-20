import express,{Response,Request, application} from "express";
import dotenv from "dotenv";
import fyersRouter from "./routes/FyersRouter";
import zerodhaRouter from "./routes/ZerodhaRouter";
//@ts-ignore
import cors from "cors";

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json()); 


app.use("/api/zerodha/",zerodhaRouter);
app.use("/api/fyers/",fyersRouter);


app.listen(3000,()=>{
    console.log("Server started at PORT: 3000");
})