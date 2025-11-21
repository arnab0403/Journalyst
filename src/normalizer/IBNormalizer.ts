import { Trade } from "../types/Trade";
import { formatOrderDate } from "../utility/dateFormatter";


export function normalizeIBTrade(exec: any, contract: any): Trade {
  return {
    id: exec.execId || `${contract.symbol}-${Date.now()}`,
    symbol: contract.symbol || "",
    quantity: Number(exec.shares),
    price: Number(exec.price),
    exchange: contract.exchange || "",
    type: exec.side === "BOT" || exec.side === "BUY" ? "BUY" : "SELL",
    timestamp: String(exec.time?.split(" ")[1]) || "",
    orderDate: formatOrderDate(exec.time),
  };
}
