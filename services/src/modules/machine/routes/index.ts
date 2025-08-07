import { Router } from "express";
import { machineRoutes } from "./machine.routes";
import { machineTypeRoutes } from "./machineType.routes";
import { rateByPlayersRoutes } from "./rateByPlayers.routes";

const router = Router();

router.use("/machines", machineRoutes);
router.use("/machine-types", machineTypeRoutes);
router.use("/rates", rateByPlayersRoutes);

export default router;
