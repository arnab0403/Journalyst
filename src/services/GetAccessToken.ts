import {Request,Response} from "express";
import { API_KEY, API_SECRET_KEY, kc } from "../adapter/kiteConnect";
import { saveUserToken } from "../utility/tokeStore";

const apiSecret:String = API_SECRET_KEY;  

const getAccessToken = (req:Request,res:Response)=>{     

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
        const accessToken = session.access_token;
        const userId = session.user_id;

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

export default getAccessToken;