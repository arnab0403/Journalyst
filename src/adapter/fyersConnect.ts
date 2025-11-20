// @ts-ignore
import {fyersModel} from "fyers-api-v3"
import dotenv from "dotenv";

dotenv.config();

export const FYERS_APP_APP_ID = process.env.FYERS_APP_APP_ID;
export const FYERS_APP_SECRECT_KEY = process.env.FYERS_APP_SECRECT_KEY;
const fyers= new fyersModel({"enableLogging":true})
fyers.setAppId(FYERS_APP_APP_ID);


export default fyers;


