import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRoleStats,
} from "../controllers/role.controller";
import {
  getRolesByAccount,
  getRolesByLounge,
  canCreateRole,
} from "../controllers/role-query.controller";
import {
  getGlobalRoles,
  getSystemRoles,
  createGlobalRole,
} from "../controllers/role-type.controller";
import {
  assignPermissionToRole,
  removePermissionFromRole,
} from "../controllers/role-permission.controller";

const router = Router();

// GET /api/roles - Get all roles with filtering and pagination
router.get("/", getRoles);

// GET /api/roles/stats - Get role statistics
router.get("/stats", getRoleStats);

// GET /api/roles/can-create - Check if user can create role type
router.get("/can-create", canCreateRole);

// GET /api/roles/global - Get global roles
router.get("/global", getGlobalRoles);

// GET /api/roles/system - Get system roles (admin only)
router.get("/system", getSystemRoles);

// GET /api/roles/account/:accountId - Get roles by account
router.get("/account/:accountId", getRolesByAccount);

// GET /api/roles/lounge/:loungeId - Get roles by lounge
router.get("/lounge/:loungeId", getRolesByLounge);

// GET /api/roles/:id - Get role by ID
router.get("/:id", getRoleById);

// POST /api/roles - Create new role (account type)
router.post("/", createRole);

// POST /api/roles/global - Create global role (admin only)
router.post("/global", createGlobalRole);

// PUT /api/roles/:id - Update role
router.put("/:id", updateRole);

// DELETE /api/roles/:id - Delete role
router.delete("/:id", deleteRole);

// POST /api/roles/permissions - Assign permission to role
router.post("/permissions", assignPermissionToRole);

// DELETE /api/roles/:roleId/permissions/:permissionId/:loungeId? - Remove permission from role
router.delete(
  "/:roleId/permissions/:permissionId/:loungeId",
  removePermissionFromRole
);

export default router;
