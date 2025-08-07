import { Router } from "express";
import { MachineTypeController } from "../controllers/machineType.controller";
import { MachineTypeService } from "../services/machineType.service";
import { PrismaClient } from "../../../../generated/prisma";

const router = Router();
const prisma = new PrismaClient();
const machineTypeService = new MachineTypeService(prisma);
const machineTypeController = new MachineTypeController(machineTypeService);

// GET /machine-types - Get all machine types with filtering and pagination
router.get("/", (req, res) => machineTypeController.getMachineTypes(req, res));

// GET /machine-types/:id - Get machine type by ID
router.get("/:id", (req, res) =>
  machineTypeController.getMachineTypeById(req, res)
);

// POST /machine-types - Create new machine type
router.post("/", (req, res) =>
  machineTypeController.createMachineType(req, res)
);

// PUT /machine-types/:id - Update machine type
router.put("/:id", (req, res) =>
  machineTypeController.updateMachineType(req, res)
);

// DELETE /machine-types/:id - Delete machine type
router.delete("/:id", (req, res) =>
  machineTypeController.deleteMachineType(req, res)
);

// GET /machine-types/stats - Get machine type statistics
router.get("/stats", (req, res) =>
  machineTypeController.getMachineTypeStats(req, res)
);

// POST /machine-types/:id/rates - Add rate to machine type
router.post("/:id/rates", (req, res) =>
  machineTypeController.addRateToMachineType(req, res)
);

// PUT /machine-types/:machineTypeId/rates/:rateId - Update rate for machine type
router.put("/:machineTypeId/rates/:rateId", (req, res) =>
  machineTypeController.updateRateForMachineType(req, res)
);

export const machineTypeRoutes = router;
