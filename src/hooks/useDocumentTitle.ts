import { useEffect } from 'react';

/**
 * Custom hook to dynamically set the document title
 * @param title - The page title
 * @param suffix - Optional suffix (defaults to "BirthLink Ghana")
 */
export const useDocumentTitle = (title: string, suffix = 'BirthLink Ghana') => {
  useEffect(() => {
    const previousTitle = document.title;
    
    // Set the new title
    document.title = title ? `${title} - ${suffix}` : suffix;
    
    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

/**
 * Custom hook to set document title for loading states
 * @param isLoading - Loading state
 * @param loadingTitle - Title to show while loading
 * @param normalTitle - Title to show when not loading
 * @param suffix - Optional suffix (defaults to "BirthLink Ghana")
 */
export const useDocumentTitleWithLoading = (
  isLoading: boolean,
  loadingTitle: string,
  normalTitle: string,
  suffix = 'BirthLink Ghana'
) => {
  const title = isLoading ? loadingTitle : normalTitle;
  useDocumentTitle(title, suffix);
};