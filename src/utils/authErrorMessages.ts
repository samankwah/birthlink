// Firebase Auth Error Code to User-Friendly Message Mapping
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or create a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/invalid-credential':
      return 'Invalid credentials provided. Please check your email and password.';
    case 'auth/account-exists-with-different-credential':
      return 'An account with this email exists with different sign-in credentials.';
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please sign in again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/timeout':
      return 'Request timed out. Please try again.';
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'unavailable':
      return 'Service is currently unavailable. Please try again later.';
    case 'not-found':
      return 'The requested resource was not found.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Extract error code from Firebase error object
export const extractErrorCode = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    if (error.message.includes('/')) {
      const match = error.message.match(/auth\/[\w-]+/);
      return match ? match[0] : 'unknown';
    }
  }
  return 'unknown';
};

// Main function to get user-friendly error message from any error
export const getFormattedErrorMessage = (error: unknown): string => {
  const errorCode = extractErrorCode(error);
  return getAuthErrorMessage(errorCode);
};