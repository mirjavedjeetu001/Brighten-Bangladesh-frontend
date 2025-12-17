import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';

const VISITOR_ID_KEY = 'bb_visitor_id';
const SESSION_KEY = 'bb_session_tracked';

// Generate a unique visitor ID
const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  return visitorId;
};

// Check if this session has been tracked
const isSessionTracked = (): boolean => {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
};

// Mark session as tracked
const markSessionTracked = (): void => {
  sessionStorage.setItem(SESSION_KEY, 'true');
};

// Track page view
const trackPageView = async () => {
  try {
    await apiClient.post('/analytics/page-view', {});
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Failed to track page view:', error);
  }
};

// Track unique visitor (once per session)
const trackUniqueVisitor = async () => {
  try {
    if (!isSessionTracked()) {
      const visitorId = getOrCreateVisitorId();
      await apiClient.post('/analytics/unique-visitor', { visitorId });
      markSessionTracked();
    }
  } catch (error) {
    // Silently fail
    console.debug('Failed to track unique visitor:', error);
  }
};

export const usePageViewTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track unique visitor on first load
    trackUniqueVisitor();
  }, []);

  useEffect(() => {
    // Track page view on route change
    trackPageView();
  }, [location.pathname]);
};
