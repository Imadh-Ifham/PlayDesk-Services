import { Router } from "express";
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionsByCategory,
  getPermissionStats,
} from "../controllers/permission.controller";

const router = Router();

// GET /api/permissions - Get all permissions with filtering and pagination
router.get("/", getPermissions);

// GET /api/permissions/stats - Get permission statistics
router.get("/stats", getPermissionStats);

// GET /api/permissions/categories - Get permissions grouped by category
router.get("/categories", getPermissionsByCategory);

// GET /api/permissions/:id - Get permission by ID
router.get("/:id", getPermissionById);

// POST /api/permissions - Create new permission
router.post("/", createPermission);

// PUT /api/permissions/:id - Update permission
router.put("/:id", updatePermission);

// DELETE /api/permissions/:id - Delete permission
router.delete("/:id", deletePermission);

export default router;
