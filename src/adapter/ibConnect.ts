import { Request, Response } from "express";
import { 
  IBApi, 
  EventName, 
  OrderType, 
  OrderAction, 
  SecType, 
  Contract, 
  Order 
} from "@stoqey/ib";

export const placeIbOrder = (req: Request, res: Response) => {

    const action = req.body.action;
    const symbol = req.body.symbol; 
    const quantity = req.body.quantity;

    if (!action || !symbol || !quantity) {
        return res.status(500).json({
            message: "Please check all the details before submitting the request",
            status: "failed",
        });
    }

    console.log("Starting IB connection...");

    const ib = new IBApi({
        port: 4002,
        clientId: 0,
    });

    let orderResponseSent = false;


    //sending the order 
    ib.once(EventName.nextValidId, (orderId: number) => {

        const contract: Contract = {
        symbol: symbol,
        secType: SecType.STK,
        exchange: "NSE",
        currency: "INR"
        };

        const order: Order = {
        orderType: OrderType.MKT,
        action: action === "BUY" ? OrderAction.BUY : OrderAction.SELL,
        orderId,
        totalQuantity: quantity,
        account: "DUN983795",
        transmit: true,
        };

        ib.placeOrder(orderId, contract, order);
        console.log("Order submitted, waiting for execution...");
    });



    // Order Status
    ib.on(EventName.orderStatus, (orderId, status) => {
        console.log(status);

        if (status === "Filled") {
        orderResponseSent = true;
        res.status(200).json({
            mesaage: "Order successfully placed",
            status: "success",
            orderId,
            state:status
        });
        ib.disconnect();
        }
    });


    
    // Error Handling
    ib.on(EventName.error, (id, code, msg) => {
        console.error(`IB Error (${code}) -> ${msg}`);
        if (Number(code)!==10349) {
            res.status(500).json({
                message: "Trade failed please check the details",
                status: "failed",
            });
            ib.disconnect();
        }
    });

    
    // // Execution Details
    // ib.on(EventName.execDetails, (reqId, contract, exec) => {
    //     console.log("Filled:", {
    //     symbol: contract.symbol,
    //     price: exec.price,
    //     quantity: exec.shares,
    //     });
    // });


    // // Open Order logs
    // ib.on(EventName.openOrder, (orderId, contract, order) => {
    //     console.log("Order Info:", { orderId, contract, order });
    // });



  ib.connect();
  ib.reqIds();
};
