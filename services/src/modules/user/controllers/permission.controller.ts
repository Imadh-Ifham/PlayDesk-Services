import { Request, Response } from "express";
import { PermissionService } from "../services/permission.service";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "../models/permission.model";

/**
 * Get all permissions with optional filtering and pagination
 */
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await PermissionService.findMany(filters);
    res.json(result);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({
      error: "Failed to fetch permissions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permission = await PermissionService.findById(id);
    res.json(permission);
  } catch (error) {
    console.error("Error fetching permission:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to fetch permission",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create new permission
 */
export const createPermission = async (req: Request, res: Response) => {
  try {
    const permissionData: CreatePermissionInput = req.body;
    const permission = await PermissionService.create(permissionData);
    res.status(201).json(permission);
  } catch (error) {
    console.error("Error creating permission:", error);

    if (error instanceof Error) {
      if (error.message.includes("required")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.includes("must be between")) {
        return res.status(400).json({ error: error.message });
      }
    }

    res.status(500).json({
      error: "Failed to create permission",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update permission
 */
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdatePermissionInput = req.body;

    const permission = await PermissionService.update(id, updateData);
    res.json(permission);
  } catch (error) {
    console.error("Error updating permission:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.includes("must be between")) {
        return res.status(400).json({ error: error.message });
      }
    }

    res.status(500).json({
      error: "Failed to update permission",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete permission
 */
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await PermissionService.delete(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting permission:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Cannot delete")) {
        return res.status(409).json({ error: error.message });
      }
    }

    res.status(500).json({
      error: "Failed to delete permission",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
