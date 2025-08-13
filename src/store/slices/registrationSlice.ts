import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { BirthRegistration, RegistrationFormData } from '../../types';

interface RegistrationState {
  registrations: BirthRegistration[];
  currentRegistration: BirthRegistration | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: unknown; // For pagination
}

const initialState: RegistrationState = {
  registrations: [],
  currentRegistration: null,
  isLoading: false,
  error: null,
  hasMore: true,
  lastDoc: null
};

// Helper function to generate registration number
const generateRegistrationNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  // This would typically come from a Cloud Function or system config
  const sequence = Date.now().toString().slice(-6); // Temporary implementation
  return `GHA-${year}-${sequence}`;
};

// Async thunks
export const createRegistration = createAsyncThunk(
  'registrations/create',
  async (formData: RegistrationFormData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { user: import('../../types').User | null } };
      const userId = state.auth.user?.uid;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      console.log('Creating registration with data:', formData);
      
      const registrationNumber = await generateRegistrationNumber();
      
      const registrationData: Omit<BirthRegistration, 'id'> = {
        registrationNumber,
        childDetails: {
          ...formData.childDetails,
          dateOfBirth: new Date(formData.childDetails.dateOfBirth)
        },
        motherDetails: {
          ...formData.motherDetails,
          dateOfBirth: new Date(formData.motherDetails.dateOfBirth)
        },
        fatherDetails: {
          ...formData.fatherDetails,
          dateOfBirth: new Date(formData.fatherDetails.dateOfBirth)
        },
        registrarInfo: {
          registrarId: userId,
          registrationDate: new Date(),
          location: state.auth.user?.profile.location?.district || state.auth.user?.profile.district || 'Unknown',
          region: state.auth.user?.profile.location?.region || state.auth.user?.profile.region || 'Unknown',
          district: state.auth.user?.profile.location?.district || state.auth.user?.profile.district || 'Unknown'
        },
        status: 'draft',
        syncStatus: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('Adding document to Firestore:', registrationData);
      
      // Check if we have a valid db connection
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const docRef = await addDoc(collection(db, 'registrations'), registrationData);
      
      console.log('Document created with ID:', docRef.id);
      
      const result = {
        id: docRef.id,
        ...registrationData
      } as BirthRegistration;
      
      return result;
    } catch (error: any) {
      console.error('Registration creation failed:', error);
      return rejectWithValue(error.message || 'Failed to create registration');
    }
  }
);

export const updateRegistration = createAsyncThunk(
  'registrations/update',
  async ({ id, updates }: { id: string; updates: Partial<BirthRegistration> }) => {
    const registrationRef = doc(db, 'registrations', id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(registrationRef, updateData);
    
    return { id, updates: updateData };
  }
);

export const fetchRegistrations = createAsyncThunk(
  'registrations/fetchAll',
  async ({ 
    pageSize = 20, 
    userId,
    region 
  }: { 
    pageSize?: number; 
    userId?: string;
    region?: string;
  }, { getState }) => {
    const state = getState() as { registrations: RegistrationState };
    const lastDoc = state.registrations.lastDoc;
    
    let q = query(
      collection(db, 'registrations'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    // Add filters
    if (userId) {
      q = query(q, where('registrarInfo.registrarId', '==', userId));
    }
    if (region) {
      q = query(q, where('registrarInfo.region', '==', region));
    }
    
    // Add pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const registrations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BirthRegistration));
    
    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      registrations,
      lastDoc: lastDocument,
      hasMore: querySnapshot.docs.length === pageSize
    };
  }
);

export const fetchRegistrationById = createAsyncThunk(
  'registrations/fetchById',
  async (id: string) => {
    const docRef = doc(db, 'registrations', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Registration not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as BirthRegistration;
  }
);

const registrationSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRegistration: (state, action: PayloadAction<BirthRegistration | null>) => {
      state.currentRegistration = action.payload;
    },
    resetPagination: (state) => {
      state.lastDoc = null;
      state.hasMore = true;
      state.registrations = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Registration
      .addCase(createRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrations.unshift(action.payload);
        state.currentRegistration = action.payload;
      })
      .addCase(createRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create registration';
      })
      // Update Registration
      .addCase(updateRegistration.fulfilled, (state, action) => {
        const index = state.registrations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.registrations[index] = { 
            ...state.registrations[index], 
            ...action.payload.updates 
          };
        }
        if (state.currentRegistration?.id === action.payload.id) {
          state.currentRegistration = { 
            ...state.currentRegistration, 
            ...action.payload.updates 
          };
        }
      })
      // Fetch Registrations
      .addCase(fetchRegistrations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrations = [
          ...state.registrations,
          ...action.payload.registrations
        ];
        state.lastDoc = action.payload.lastDoc;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch registrations';
      })
      // Fetch Registration by ID
      .addCase(fetchRegistrationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRegistrationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRegistration = action.payload;
      })
      .addCase(fetchRegistrationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch registration';
      });
  }
});

export const { clearError, setCurrentRegistration, resetPagination } = registrationSlice.actions;
export default registrationSlice.reducer;