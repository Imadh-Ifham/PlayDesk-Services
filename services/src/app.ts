// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middlewares/errorHandler";
import { authGuard } from "./middlewares/authGuard";

import permissionRoutes from "./modules/user/routes/permission.routes";

// import userRoutes from './modules/user/user.routes';
// import authRoutes from './modules/auth/auth.routes';
// import loungeRoutes from './modules/lounge/lounge.routes';
// import bookingRoutes from './modules/booking/booking.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes that don't require auth
// app.use('/api/auth', authRoutes);

// Routes that require auth
app.use(authGuard); // This protects all routes below this line

// app.use('/api/users', userRoutes);
// app.use('/api/lounge', loungeRoutes);
// app.use('/api/bookings', bookingRoutes);
app.use("/api/permissions", permissionRoutes);

// Global error handler
app.use(errorHandler);

export default app;
