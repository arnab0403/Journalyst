import { Router } from "express";
// import { placeIbOrder } from "../adapter/ibConnect";
// import { getCurrentOrders } from "../adapter/IbConnects.AllTraded";
// import { orderHistory } from "../adapter/iBConnects.history";

import { getCurrentOrders, orderHistory, placeIbOrder } from "../services/ib.services";
// import "../adapter/ibConnect"

const iBrouter = Router();

// iBrouter.get("/placeorder", placeIbOrder);
// iBrouter.get("/currentorders",getCurrentOrders);
// iBrouter.get("/history",orderHistory);


iBrouter.post("/placeorder", placeIbOrder);
iBrouter.get("/currentorders",getCurrentOrders);
iBrouter.get("/history",orderHistory);

export default iBrouter;
