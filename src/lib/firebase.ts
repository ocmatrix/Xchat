import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
    console.log('✅ NEXUS_DB_LINK::ESTABLISHED');
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.warn('⚠️ NEXUS_DB_LINK::OFFLINE_MODE');
    } else {
      console.error('❌ NEXUS_DB_LINK::ERROR', error);
    }
  }
}

testConnection();
