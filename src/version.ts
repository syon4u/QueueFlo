
/**
 * QUEUE FLOW Version Information
 * 
 * This file contains version information for the QUEUE FLOW application.
 * It is automatically updated during the release process.
 */

export const VERSION = '1.0.0-beta';
export const BUILD_DATE = '2025-05-11';
export const ENVIRONMENT = import.meta.env.MODE || 'production';

/**
 * Returns a formatted version string for display
 */
export const getVersionString = () => {
  return `v${VERSION} (${BUILD_DATE})`;
};

/**
 * Returns an object with all version information
 */
export const getVersionInfo = () => {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    environment: ENVIRONMENT,
  };
};
