import { Request, Response } from "express";
import { MachineService } from "../services/machine.service";
import {
  CreateMachineInput,
  UpdateMachineInput,
  MachineFilters,
  MachinePaginationOptions,
} from "../models/machine.model";

export class MachineController {
  constructor(private machineService: MachineService) {}

  // Get all machines with filtering and pagination
  async getMachines(req: Request, res: Response) {
    try {
      const filters: MachineFilters = {
        search: req.query.search as string,
        category: req.query.category as any,
        status: req.query.status as any,
        loungeId: req.query.loungeId as string,
        machineTypeId: req.query.machineTypeId as string,
      };

      const paginationOptions: MachinePaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const machines = await this.machineService.getMachines(
        filters,
        paginationOptions
      );
      res.json(machines);
    } catch (error) {
      res.status(500).json({ message: "Error fetching machines", error });
    }
  }

  // Get machine by ID
  async getMachineById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const machine = await this.machineService.getMachineById(id);

      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }

      res.json(machine);
    } catch (error) {
      res.status(500).json({ message: "Error fetching machine", error });
    }
  }

  // Create new machine
  async createMachine(req: Request, res: Response) {
    try {
      const machineData: CreateMachineInput = req.body;
      const newMachine = await this.machineService.createMachine(machineData);
      res.status(201).json(newMachine);
    } catch (error) {
      res.status(500).json({ message: "Error creating machine", error });
    }
  }

  // Update machine
  async updateMachine(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateMachineInput = req.body;
      const updatedMachine = await this.machineService.updateMachine(
        id,
        updateData
      );

      if (!updatedMachine) {
        return res.status(404).json({ message: "Machine not found" });
      }

      res.json(updatedMachine);
    } catch (error) {
      res.status(500).json({ message: "Error updating machine", error });
    }
  }

  // Delete machine
  async deleteMachine(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.machineService.deleteMachine(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting machine", error });
    }
  }

  // Get machine statistics
  async getMachineStats(req: Request, res: Response) {
    try {
      const stats = await this.machineService.getMachineStats();
      res.json(stats);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching machine statistics", error });
    }
  }
}
