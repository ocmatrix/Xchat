/**
 * Nexus Utility Service
 * Environment detection and device-specific optimizations.
 */
export const NexusUtilityService = {
  isIOS: (): boolean => {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  },

  isStandalone: (): boolean => {
    return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
  },

  vibrate: (pattern: number | number[]) => {
    if ('vibration' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silent fail for non-supported browsers
      }
    }
  }
};
