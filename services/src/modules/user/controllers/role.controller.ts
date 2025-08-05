import { Request, Response } from "express";
import { RoleService } from "../services/role.service";
import { RoleType } from "../../../../generated/prisma";

/**
 * Get all roles with optional filters
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search, accountId, roleType } = req.query;

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    if (search) filters.search = search as string;
    if (accountId) filters.accountId = accountId as string;
    if (roleType && Object.values(RoleType).includes(roleType as RoleType)) {
      filters.roleType = roleType as RoleType;
    }

    const result = await RoleService.findMany(filters);

    res.json(result);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      error: "Failed to fetch roles",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get a specific role by ID
 */
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const role = await RoleService.findById(id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    ``;
    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({
      error: "Failed to fetch role",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create a new role
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const roleData = req.body;

    const newRole = await RoleService.create(roleData);

    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);

    if (error instanceof Error) {
      if (error.message.includes("Account not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      if (error.message.includes("permission")) {
        return res.status(403).json({ error: error.message });
      }
    }

    res.status(500).json({
      error: "Failed to create role",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update an existing role
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRole = await RoleService.update(id, updateData);

    res.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
    }

    res.status(500).json({
      error: "Failed to update role",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a role
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await RoleService.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting role:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: "Failed to delete role",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get role statistics
 */
export const getRoleStats = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.query;

    const stats = await RoleService.getStats(accountId as string);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching role stats:", error);
    res.status(500).json({
      error: "Failed to fetch role stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
