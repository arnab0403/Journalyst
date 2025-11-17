import express,{Response,Request, application} from "express";
import dotenv from "dotenv";

import { API_KEY, API_SECRET_KEY, kc } from "./adapter/kiteConnect";
import syncTrdes from "./services/SyncTrades";
import getAccessToken from "./services/GetAccessToken";
import { getUserToken, removeUserToken } from "./utility/tokeStore";


dotenv.config();



const app = express();


const apiKey:String = API_KEY;
const apiSecret:String = API_SECRET_KEY;  




app.use(express.json()); 

app.get("/login",async (req:Request,res:Response)=>{


    // by this we can scale it 
    // const brokerName = req.body.brokerName;
    // if (brokerName==="zerodha") {
    //     const loginUrl = kc.getLoginURL();
    // }
    try {    
        const loginUrl = kc.getLoginURL();
        res.redirect(loginUrl);
        res.status(200);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Internal server error",
            status:"failed"
        });
    }

})




app.get("/redirecturl",getAccessToken);


app.get("/sync",syncTrdes);


app.post("/logout",(req:Request,res:Response)=>{
    const userId = req.body.user_id; // we need to get the user_id from the request body 
    const accessToken = String(getUserToken(userId));
    kc.invalidateAccessToken(accessToken);
    removeUserToken(userId);
    res.status(200).json({
        message:"User logout successfully",
        status:"success"
    })
})




app.listen(3000,()=>{
    console.log("Server started at PORT: 3000");
})