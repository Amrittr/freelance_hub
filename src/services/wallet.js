import { WalletTransaction } from "../models/WalletTransaction.js";

export async function getWalletSnapshot(userId, { limit = 20 } = {}) {
  const [transactions, totals] = await Promise.all([
    WalletTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(limit),
    WalletTransaction.aggregate([
      { $match: { user: userId, status: "succeeded" } },
      {
        $group: {
          _id: "$direction",
          amount: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const credits = totals.find((total) => total._id === "credit")?.amount || 0;
  const debits = totals.find((total) => total._id === "debit")?.amount || 0;

  return {
    balance: roundMoney(credits - debits),
    credits: roundMoney(credits),
    debits: roundMoney(debits),
    transactions,
  };
}

export function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
