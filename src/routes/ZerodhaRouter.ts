import express from 'express';
import { getAccessToken, logout, syncTrdes, zerodhaLogin } from '../services/zerodha.services';


const zerodhaRouter = express.Router();

zerodhaRouter.get("/login",zerodhaLogin);
zerodhaRouter.get("/redirecturl",getAccessToken);
zerodhaRouter.get("/sync",syncTrdes);
zerodhaRouter.post("/logout",logout);

export default zerodhaRouter;


