import {Response,Request} from "express";
import { kc } from "../adapter/kiteConnect";

import { getUserToken } from "../utility/tokeStore";
import { tradeNormalizers } from "../normalizer/TradeDataNormalize";

const syncTrdes =(req:Request,res:Response)=>{
    try {

        // get the values form the body 
        const userId=req.body.user_id;
        const brokerName = req.body.broker_name;
        console.log(userId,brokerName);
        
        // get the access token from the body
        const accessToken = String(getUserToken(userId));

        console.log(accessToken);
        // if the user token is not there it will ask for login again 
        if (!accessToken) {
            res.redirect("/login");
        }

        // if access token is there then it will set the access token in the adapter
        kc.setAccessToken(accessToken);

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

            // normalizing the data
            const normaLizeTrdaes=trades.map(k=>normalizer(k));

            // sending the data
            res.status(200).json({
                message:"Successfully fetched your trades",
                status:"success",
                trade:normaLizeTrdaes
            });
        }).catch((error)=>{
            console.log(error);
        });

    } catch (error) {
        res.status(500).json({
            message:"error",
            status:"failed"
        })
        console.log(error)
    }
}

export default syncTrdes;