import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { setFirebaseUser, setUser, setLoading } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store';
import type { User } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return;
    isInitialized.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch(setLoading(true));
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const firestoreData = userDoc.data();
            
            // Create serializable user object
            const userData: User = {
              uid: firebaseUser.uid,
              email: firestoreData?.email || '',
              role: firestoreData?.role || 'viewer',
              profile: firestoreData?.profile || {},
              preferences: firestoreData?.preferences || { language: 'en', notifications: true },
              status: firestoreData?.status || 'active',
              createdAt: {
                seconds: firestoreData?.createdAt?.seconds || Math.floor(Date.now() / 1000),
                nanoseconds: firestoreData?.createdAt?.nanoseconds || 0
              },
              lastLogin: {
                seconds: Math.floor(Date.now() / 1000),
                nanoseconds: 0
              }
            };
            
            dispatch(setUser(userData));
            dispatch(setFirebaseUser(firebaseUser));
          } else {
            // User document doesn't exist, sign out
            console.warn('User document not found, signing out');
            dispatch(setUser(null));
            dispatch(setFirebaseUser(null));
            await auth.signOut();
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch(setUser(null));
          dispatch(setFirebaseUser(null));
          await auth.signOut();
        }
      } else {
        dispatch(setUser(null));
        dispatch(setFirebaseUser(null));
      }
      
      dispatch(setLoading(false));
    });

    return () => {
      unsubscribe();
      isInitialized.current = false;
    };
  }, []); // Remove dispatch from dependencies to prevent re-initialization

  return authState;
};