import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBvodnAScDMvX5AQ8JwNO9IgV1KDUq4r8A",
  authDomain: "freelancer-hub-1edff.firebaseapp.com",
  projectId: "freelancer-hub-1edff",
  storageBucket: "freelancer-hub-1edff.firebasestorage.app",
  messagingSenderId: "856345283751",
  appId: "1:856345283751:web:60b1619b837851a5219f82",
  measurementId: "G-T8E36WG88L",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();

// Custom Google Sign-In helper
export async function signInWithFirebaseGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      avatar: user.photoURL || "",
      idToken,
    };
  } catch (error) {
    console.error("[Firebase Auth Error]", error);
    throw error;
  }
}

// Custom Sign-Out helper
export async function signOutFirebase() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("[Firebase SignOut Error]", error);
  }
}

// Attach globally for accessibility
if (typeof window !== "undefined") {
  window.FreelanceHubFirebase = {
    app,
    auth,
    signInWithFirebaseGoogle,
    signOutFirebase,
  };
}
