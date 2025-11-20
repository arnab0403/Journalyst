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
    orderDate:t.exchange_timestamp
  }),
  fyers:(t:any)=>({
    id: String(t.id),
    symbol: String(t.symbol),
    quantity: Number(t.qty),
    price: Number(t.tradedPrice),
    exchange:String(t.exchange),
    type: (t.side === 1) ? "BUY" : "SELL",
    timestamp: String((t.orderDateTime.split(" ")[1])),
    orderDate:t.orderDateTime.split(" ")[0]
  })

  // we can add many here 
};
