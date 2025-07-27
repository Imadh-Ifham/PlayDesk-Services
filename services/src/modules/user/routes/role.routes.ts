import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolesByLounge,
  getRoleStats,
  assignPermissionToRole,
  removePermissionFromRole,
} from "../controllers/role.controller";

const router = Router();

// GET /api/roles - Get all roles with filtering and pagination
router.get("/", getRoles);

// GET /api/roles/stats - Get role statistics
router.get("/stats", getRoleStats);

// GET /api/roles/lounge/:loungeId - Get roles by lounge
router.get("/lounge/:loungeId", getRolesByLounge);

// GET /api/roles/:id - Get role by ID
router.get("/:id", getRoleById);

// POST /api/roles - Create new role
router.post("/", createRole);

// PUT /api/roles/:id - Update role
router.put("/:id", updateRole);

// DELETE /api/roles/:id - Delete role
router.delete("/:id", deleteRole);

// POST /api/roles/permissions - Assign permission to role
router.post("/permissions", assignPermissionToRole);

// DELETE /api/roles/:roleId/permissions/:permissionId - Remove permission from role
router.delete("/:roleId/permissions/:permissionId", removePermissionFromRole);

export default router;
