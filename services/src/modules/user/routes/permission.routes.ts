import { Router } from "express";
import {
  getPermissions,
  getPermissionByKey,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permission.controller";
import {
  getPermissionsByCategory,
  getPermissionStats,
  getPermissionUsageAnalytics,
  getCategoryStats,
} from "../controllers/permission-query.controller";

const router = Router();

// GET /api/permissions - Get all permissions with filtering and pagination
router.get("/", getPermissions);

// GET /api/permissions/stats - Get permission statistics
router.get("/stats", getPermissionStats);

// GET /api/permissions/analytics - Get permission usage analytics
router.get("/analytics", getPermissionUsageAnalytics);

// GET /api/permissions/categories - Get permissions grouped by category
router.get("/categories", getPermissionsByCategory);

// GET /api/permissions/category-stats - Get category statistics
router.get("/category-stats", getCategoryStats);

// GET /api/permissions/:key - Get permission by key
router.get("/:key", getPermissionByKey);

// POST /api/permissions - Create new permission
router.post("/", createPermission);

// PUT /api/permissions/:key - Update permission
router.put("/:key", updatePermission);

// DELETE /api/permissions/:key - Delete permission
router.delete("/:key", deletePermission);

export default router;
