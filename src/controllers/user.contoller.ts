import { Request, Response } from "express";
import User from "../models/user.model";
import Account from "../models/account.model";
import zod from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateToken = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
};

const SignUpSchema = zod.object({
  name: zod.string().min(3),
  email: zod.string().email(),
  password: zod.string().min(6),
});

const SignUp = async (req: Request, res: Response) => {
  const result = SignUpSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Invalid Inputs" });
  }
  const { name, email, password } = result.data;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const account = await Account.create({
      userId: user._id,
      balance: 1 + Math.floor(Math.random() * 10000),
    });
    const token = generateToken(user._id.toString());
    res.status(201).json({ Message: "User Created Successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const LoginSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
});

const Login = async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Invalid Inputs" });
  }
  const { email, password } = result.data;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid Password" });
    }
    const token = generateToken(user._id.toString());
    res.status(201).json({ Message: "Logged In Successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const UpdateSchema = zod.object({
  name: zod.string().min(3).optional(),
  email: zod.string().email().optional(),
  password: zod.string().min(6).optional(),
});

const Update = async (req: Request, res: Response) => {
  const result = UpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Invalid Inputs" });
  }
  const { name, email, password } = result.data;
  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.status(200).json({ Message: "User Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const findUsers = async (req: Request, res: Response) => {
  const filter = req.query.filter;
  try {
    const users = await User.find({
      name: { $regex: filter as string, $options: "i" },
    }).select({ password: 0 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { SignUp, Login, Update, findUsers };
