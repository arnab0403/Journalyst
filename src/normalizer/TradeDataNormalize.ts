import { Trade } from "../types/Trade";

export const tradeNormalizers: Record<string, (t: any) => Trade> = {
  zerodha: (t: any) => ({
    id: String(t.trade_id),
    symbol: String(t.tradingsymbol),
    quantity: Number(t.quantity),
    price: Number(t.average_price),
    exchange:String(t.exchange),
    type: (String(t.transaction_type).toUpperCase() === "SELL") ? "SELL" : "BUY",
    timestamp: String(t.order_timestamp),
    orderDate:t.exchange_timestamp.toISOString().split("T")[0]
  }),
  fyers:(t:any)=>({
    id: String(t.id),
    symbol: String(t.symbol.split(":")[1]),
    quantity: Number(t.qty),
    price: Number(t.tradedPrice),
    exchange:String(t.symbol.split(":")[0]),
    type: (t.side === 1) ? "BUY" : "SELL",
    timestamp: String((t.orderDateTime.split(" ")[1])),
    orderDate:new Date(t.orderDateTime).toISOString().split("T")[0]
  })

  // we can add many here 
};
