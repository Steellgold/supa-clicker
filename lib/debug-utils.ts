export const DEBUG_STORAGE_KEY = 'debug_modified';

export const hasDebugModifications = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEBUG_STORAGE_KEY) === 'true';
};

export const markDebugModified = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
};

export const clearDebugModifications = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEBUG_STORAGE_KEY);
};

export const shouldShowDebugCard = (isAuthenticated: boolean): boolean => {
  return process.env.NODE_ENV === 'development' && !isAuthenticated;
};

export const handlePostDebugAuthReset = () => {
  if (hasDebugModifications()) {
    const gameKeys = [
      'clicker_game_save',
      'debug_modified',
      'bulk_buy_option',
    ];
    
    gameKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('achievements_viewed_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🚨 Debug modifications detected - All game data has been reset due to authentication');
    
    return true;
  }
  
  return false;
};