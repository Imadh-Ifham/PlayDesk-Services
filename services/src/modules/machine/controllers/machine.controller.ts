import { Request, Response } from "express";
import { MachineService } from "../services/machine.service";
import {
  CreateMachineInput,
  UpdateMachineInput,
  MachineFilters,
  MachinePaginationOptions,
  MachineCategory,
  MachineStatus,
} from "../models/machine.model";

export class MachineController {
  constructor(private machineService: MachineService) {}

  async getMachines(req: Request, res: Response) {
    try {
      const filters: MachineFilters = {
        search: req.query.search as string,
        category: req.query.category as MachineCategory | undefined,
        status: req.query.status as MachineStatus | undefined,
        loungeId: req.query.loungeId as string,
      };

      const paginationOptions: MachinePaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as
          | "category"
          | "status"
          | "loungeId"
          | "machineTypeId"
          | "id"
          | "serialNumber"
          | "createdAt"
          | "updatedAt"
          | undefined,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const machines = await this.machineService.getMachines(
        filters,
        paginationOptions
      );
      res.status(200).json({
        success: true,
        data: machines,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching machines",
        error: (error as Error).message,
      });
    }
  }

  async getMachineById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const machine = await this.machineService.getMachineById(id);

      if (!machine) {
        return res.status(404).json({
          success: false,
          message: "Machine not found",
        });
      }

      res.status(200).json({
        success: true,
        data: machine,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching machine",
        error: (error as Error).message,
      });
    }
  }

  async createMachine(req: Request, res: Response) {
    try {
      const machineData: CreateMachineInput = {
        machineTypeId: req.body.machineTypeId,
        category: req.body.category,
        serialNumber: req.body.serialNumber,
        loungeId: req.body.loungeId,
        status: req.body.status,
      };

      const newMachine = await this.machineService.createMachine(machineData);
      res.status(201).json({
        success: true,
        message: "Machine created successfully",
        data: newMachine,
      });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating machine",
        error: error.message,
      });
    }
  }

  async updateMachine(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateMachineInput = req.body;

      const updatedMachine = await this.machineService.updateMachine(
        id,
        updateData
      );

      if (!updatedMachine) {
        return res.status(404).json({
          success: false,
          message: "Machine not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Machine updated successfully",
        data: updatedMachine,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating machine",
        error: (error as Error).message,
      });
    }
  }

  async deleteMachine(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.machineService.deleteMachine(id);

      res.status(200).json({
        success: true,
        message: "Machine deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting machine",
        error: (error as Error).message,
      });
    }
  }

  async getMachineStats(req: Request, res: Response) {
    try {
      const stats = await this.machineService.getMachineStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching machine statistics",
        error: (error as Error).message,
      });
    }
  }
}
