/**
 * ZEST TOURNAMENT - FIREBASE REALTIME SDK INTEGRATION
 * Synchronizes app releases, downloads, and tournament updates in real-time across all players.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// Official Firebase configuration (Project: zest-tournament-website-f7498)
const firebaseConfig = {
  apiKey: "AIzaSyD3hrWMbmQHWLbs8Vd601a62nQiJm0DKxk",
  authDomain: "zest-tournament-website-f7498.firebaseapp.com",
  projectId: "zest-tournament-website-f7498",
  storageBucket: "zest-tournament-website-f7498.firebasestorage.app",
  messagingSenderId: "430092445826",
  appId: "1:430092445826:web:f2d65e7f05136d2f3bac9b",
  measurementId: "G-9FZM74RYYR"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Firebase Analytics initialization skipped or in unsupported environment");
}

/**
 * Realtime listener for app releases:
 * Triggers callback immediately and on every live update from the owner.
 */
export function listenToAppRelease(callback) {
  try {
    const releaseRef = doc(db, "app_releases", "latest");
    return onSnapshot(releaseRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data);
      }
    }, (error) => {
      console.warn("Firestore snapshot listener notice (fallback to local/offline):", error.message);
    });
  } catch (err) {
    console.warn("Could not attach Firestore realtime listener:", err);
  }
}

/**
 * Save new app release metadata to Firestore
 */
export async function saveAppReleaseToFirestore(releaseData) {
  const releaseRef = doc(db, "app_releases", "latest");
  await setDoc(releaseRef, {
    ...releaseData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Upload APK / IPA / File to Firebase Storage with live progress callback
 */
export function uploadFileToFirebaseStorage(file, folder = "apks", onProgress = null) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageRef = ref(storage, `${folder}/${timestamp}_${cleanFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          fileName: file.name,
          fileSize: file.size,
          path: storageRef.fullPath
        });
      }
    );
  });
}

// Expose on window for vanilla integration
window.FirebaseRealtime = {
  app,
  db,
  storage,
  listenToAppRelease,
  saveAppReleaseToFirestore,
  uploadFileToFirebaseStorage
};
