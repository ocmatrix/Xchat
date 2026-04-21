import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Connection test - Ensures the Firestore security rules are correctly configured for public health checks
async function testConnection() {
  try {
    // We attempt to read a public health document. 
    // Even if it doesn't exist, a successful "Permission Granted" response validates the DB link.
    await getDocFromServer(doc(db, 'system', 'ping'));
    console.log('📡 NEXUS_CORE::LINK_STABLE');
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error('❌ NEXUS_SECURITY_FAULT::Permission denied. Please check firestore.rules deployment.');
    } else if (error.message && error.message.includes('the client is offline')) {
      console.warn('⚠️ NEXUS_CORE::OFFLINE_MODE');
    } else {
      console.error('❌ NEXUS_CORE::CONNECTION_ERROR', error);
    }
  }
}

testConnection();
