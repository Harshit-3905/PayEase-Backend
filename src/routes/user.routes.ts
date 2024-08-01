import { Router } from "express";
import {
  SignUp,
  Login,
  Update,
  findUsers,
} from "../controllers/user.contoller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.put("/update", authMiddleware, Update);
router.get("/", authMiddleware, findUsers);

export default router;
