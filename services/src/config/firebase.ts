// src/config/firebase.ts
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

export async function initializeFirebase() {
  try {
    // For local dev, load serviceAccountKey JSON from file or environment variable
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT ||
        readFileSync(
          path.resolve(__dirname, "../../firebase-service-account.json"),
          "utf8"
        )
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized");
  } catch (error) {
    console.error("Firebase initialization failed", error);
    throw error;
  }
}

export const firebaseAdmin = admin;
