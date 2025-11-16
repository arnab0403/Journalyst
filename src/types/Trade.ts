export interface Trade {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  exchange:string;
  type: "BUY" | "SELL";
  timestamp: string;
}



