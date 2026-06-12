import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let initialized = false;

export function initFirebase() {
  if (initialized || admin.apps.length > 0) return;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH no está definido en .env');
  }

  const serviceAccount = JSON.parse(
    readFileSync(resolve(serviceAccountPath), 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
}

export async function verifyToken(token) {
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded;
}
