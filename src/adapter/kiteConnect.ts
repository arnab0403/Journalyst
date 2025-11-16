import { KiteConnect } from "kiteconnect";
import dotenv from "dotenv";

dotenv.config();

export const API_KEY = process.env.API_KEY || "";
export const API_SECRET_KEY = process.env.API_SECRET_KEY || "";  



export const kc = new KiteConnect({
    api_key: API_KEY
});