import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  getAdditionalUserInfo,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from './firebase-applet-config.json';

export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let ongoingGoogleSignIn: Promise<FirebaseUser> | null = null;

/**
 * Sign in or sign up with official Google OAuth via Firebase.
 * Invokes signInWithPopup immediately and synchronously to preserve browser gesture context,
 * with single-flight mutex lock to prevent concurrent popup race conditions.
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (ongoingGoogleSignIn) {
    return ongoingGoogleSignIn;
  }

  ongoingGoogleSignIn = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      const resolvedEmail = (
        user.email ||
        user.providerData?.[0]?.email ||
        (user as any).reloadUserInfo?.email ||
        (additionalInfo?.profile as any)?.email ||
        ''
      ).toLowerCase().trim();

      const resolvedName =
        user.displayName ||
        user.providerData?.[0]?.displayName ||
        (additionalInfo?.profile as any)?.name ||
        (resolvedEmail ? resolvedEmail.split('@')[0] : 'Member');

      // Sync user profile to Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          email: resolvedEmail,
          displayName: resolvedName,
          photoURL: user.photoURL || user.providerData?.[0]?.photoURL || '',
          lastLoginAt: new Date().toISOString(),
          provider: 'google',
        }, { merge: true });
      } catch (err) {
        console.warn('Error saving user profile to Firestore:', err);
      }

      return user;
    } catch (err: any) {
      if (err?.message?.includes('Pending promise was never set')) {
        if (auth.currentUser) {
          return auth.currentUser;
        }
      }
      throw err;
    } finally {
      ongoingGoogleSignIn = null;
    }
  })();

  return ongoingGoogleSignIn;
}

/**
 * Sign in with Google Redirect (for mobile browsers or environments with strict popup blockers)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Handle redirect result after returning from Google OAuth
 */
export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Member',
            photoURL: user.photoURL || '',
            lastLoginAt: new Date().toISOString(),
            provider: 'google',
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Error saving redirect user profile:', err);
      }
      return user;
    }
  } catch (err) {
    console.warn('Error checking redirect result:', err);
  }
  return null;
}

/**
 * Sign up with Email and Password
 * Automatically triggers official Firebase verification email to the real inbox!
 */
export async function registerWithEmail(email: string, pass: string, name?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Send real verification email directly from Google infrastructure
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.warn('Could not trigger verification email:', err);
  }

  // Save to Firestore
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      id: user.uid,
      email: user.email || '',
      displayName: name || email.split('@')[0],
      photoURL: '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      provider: 'password',
    });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
  }

  return user;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error updating login timestamp:', err);
  }

  return user;
}

/**
 * Send password reset email directly to real Gmail inbox
 */
export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(user: FirebaseUser) {
  return sendEmailVerification(user);
}

/**
 * Sign out
 */
export async function logoutUser() {
  return signOut(auth);
}

export { onAuthStateChanged, type FirebaseUser };

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
  }
}
testConnection();
