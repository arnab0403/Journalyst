import { Trade } from "../types/Trade";


export const tradeNormalizers: Record<string, (t: any) => Trade> = {
  zerodha: (t: any) => ({
    id: String(t.trade_id),
    symbol: String(t.tradingsymbol),
    quantity: Number(t.quantity),
    price: Number(t.average_price),
    exchange:String(t.exchange),
    type: (String(t.transaction_type).toUpperCase() === "SELL") ? "SELL" : "BUY",
    timestamp: new Date(t.order_timestamp).toISOString(),
  })

  // we can add many here 
};
