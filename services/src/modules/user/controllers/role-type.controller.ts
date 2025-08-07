import { Request, Response } from "express";
import {
  GlobalRoleService,
  SystemRoleService,
} from "../services/role-type.service";
import { roleToResponse, rolesToResponse } from "../models/role.model";

// Get global roles
export const getGlobalRoles = async (req: Request, res: Response) => {
  try {
    const roles = await GlobalRoleService.findAll();
    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching global roles:", error);
    res.status(500).json({ error: "Failed to fetch global roles" });
  }
};

// Get system roles (admin only)
export const getSystemRoles = async (req: Request, res: Response) => {
  try {
    const roles = await SystemRoleService.findAll();
    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error) {
    console.error("Error fetching system roles:", error);
    res.status(500).json({ error: "Failed to fetch system roles" });
  }
};

// Create global role (admin only)
export const createGlobalRole = async (req: Request, res: Response) => {
  try {
    const { name, permissionIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    const role = await GlobalRoleService.create({ name, permissionIds });
    const response = roleToResponse(role as any);
    res.status(201).json(response);
  } catch (error: any) {
    console.error("Error creating global role:", error);
    if (error.message.includes("already exists")) {
      return res.status(409).json({ error: error.message });
    }
    if (
      error.message.includes("invalid") ||
      error.message.includes("must be")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create global role" });
  }
};
