import express from "express";
import { getAuthCode,getDailyOrders,setAccessToken, validateUserMiddleware } from "../services/fyers.services";

const fyersRouter = express.Router();

fyersRouter.get("/login",getAuthCode);
fyersRouter.get("/redirecturl",setAccessToken);
fyersRouter.get("/orders",validateUserMiddleware,getDailyOrders);
// fyersRouter.post("/place-order",validateUserMiddleware,placeOrder);
// fyersRouter.post("/close-order",validateUserMiddleware,closeOrder);

export default fyersRouter;