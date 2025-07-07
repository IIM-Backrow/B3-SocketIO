import { Router } from "express";
import { MatchmakingController } from "../controllers/matchmaking.controller";

const router = Router();

router.get("/stats", MatchmakingController.getMatchmakingStats);

export { router as matchmakingRoutes };
