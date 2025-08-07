import { Router } from "express";
import { RateByPlayersController } from "../controllers/rateByPlayers.controller";
import { RateByPlayersService } from "../services/rateByPlayers.service";
import { PrismaClient } from "../../../../generated/prisma";

const router = Router();
const prisma = new PrismaClient();
const rateByPlayersService = new RateByPlayersService(prisma);
const rateByPlayersController = new RateByPlayersController(
  rateByPlayersService
);

// GET /rates - Get all rates with filtering and pagination
router.get("/", (req, res) => rateByPlayersController.getRates(req, res));

// GET /rates/:id - Get rate by ID
router.get("/:id", (req, res) => rateByPlayersController.getRateById(req, res));

// POST /rates - Create new rate
router.post("/", (req, res) => rateByPlayersController.createRate(req, res));

// PUT /rates/:id - Update rate
router.put("/:id", (req, res) => rateByPlayersController.updateRate(req, res));

// DELETE /rates/:id - Delete rate
router.delete("/:id", (req, res) =>
  rateByPlayersController.deleteRate(req, res)
);

// GET /rates/stats - Get rate statistics
router.get("/stats", (req, res) =>
  rateByPlayersController.getRateStats(req, res)
);

export const rateByPlayersRoutes = router;
