import express from "express";
import { getAuthCode,getDailyOrders,setAccessToken } from "../services/fyers.services";

const fyersRouter = express.Router();

fyersRouter.get("/login",getAuthCode);
fyersRouter.get("/redirecturl",setAccessToken);
fyersRouter.get("/orders",getDailyOrders);

export default fyersRouter;