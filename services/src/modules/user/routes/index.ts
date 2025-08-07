import { Router } from "express";

// Import individual route modules
import permissionRoutes from "./permission.routes";
import roleRoutes from "./role.routes";
// import userRoutes from "./user.routes";

const router = Router();

// Mount sub-routes
// /api/user/permissions
router.use("/permissions", permissionRoutes);

// /api/user/roles
// router.use("/roles", roleRoutes);

// /api/user (main user routes)
// router.use("/", userRoutes);

export default router;
