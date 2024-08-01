import mongoose from "mongoose";
import Account from "../models/account.model";
import { Request, Response } from "express";

const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const account = await Account.findOne({ userId });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(200).json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const transfer = async (req: Request, res: Response) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { userId, amount, to } = req.body;
    const fromAccount = await Account.findOne({ userId }).session(session);
    const toAccount = await Account.findOne({ userId: to }).session(session);
    if (!fromAccount || !toAccount) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Account not found" });
    }
    if (fromAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Insufficient balance" });
    }
    await Account.updateOne(
      { userId: userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getBalance, transfer };
