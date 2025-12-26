/**
 * Convert Firebase error codes to user-friendly messages
 */
export const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code || error?.message || '';
  
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      // Return the original error message if it's user-friendly, otherwise a generic message
      if (error?.message && !error.message.includes('auth/')) {
        return error.message;
      }
      return 'An error occurred. Please try again.';
  }
};








