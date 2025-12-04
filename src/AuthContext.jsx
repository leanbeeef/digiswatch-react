import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Firestore imports
import { db } from './firebase'; // Import Firestore configuration

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks if Firebase auth is still initializing
  const auth = getAuth();

  // Fetch additional user data from Firestore
  const fetchUserData = async (user) => {
    if (!user) return null;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return { ...user, ...userDoc.data() }; // Merge Firebase user and Firestore data
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
    }
    return user; // Return Firebase user if Firestore data is unavailable
  };

  // Track authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const enrichedUser = await fetchUserData(user);
        setCurrentUser(enrichedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false); // Authentication state initialized
    });
    return unsubscribe; // Cleanup the listener on component unmount
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
      try {
        const result = await signInWithPopup(auth, provider);
        const enrichedUser = await fetchUserData(result.user);
        setCurrentUser(enrichedUser);
        return enrichedUser;
      } catch (popupError) {
        // Fallback to redirect for environments blocking popups
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
