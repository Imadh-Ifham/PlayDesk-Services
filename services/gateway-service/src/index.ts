import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // shared
dotenv.config({ path: path.resolve(__dirname, "../.env") }); // local override

import { verifyToken } from "./verifyToken";
import { setupProxies } from "./proxyConfig";

const app = express();
const PORT = process.env.PORT_GATEWAY || 8000;

app.use(cors());
app.use(express.json());

app.use("/api", verifyToken);
setupProxies(app);

app.listen(PORT, () => {
  console.log(`Gateway is running at http://localhost:${PORT}`);
});
