// src/server.ts
import app from "./app";
import { connectDB } from "./config/db";
import { initializeFirebase } from "./config/firebase";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    await initializeFirebase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
