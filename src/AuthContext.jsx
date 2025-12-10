import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks if Firebase auth is still initializing

  // Fetch additional user data from Firestore
  const fetchUserData = async (user) => {
    if (!user) return null;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return { ...user, ...userDoc.data() }; // Merge Firebase user and Firestore data
      }

      // Seed a starter profile if it doesn't exist
      const email = user.email || '';
      const defaultUsername = email.includes('@') ? email.split('@')[0] : 'New user';
      const starterProfile = {
        username: defaultUsername,
        email,
        avatar: '/avatars/avatar (1).png',
        usageGoal: '',
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, starterProfile, { merge: true });
      return { ...user, ...starterProfile };
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
    }
    return user; // Return Firebase user if Firestore data is unavailable
  };

  // Track authentication state changes
  useEffect(() => {
    let resolved = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      resolved = true;
      if (user) {
        const enrichedUser = await fetchUserData(user);
        setCurrentUser(enrichedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Authentication state initialized
    });

    // safety: if the listener never resolves (misconfig), unblock the UI after a short delay
    const failSafe = setTimeout(() => {
      if (!resolved) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      clearTimeout(failSafe);
      unsubscribe();
    };
  }, [auth]);

  // Handle users returning from Google redirect
  useEffect(() => {
    const resolveRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const enrichedUser = await fetchUserData(result.user);
          setCurrentUser(enrichedUser);
        }
      } catch (error) {
        console.error('Google redirect error:', error);
      }
    };
    resolveRedirect();
  }, [auth]);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const enrichedUser = await fetchUserData(userCredential.user);
      setCurrentUser(enrichedUser);
      return enrichedUser;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const enrichedUser = await fetchUserData(userCredential.user);
      setCurrentUser(enrichedUser);
      return enrichedUser;
    } catch (error) {
      console.error('Sign Up Error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Google Sign In Error (redirect):', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signUp,
        loginWithGoogle,
        logout,
      }}
    >
      {loading ? <div></div> : children}
    </AuthContext.Provider>
  );
};
