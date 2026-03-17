import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

function getFirebaseConfig() {
  return (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.projectId)
    ? window.FIREBASE_CONFIG
    : null;
}

let _db = null;
let _status = "not_initialized";

export function firebaseReady() {
  return !!_db;
}

export async function queueEmail(payload) {
  if (!_db) throw new Error("Firebase not initialized");
  const ref = collection(_db, "mail");
  try {
    const docRef = await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
    // eslint-disable-next-line no-console
    console.log("[firebase-email] queued mail doc:", docRef.id);
    return docRef;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[firebase-email] queueEmail failed:", e);
    throw e;
  }
}

(function init() {
  window.firebaseMailReady = () => !!_db;
  window.firebaseMailStatus = () => _status;
  // Expose a stable function even before init completes (for clearer errors).
  window.queueEmail = async (payload) => queueEmail(payload);
  try {
    const cfg = getFirebaseConfig();
    if (!cfg) {
      _status = "missing_config";
      // eslint-disable-next-line no-console
      console.warn("[firebase-email] missing FIREBASE_CONFIG (see firebase-config.js)");
      return;
    }
    const app = initializeApp(cfg);
    _db = getFirestore(app);
    _status = "ready";
    // eslint-disable-next-line no-console
    console.log("[firebase-email] ready");
  } catch (e) {
    _status = "init_error";
    // eslint-disable-next-line no-console
    console.warn("[firebase-email] not ready:", e);
  }
})();
