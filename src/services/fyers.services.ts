import { tradeNormalizers } from "../normalizer/TradeDataNormalize";
import fyers, { FYERS_APP_APP_ID, FYERS_APP_SECRECT_KEY } from "../adapter/fyersConnect";
import { Response,Request, NextFunction } from "express";
import { getUserToken, saveUserToken } from "../utility/tokeStore";
import dotenv from "dotenv"

dotenv.config();


export const validateUserMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    try {
        // geting the user id and broker name
        const userId=req.body?.user_id;
        const brokerName = req.body?.broker_name;

        // edge cases
        if (!brokerName || !userId) {
            return res.status(400).json({
                message:"Broker name or user id is missing",
                status:"failed"
            })
        }
        
        // edge cases
        if (brokerName!=="fyers") {
            return res.status(400).json({
                message:"Wrong broker name",
                status:"failed"
            })
        }

        const access_token = getUserToken(userId);
        
        // edge cases
        if (!access_token) {
            return res.redirect("/api/fyers/login");
        }

        req.body.access_token=access_token;
        next();
    } catch (error) {
        res.status(500).json({
            message:"Internal server error",
            status:"failed"
        })
        console.log(error);
    }
}

// getting the authcode by redirecting to fyers url 
export function getAuthCode(req:Request,res:Response){
    try{
    
        fyers.setAppId(FYERS_APP_APP_ID);

        fyers.setRedirectUrl("http://192.168.0.245:3000/api/fyers/redirecturl");
        const URL=fyers.generateAuthCode();

        res.redirect(URL);
    }catch(error){
        res.status(500).json({
            message:"Internal server error",
            status:"failed"
        })
        console.log(error);
    }

}


// setting the auth code 
export const setAccessToken =async (req:Request,res:Response)=>{
    try {
        const authCode=req.query.auth_code;

        // genarating the access token
        const response = await fyers.generate_access_token({"client_id":FYERS_APP_APP_ID,"secret_key":FYERS_APP_SECRECT_KEY,"auth_code":authCode})
        const access_token = response.access_token;
        
        fyers.setAccessToken(response.access_token);

        // getting the profile for user_id -> to map the token and user id 
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
        const access_token = req.body.access_token;
        
        // setting the access token before any call
        await fyers.setAccessToken(access_token);   

        // getting the orders
        const order = await fyers.get_orders();
        const oders = order.orderBook;
        console.log(order);
        // getting the normalizer & maping it
        const fyersNormalizer=tradeNormalizers["fyers"];
        const normalizeOrders = oders.map((o:any)=>fyersNormalizer(o));
        

        res.status(200).json({
            message:"Current day orders",
            status:"success",
            order:normalizeOrders
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Internal server error",
            status:"failed",
        })
    }
}

// export const placeOrder = async(req:Request,res:Response)=>{
//     try {
//         const access_token = req.body.access_token;
        
//         // setting the access token before any call
//         await fyers.setAccessToken(access_token);   

//         const reqBody={ 
//             "symbol": "NSE:TEXINFRA-EQ", 
//             "qty": 1, 
//             "type": 2, 
//             "side": 1, 
//             "productType": "INTRADAY", 
//             "limitPrice": 0, 
//             "stopPrice": 0, 
//             "validity": "DAY", 
//             "stopLoss": 0, 
//             "takeProfit": 0, 
//             "offlineOrder": false, 
//             "disclosedQty": 0 
//         }

//         const response = await fyers.place_order(reqBody);
//         console.log(response);
//         res.status(200).json({
//             message:"order successful",
//             status:"success",
//             data:response
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message:"Internal server error",
//             status:"failed",
//         })
//     }
// }


// export const closeOrder = async(req:Request,res:Response)=>{
//     try {
//         const access_token = req.body.access_token;
        
//         // setting the access token before any call
//         await fyers.setAccessToken(access_token);   

//         const reqBody={
//             "id":"NSE:SBIN-EQ-INTRADAY"
//         }

//         const response = await fyers.exit_position(reqBody);
//         console.log(response);

//         res.status(200).json({
//             message:"order successful",
//             status:"success",
//             data:response
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message:"Internal server error",
//             status:"failed",
//         })
//     }
// }

