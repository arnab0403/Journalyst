// src/controllers/IBController.ts
import { EventName, Contract,Execution ,ExecutionFilter,OrderType,OrderAction,SecType,Order} from "@stoqey/ib";
import { Request, Response } from "express";
import { Trade } from "../types/Trade";
import ib from "../adapter/ibConnect";



export const placeIbOrder = (req: Request, res: Response) => {
  const { action, symbol, quantity } = req.body;

  if (!action || !symbol || !quantity) {
    return res.status(400).json({
      message: "Please check all the details before submitting the request",
      status: "failed",
    });
  }

  console.log("Starting IB connection...");

  let orderResponseSent = false;
  let currentOrderId: number;

  ib.once(EventName.nextValidId, (orderId: number) => {
    currentOrderId = orderId;

    const contract: Contract = {
      symbol: symbol,
      secType: SecType.STK,
      exchange: "NSE",
      currency: "INR",
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

  ib.on(EventName.orderStatus, (orderId, status) => {
    console.log(`Order #${orderId} status: ${status}`);

    // Only send response once
    if (!orderResponseSent && orderId === currentOrderId && status === "Filled") {
      orderResponseSent = true;
      ib.disconnect();
      return res.status(200).json({
        message: "Order successfully placed",
        status: "success",
        orderId,
        state: status,
      });
    }
  });

  ib.on(EventName.error, (id, code, msg) => {
    console.error(`IB Error (${code}) -> ${msg}`);

    if (!orderResponseSent && Number(code) !== 10349) {
      orderResponseSent = true;
      ib.disconnect();
      return res.status(500).json({
        message: "Trade failed, please check the details",
        status: "failed",
      });
    }
  });

  ib.connect();
  ib.reqIds();
};


export const getCurrentOrders = (req: Request, res: Response) => {
   

    const trades: Trade[] = [];

    // Connected
    ib.on(EventName.connected, () => {
        console.log("✅ IB Connected. Fetching positions...");
        ib.reqPositions();
    });

    // Receive positions
    ib.on(EventName.position, (account: string, contract: Contract, pos: number, avgCost?: number) => {
        if (pos === 0) return; // Skip zero positions

        const trade: Trade = {
        id: `${account}-${contract.symbol}-${Date.now()}`, // generate unique ID
        symbol: String(contract.symbol),
        quantity: Number(pos),
        price: Number(avgCost || 0),
        exchange: contract.exchange || "",
        type: pos > 0 ? "BUY" : "SELL",
        timestamp: new Date().toISOString(),
        orderDate: new Date().toISOString().split("T")[0],
        };

        trades.push(trade);
    });

    // When all positions are sent
    ib.once(EventName.positionEnd, () => {
        console.log("All positions received.");
        res.status(200).json({
        message: "All orders fetched",
        status: "success",
        orders: trades,
        });

        ib.disconnect();
    });

    // Error logging
    ib.on(EventName.error, (err) => {
        console.error("IB ERROR:", err);
        res.status(500).json({
        message: "IB Connection Error",
        error: err.message || err,
        status: "failed",
        });
        ib.disconnect();
    });

    // Start connection
    console.log("Connecting to IB Gateway...");
    ib.connect();
};


export const orderHistory = (req: Request, res: Response) => {
    const trades: Trade[] = [];

    // Connect to IB
    ib.on(EventName.connected, () => {

        console.log("✅ IB Connected. Requesting executions...");
        // Correct filter: use undefined for optional fields
        const filter: ExecutionFilter = {
            acctCode: undefined,  // or your account string
            time: undefined,      // undefined = since midnight
            symbol: undefined,    // undefined = all symbols
            secType: undefined,   // undefined = all security types
            exchange: undefined,  // undefined = all exchanges
            side: undefined       // optional: "BUY" | "SELL"
        };


        const reqId = 1; // Any unique number
        ib.reqExecutions(reqId, filter);
    });

    // Capture executed trades
    ib.on(EventName.execDetails, (reqId: number, contract: Contract, exec: Execution) => {

        const trade: Trade = {
        id: exec.execId || `${contract.symbol}-${Date.now()}`, // fallback unique ID
        symbol: contract.symbol || "",
        quantity: Number(exec.shares),
        price: Number(exec.price),
        exchange: contract.exchange || "",
        type: exec.side === "BOT" || exec.side === "BUY" ? "BUY" : "SELL",
        timestamp: exec.time || new Date().toISOString(),
        orderDate: exec.time ? exec.time.split("T")[0] : new Date().toISOString().split("T")[0],
        };

        trades.push(trade);
    });

    // When all executions are sent
    ib.once(EventName.execDetailsEnd, () => {
        console.log("✅ All executions received.");
        res.status(200).json({
        message: "Trade history fetched",
        status: "success",
        orders: trades,
        });
        ib.disconnect();
    });

    // Error handling
    ib.on(EventName.error, (err) => {
        console.error("IB ERROR:", err);
        res.status(500).json({
        message: "IB Execution Error",
        error: err.message || err,
        status: "failed",
        });
        ib.disconnect();
    });

    // Start connection
    console.log("🔗 Connecting to IB Gateway...");
    ib.connect();
};
