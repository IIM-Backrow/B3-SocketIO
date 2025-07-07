import { Router } from "express";
import { StatusController } from "../controllers/status.controller";

const router = Router();

router.get("/", StatusController.getStatus);

export { router as statusRoutes };
