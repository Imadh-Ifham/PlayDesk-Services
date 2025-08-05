import { Request, Response } from "express";
import { RoleService } from "../services/role.service";
import { RoleValidationService } from "../services/role-validation.service";
import { rolesToResponse } from "../models/role.model";

// Get roles by account
export const getRolesByAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;

    // Validate account exists
    await RoleValidationService.validateAccountExists(accountId);

    const roles = await RoleService.findByAccount(accountId);
    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error: any) {
    console.error("Error fetching roles by account:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch roles by account" });
  }
};

// Get roles by lounge
export const getRolesByLounge = async (req: Request, res: Response) => {
  try {
    const { loungeId } = req.params;

    // Validate lounge exists
    await RoleValidationService.validateLoungeExists(loungeId);

    const roles = await RoleService.findByLounge(loungeId);
    const response = rolesToResponse(roles as any);
    res.json(response);
  } catch (error: any) {
    console.error("Error fetching roles by lounge:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to fetch roles by lounge" });
  }
};

// Check if user can create role (helper for authorization)
export const canCreateRole = async (req: Request, res: Response) => {
  try {
    const { roleType, accountId } = req.query;

    const result = RoleValidationService.canCreateRoleType(
      roleType as any,
      accountId as string
    );

    res.json({
      ...result,
      roleType,
      accountId,
    });
  } catch (error) {
    console.error("Error checking role creation permissions:", error);
    res
      .status(500)
      .json({ error: "Failed to check role creation permissions" });
  }
};
