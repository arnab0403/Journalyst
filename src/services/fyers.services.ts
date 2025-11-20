import { tradeNormalizers } from "../normalizer/TradeDataNormalize";
import fyers, { FYERS_APP_APP_ID, FYERS_APP_SECRECT_KEY } from "../adapter/fyersConnect";
import { Response,Request } from "express";
import { getUserToken, saveUserToken } from "../utility/tokeStore";
import dotenv from "dotenv"

dotenv.config();


// getting the authcode by redirecting to fyers url 
export function getAuthCode(req:Request,res:Response){
    try{
    
        fyers.setAppId("0J8KB7A8QA-100");

        fyers.setRedirectUrl("http://192.168.0.245:3000/api/fyers/redirecturl");
        console.log("Hi");
        const URL=fyers.generateAuthCode()
        console.log(URL);

        res.redirect(URL);
    }catch(error){
        console.log(error);
    }

}


// setting the auth code 
export const setAccessToken =async (req:Request,res:Response)=>{
    try {
        const authCode=req.query.auth_code;
        
        const response = await fyers.generate_access_token({"client_id":FYERS_APP_APP_ID,"secret_key":FYERS_APP_SECRECT_KEY,"auth_code":authCode})
        console.log("response line38",response);
        const access_token = response.access_token;
        
        fyers.setAccessToken(response.access_token);


        const profile = await fyers.get_profile();
        console.log("profile line40",profile);
        const userId = profile.data.fy_id;

        // saving the token in storage
        saveUserToken(userId,access_token);

  
    
        res.status(200).json({
            message:"Auth code genarated successfully now you can use any functionality",
            status:"success"
        })
    } catch (error) {
        console.log(error);
    }
}

export const getDailyOrders=async(req:Request,res:Response)=>{
    try {
        
        // geting the user id and broker name
        const userId=req.body?.user_id;
        const brokerName = req.body?.broker_name;
        
        console.log(`from body ${userId}`,brokerName);

        if (brokerName!=="fyers") {
            return res.status(400).json({
                message:"Wrong broker name",
                status:"failed"
            })
        }

        const access_token = getUserToken(userId);
        
        if (!access_token) {
            return res.redirect("/api/fyers/login");
        }

        console.log(access_token);
        await fyers.setAccessToken(access_token);   
        
        const order = await fyers.get_orders();
        const oders = order.orderBook;
        const fyersNormalizer=tradeNormalizers["fyers"];
        const normalizeOrders = oders.map((o:any)=>fyersNormalizer(o));
         
        res.status(200).json({
            message:"Current day orders",
            status:"success",
            order:normalizeOrders
        })
    } catch (error) {
        console.log(error);   
    }
}
