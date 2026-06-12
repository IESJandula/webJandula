import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let initialized = false;

export function initFirebase() {
  if (initialized || admin.apps.length > 0) return;

  let serviceAccount;

  // Producción (Dokploy): pega el JSON entero como variable de entorno
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  // Desarrollo local: ruta al fichero
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = JSON.parse(
      readFileSync(resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8')
    );
  } else {
    throw new Error(
      'Define FIREBASE_SERVICE_ACCOUNT_JSON (producción) o FIREBASE_SERVICE_ACCOUNT_PATH (desarrollo local)'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
}

export async function verifyToken(token) {
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded;
}
