import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Test Firebase Storage connectivity and configuration
 */
export const testStorageConnectivity = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing Firebase Storage connectivity...');
    
    // Check if storage is initialized
    if (!storage) {
      return { success: false, error: 'Firebase Storage is not initialized' };
    }

    // Check if storage app has proper configuration
    if (!storage.app || !storage.app.options) {
      return { success: false, error: 'Firebase Storage app is not configured' };
    }

    const storageBucket = storage.app.options.storageBucket;
    console.log('🪣 Storage bucket:', storageBucket);
    
    if (!storageBucket) {
      return { success: false, error: 'Firebase Storage bucket is not configured' };
    }

    // Try to create a reference (this doesn't actually hit the server)
    const testRef = ref(storage, `connectivity-test/${Date.now()}`);
    
    if (!testRef) {
      return { success: false, error: 'Unable to create storage reference' };
    }

    console.log('✅ Storage connectivity test passed');
    return { success: true };
  } catch (error) {
    console.error('❌ Storage connectivity test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

/**
 * Upload file to Firebase Storage with proper error handling
 */
export const uploadFileToStorage = async (
  file: File, 
  path: string
): Promise<{ success: boolean; downloadURL?: string; error?: string }> => {
  try {
    console.log(`📤 Uploading file to: ${path}`);
    
    // Test connectivity first
    const connectivityTest = await testStorageConnectivity();
    if (!connectivityTest.success) {
      return { success: false, error: connectivityTest.error };
    }

    // Create storage reference
    const storageRef = ref(storage, path);
    console.log('📁 Storage reference:', storageRef.fullPath);

    // Upload the file
    console.log('⬆️ Starting file upload...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('✅ File uploaded successfully');

    // Get download URL
    console.log('🔗 Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL obtained');

    return { success: true, downloadURL };
  } catch (error) {
    console.error('❌ File upload failed:', error);
    
    let errorMessage = 'Upload failed';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      console.error('🔥 Firebase error code:', firebaseError.code);
      
      switch (firebaseError.code) {
        case 'storage/unauthorized':
          errorMessage = 'Permission denied. Please ensure you are logged in.';
          break;
        case 'storage/canceled':
          errorMessage = 'Upload was canceled.';
          break;
        case 'storage/unknown':
          errorMessage = 'Storage service unavailable. Please try again later.';
          break;
        case 'storage/invalid-format':
          errorMessage = 'Invalid file format.';
          break;
        case 'storage/object-not-found':
          errorMessage = 'File not found.';
          break;
        case 'storage/quota-exceeded':
          errorMessage = 'Storage quota exceeded.';
          break;
        case 'storage/invalid-checksum':
          errorMessage = 'File upload failed due to checksum mismatch.';
          break;
        case 'storage/retry-limit-exceeded':
          errorMessage = 'Upload retry limit exceeded.';
          break;
        default:
          errorMessage = firebaseError.message || 'Storage service unavailable';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};