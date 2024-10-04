export enum Status {
  UPGRADE = "upgraded",
  DELETE = "deleted",
  ACTIVE = "active",
  APPROVED = "approved",
  VERIFIED = "verified",
  PENDING = "pending",
  NEW = "new",
  DISABLED = "disabled",
}

export enum LoginType {
  CREDENTIAL = "credential",
  GOOGLE = "google",
}

export const currency = [
  { id: "BTC", name: "Bitcoin", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" },
  { id: "ETH", name: "Ethereum", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" },
  { id: "SOL", name: "Solana", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png" },
  { id: "BNB", name: "BNB", img: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png" },
]