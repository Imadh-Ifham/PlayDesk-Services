import { Router } from "express";
import { MachineController } from "../controllers/machine.controller";
import { MachineService } from "../services/machine.service";
import { PrismaClient } from "../../../../generated/prisma";

const router = Router();
const prisma = new PrismaClient();
const machineService = new MachineService(prisma);
const machineController = new MachineController(machineService);

// GET /machines - Get all machines with filtering and pagination
router.get("/", (req, res) => machineController.getMachines(req, res));

// GET /machines/:id - Get machine by ID
router.get("/:id", (req, res) => machineController.getMachineById(req, res));

// POST /machines - Create new machine
router.post("/", (req, res) => machineController.createMachine(req, res));

// PUT /machines/:id - Update machine
router.put("/:id", (req, res) => machineController.updateMachine(req, res));

// DELETE /machines/:id - Delete machine
router.delete("/:id", (req, res) => machineController.deleteMachine(req, res));

// GET /machines/stats - Get machine statistics
router.get("/stats", (req, res) => machineController.getMachineStats(req, res));

export const machineRoutes = router;
