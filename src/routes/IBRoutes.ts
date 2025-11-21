import { Router } from "express";
import { getCurrentOrders, orderHistory, placeIbOrder } from "../services/ib.services";


const iBrouter = Router();

iBrouter.post("/placeorder", placeIbOrder);
iBrouter.get("/currentorders",getCurrentOrders);
iBrouter.get("/history",orderHistory);

export default iBrouter;
