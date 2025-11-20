import {Request,Response} from "express";
import { API_KEY, API_SECRET_KEY, kc } from "../adapter/kiteConnect";
import { saveUserToken } from "../utility/tokeStore";
import { getUserToken } from "../utility/tokeStore";
import { tradeNormalizers } from "../normalizer/TradeDataNormalize";

const apiSecret:String = API_SECRET_KEY;  

export const getAccessToken = (req:Request,res:Response)=>{     

    const request_token = req.query.request_token;
    console.log(request_token);

    if (!request_token) {
        return res.status(404).json({
            message:"Request token not found",
            status:"failed"
        });
    }

    // generating the session 
    kc.generateSession(request_token as string,apiSecret as string)
    .then(async(session)=>{
        console.log(session);
        const accessToken = session.access_token;
        const userId = session.user_id;
        console.log(accessToken,userId);
        // save the user id and access_token in the for future api calls 
        saveUserToken(userId,accessToken); 
        
        kc.setAccessToken(accessToken);
        try{
            const profile = await kc.getProfile();
            console.log(profile);
            res.status(200).json({
                message:"User logged in successfully and request token genarated",
                status:"success"
            })
        }catch(error){
            console.log((error as Error).message);
        }
    });

}




export const syncTrdes =async (req:Request,res:Response)=>{
    try {

        // get the values form the body 
        const userId=req.body?.user_id;
        const brokerName = req.body?.broker_name;
        
        console.log(userId,brokerName);

        if (!brokerName || !userId) {
           return res.status(500).json({
                    message:"Broker name or user id is missing",
                    status:"failed",
                });
        }
        
        // get the access token from the body
        const accessToken = String(getUserToken(userId));
        console.log(accessToken);


        // if the user token is not there it will ask for login again 
        if (!accessToken) {
            return res.redirect("/login");
        }

        // if access token is there then it will set the access token in the adapter
        const access=await kc.setAccessToken(accessToken);
        console.log(access);
        kc.getTrades().then((trades)=>{
            console.log(trades);
            
            // I am assuming that it will give an array 
            if (!trades.length) {
                return res.status(200).json({
                    message:"No traded found in your account",
                    status:"success"
                })
            }

            // geting the normalizer
            const normalizer = tradeNormalizers[brokerName];
            tradeNormalizers.zerodha;

            // normalizing the data
            const normaLizeTrdaes=trades.map(k=>normalizer(k));

            // sending the data
            res.status(200).json({
                message:"Successfully fetched your trades",
                status:"success",
                trade:normaLizeTrdaes
            });
        }).catch((error)=>{
            return res.status(500).json({
                    message:error.message,
                    status:"failed",
                });
        });

    } catch (error) {
        res.status(500).json({
            message:"error",
            status:"failed"
        })
        console.log(error)
    }
}
