import { Request, Response } from "express";
import { MachineTypeService } from "../services/machineType.service";
import {
  CreateMachineTypeInput,
  UpdateMachineTypeInput,
  MachineTypeFilters,
  MachineTypePaginationOptions,
} from "../models/machineType.model";

export class MachineTypeController {
  constructor(private machineTypeService: MachineTypeService) {}

  // Create new machine type with rate by players and supported games
  async createMachineType(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        supportedGames,
        specifications,
        rateByPlayers,
        imageUrl,
        loungeId,
      } = req.body;

      // Validate required fields
      if (!name || !loungeId) {
        return res.status(400).json({
          success: false,
          message: "Name and loungeId are required.",
        });
      }

      if (!rateByPlayers || typeof rateByPlayers !== "object") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rate format. rateByPlayers should be an object with player counts as keys.",
        });
      }

      // Validate rate values
      for (const [key, value] of Object.entries(rateByPlayers)) {
        if (isNaN(Number(key)) || typeof value !== "number" || value <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid rate value. Expected a number greater than 0 for key '${key}', received '${value}'.`,
          });
        }
      }

      const machineTypeData: CreateMachineTypeInput = {
        name,
        description,
        specifications,
        imageUrl,
        loungeId,
      };

      const newMachineType = await this.machineTypeService.createMachineType(
        machineTypeData
      );

      // Create rate by players entries
      const rateEntries = Object.entries(rateByPlayers).map(
        ([players, price]) => ({
          noOfPlayers: parseInt(players),
          price: price as number,
          machineTypeId: newMachineType.id,
        })
      );

      // Add rates to machine type
      await Promise.all(
        rateEntries.map((rate) =>
          this.machineTypeService.addRateToMachineType(newMachineType.id, rate)
        )
      );

      // Get the updated machine type with all relations
      const finalMachineType = await this.machineTypeService.getMachineTypeById(
        newMachineType.id
      );

      res.status(201).json({
        success: true,
        message: "Machine type created successfully.",
        data: finalMachineType,
      });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          error: error.message,
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Machine type already exists.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating machine type",
        error: error.message,
      });
    }
  }

  // Get all machine types with filters
  async getMachineTypes(req: Request, res: Response) {
    try {
      const filters: MachineTypeFilters = {
        search: req.query.search as string,
        loungeId: req.query.loungeId as string,
        hasSpecifications: req.query.hasSpecifications === "true",
        hasImage: req.query.hasImage === "true",
      };

      const paginationOptions: MachineTypePaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const machineTypes = await this.machineTypeService.getMachineTypes(
        filters,
        paginationOptions
      );
      res.status(200).json({
        success: true,
        data: machineTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching machine types",
        error: (error as Error).message,
      });
    }
  }

  // Get machine type by ID
  async getMachineTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const machineType = await this.machineTypeService.getMachineTypeById(id);

      if (!machineType) {
        return res.status(404).json({
          success: false,
          message: "Machine type not found",
        });
      }

      res.status(200).json({
        success: true,
        data: machineType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching machine type",
        error: (error as Error).message,
      });
    }
  }

  // Update machine type
  async updateMachineType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateMachineTypeInput = req.body;

      const updatedMachineType =
        await this.machineTypeService.updateMachineType(id, updateData);

      if (!updatedMachineType) {
        return res.status(404).json({
          success: false,
          message: "Machine type not found",
        });
      }

      res.status(200).json({
        success: true,
        data: updatedMachineType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating machine type",
        error: (error as Error).message,
      });
    }
  }

  // Delete machine type
  async deleteMachineType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.machineTypeService.deleteMachineType(id);

      res.status(200).json({
        success: true,
        message: "Machine type deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting machine type",
        error: (error as Error).message,
      });
    }
  }

  // Get machine type statistics
  async getMachineTypeStats(req: Request, res: Response) {
    try {
      const stats = await this.machineTypeService.getMachineTypeStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching machine type statistics",
        error: (error as Error).message,
      });
    }
  }

  // Add games to machine type
  // Manage rates
  async addRateToMachineType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { noOfPlayers, price } = req.body;

      if (
        typeof noOfPlayers !== "number" ||
        typeof price !== "number" ||
        price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "noOfPlayers and price (greater than 0) are required.",
        });
      }

      const rate = {
        noOfPlayers,
        price,
        machineTypeId: id,
      };

      const newRate = await this.machineTypeService.addRateToMachineType(
        id,
        rate
      );

      res.status(200).json({
        success: true,
        message: "Rate added to machine type successfully.",
        data: newRate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error adding rate to machine type",
        error: (error as Error).message,
      });
    }
  }

  async updateRateForMachineType(req: Request, res: Response) {
    try {
      const { machineTypeId, rateId } = req.params;
      const { noOfPlayers, price } = req.body;

      if (
        (noOfPlayers !== undefined && typeof noOfPlayers !== "number") ||
        (price !== undefined && (typeof price !== "number" || price <= 0))
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid rate values provided.",
        });
      }

      const updatedRate =
        await this.machineTypeService.updateRateForMachineType(rateId, {
          noOfPlayers,
          price,
        });

      res.status(200).json({
        success: true,
        message: "Rate updated successfully.",
        data: updatedRate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating rate",
        error: (error as Error).message,
      });
    }
  }
}
