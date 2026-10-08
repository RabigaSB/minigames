// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBU5aXsRB8r2Sf1jd-d5oulvyNcPbDLIqg',
  authDomain: 'minigames-app-734e1.firebaseapp.com',
  projectId: 'minigames-app-734e1',
  storageBucket: 'minigames-app-734e1.firebasestorage.app',
  messagingSenderId: '219224616604',
  appId: '1:219224616604:web:9bdd214dda4d516f5a0759',
  measurementId: 'G-PESPF927PK',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
};
export const logOut = () => signOut(auth);
export const updateUserProfile = (displayName: string, photoURL: string) =>
  updateProfile(auth.currentUser!, { displayName, photoURL });
