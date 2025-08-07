import { Request, Response } from "express";
import { RateByPlayersService } from "../services/rateByPlayers.service";
import {
  RateByPlayersFilters,
  RateByPlayersPaginationOptions,
} from "../models/rateByPlayers.model";

export class RateByPlayersController {
  constructor(private rateByPlayersService: RateByPlayersService) {}

  // Get all rates with filters and pagination
  async getRates(req: Request, res: Response) {
    try {
      const filters: RateByPlayersFilters = {
        machineTypeId: req.query.machineTypeId as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minPlayers: req.query.minPlayers
          ? Number(req.query.minPlayers)
          : undefined,
        maxPlayers: req.query.maxPlayers
          ? Number(req.query.maxPlayers)
          : undefined,
      };

      const paginationOptions: RateByPlayersPaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const rates = await this.rateByPlayersService.getRates(
        filters,
        paginationOptions
      );
      res.status(200).json({
        success: true,
        data: rates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching rates",
        error: (error as Error).message,
      });
    }
  }

  // Get rate by ID
  async getRateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rate = await this.rateByPlayersService.getRateById(id);

      if (!rate) {
        return res.status(404).json({
          success: false,
          message: "Rate not found",
        });
      }

      res.status(200).json({
        success: true,
        data: rate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching rate",
        error: (error as Error).message,
      });
    }
  }

  // Create new rate
  async createRate(req: Request, res: Response) {
    try {
      const { noOfPlayers, price, machineTypeId } = req.body;

      // Input validation
      if (!noOfPlayers || !price || !machineTypeId) {
        return res.status(400).json({
          success: false,
          message: "noOfPlayers, price, and machineTypeId are required",
        });
      }

      const rate = await this.rateByPlayersService.createRate({
        noOfPlayers,
        price,
        machineTypeId,
      });

      res.status(201).json({
        success: true,
        message: "Rate created successfully",
        data: rate,
      });
    } catch (error: any) {
      if (error.message === "Invalid rate input") {
        return res.status(400).json({
          success: false,
          message: "Invalid rate input",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating rate",
        error: error.message,
      });
    }
  }

  // Update rate
  async updateRate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { noOfPlayers, price } = req.body;

      if (!noOfPlayers && !price) {
        return res.status(400).json({
          success: false,
          message: "At least one field (noOfPlayers or price) must be provided",
        });
      }

      const rate = await this.rateByPlayersService.updateRate(id, {
        noOfPlayers,
        price,
      });

      if (!rate) {
        return res.status(404).json({
          success: false,
          message: "Rate not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Rate updated successfully",
        data: rate,
      });
    } catch (error: any) {
      if (error.message === "Invalid rate input") {
        return res.status(400).json({
          success: false,
          message: "Invalid rate input",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error updating rate",
        error: error.message,
      });
    }
  }

  // Delete rate
  async deleteRate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.rateByPlayersService.deleteRate(id);

      res.status(200).json({
        success: true,
        message: "Rate deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting rate",
        error: (error as Error).message,
      });
    }
  }

  // Get rate statistics
  async getRateStats(req: Request, res: Response) {
    try {
      const stats = await this.rateByPlayersService.getRateStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching rate statistics",
        error: (error as Error).message,
      });
    }
  }
}
