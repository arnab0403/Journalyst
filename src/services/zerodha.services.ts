import {Request,Response} from "express";
import { API_KEY, API_SECRET_KEY, kc } from "../adapter/kiteConnect";
import { removeUserToken, saveUserToken } from "../utility/tokeStore";
import { getUserToken } from "../utility/tokeStore";
import { tradeNormalizers } from "../normalizer/TradeDataNormalize";

const apiSecret:String = API_SECRET_KEY;  

export const zerodhaLogin = async (req:Request,res:Response)=>{


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

}

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
        kc.setAccessToken(accessToken);
        const orders = await kc.getTrades();
            
        // if no order is there
        if (!orders.length) {
            return res.status(200).json({
                message:"No traded found in your account",
                status:"success"
            })
        }

        // geting the normalizer
        const normalizer = tradeNormalizers[brokerName];
        tradeNormalizers.zerodha;

        // normalizing the data
        const normaLizeTrdaes=orders.map(k=>normalizer(k));

        // sending the data
        res.status(200).json({
            message:"Successfully fetched your trades",
            status:"success",
            trade:normaLizeTrdaes
        });

    } catch (error) {
        res.status(500).json({
            message:"error",
            status:"failed"
        })
        console.log(error)
    }
}

export const logout = (req:Request,res:Response)=>{
    const userId = req.body.user_id; // we need to get the user_id from the request body 
    const accessToken = String(getUserToken(userId));
    kc.invalidateAccessToken(accessToken);
    removeUserToken(userId);
    res.status(200).json({
        message:"User logout successfully",
        status:"success"
    })
}