/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Cloudflare Workers edge mode uses D1 (real database) instead of Firebase.
// Firebase domain authorization errors are avoided by not initializing Firebase.
export const isLocalStorageFallback = false;
export const isD1Mode = true;

let app;
let dbInstance: any = null;
let authInstance: any = null;

// In D1 mode (Cloudflare Workers edge), we skip Firebase entirely.
// The app uses cloudService.ts (D1-backed API) instead.
if (!isLocalStorageFallback && !isD1Mode) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    dbInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
    authInstance = getAuth(app);
  } catch (error) {
    console.warn("Could not initialize Firebase backend, stepping back to Local Mock Database mode:", error);
  }
}

export const db = dbInstance;
export const auth = authInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Payload:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

import { doc, getDocFromServer } from 'firebase/firestore';

export async function testConnection() {
  if (isLocalStorageFallback || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore backend connectivity validated successfully.");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: the client is offline.");
    } else {
      console.log("Firebase Firestore check completed on startup.");
    }
  }
}

