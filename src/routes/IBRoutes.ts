import { Router, Request, Response } from "express";
import { placeIbOrder } from "../adapter/ibConnect";
// import "../adapter/ibConnect"

const iBrouter = Router();

iBrouter.get("/placeorder", placeIbOrder);

export default iBrouter;
