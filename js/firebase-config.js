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

// Official Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrWAfCQp3NtItrY7aFaaOa3OysbeuQY7U",
  authDomain: "zest-tournament-website.firebaseapp.com",
  projectId: "zest-tournament-website",
  storageBucket: "zest-tournament-website.firebasestorage.app",
  messagingSenderId: "265768396141",
  appId: "1:265768396141:web:82e43353ee8e8c224ea664",
  measurementId: "G-4PSM7BQ3KN"
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
