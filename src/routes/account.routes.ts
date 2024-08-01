import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getBalance, transfer } from "../controllers/account.controller";

const router = Router();

router.use(authMiddleware);
router.get("/balance", getBalance);
router.post("/transfer", transfer);

export default router;
