import { Request, Response } from "express";
import { RolePermissionService } from "../services/role-permission.service";

// Assign permission to role
export const assignPermissionToRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, loungeId } = req.body;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        error: "Role ID and Permission ID are required",
      });
    }

    await RolePermissionService.assignPermission({
      roleId,
      permissionId,
      loungeId,
    });

    res.status(201).json({
      message: "Permission assigned to role successfully",
      roleId,
      permissionId,
      loungeId: loungeId || null,
    });
  } catch (error: any) {
    console.error("Error assigning permission to role:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    if (
      error.message.includes("required") ||
      error.message.includes("should not")
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes("already assigned")) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to assign permission to role" });
  }
};

// Remove permission from role
export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, loungeId } = req.params;

    await RolePermissionService.removePermission({
      roleId,
      permissionId,
      loungeId,
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("Error removing permission from role:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to remove permission from role" });
  }
};
