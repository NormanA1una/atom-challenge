import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore | null = null;

/** Returns the singleton Firestore instance, initializing Firebase Admin once. */
export function getFirestoreClient(): Firestore {
  if (!db) {
    if (!getApps().length) {
      initializeApp();
    }
    db = getFirestore();
  }
  return db;
}
