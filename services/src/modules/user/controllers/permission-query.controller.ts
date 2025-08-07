import { Request, Response } from "express";
import { PermissionService } from "../services/permission.service";
import { PermissionQueryService } from "../services/permission-query.service";

/**
 * Get permissions grouped by category
 */
export const getPermissionsByCategory = async (req: Request, res: Response) => {
  try {
    const groupedPermissions = await PermissionService.findByCategory();
    res.json(groupedPermissions);
  } catch (error) {
    console.error("Error fetching permissions by category:", error);
    res.status(500).json({
      error: "Failed to fetch permissions by category",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get permission statistics
 */
export const getPermissionStats = async (req: Request, res: Response) => {
  try {
    const stats = await PermissionQueryService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching permission stats:", error);
    res.status(500).json({
      error: "Failed to fetch permission statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get permission usage analytics
 */
export const getPermissionUsageAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const analytics = await PermissionQueryService.getUsageAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching permission usage analytics:", error);
    res.status(500).json({
      error: "Failed to fetch permission usage analytics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get category statistics
 */
export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const categoryStats = await PermissionQueryService.getCategoryStats();
    res.json(categoryStats);
  } catch (error) {
    console.error("Error fetching category stats:", error);
    res.status(500).json({
      error: "Failed to fetch category statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
