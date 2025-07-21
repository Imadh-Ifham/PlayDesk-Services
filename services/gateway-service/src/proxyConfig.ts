import { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

export function setupProxies(app: Application) {
  app.use(
    "/api/booking",
    createProxyMiddleware({
      target: `http://localhost:${process.env.PORT_BOOKING}`, // booking-service
      changeOrigin: true,
      pathRewrite: { "^/api/booking": "" },
    })
  );

  app.use(
    "/api/machine",
    createProxyMiddleware({
      target: `http://localhost:${process.env.PORT_MACHINE}`, // machine-service
      changeOrigin: true,
      pathRewrite: { "^/api/machine": "" },
    })
  );

  // Add more services as needed
}
