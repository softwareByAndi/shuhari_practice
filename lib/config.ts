/**
 * Application Configuration
 *
 * This file centralizes configuration for switching between local/mock
 * and remote/production data sources.
 */

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const forceLocalMode = true; //process.env.NEXT_PUBLIC_FORCE_LOCAL_MODE === 'true';

/**
 * USE_LOCAL_STATIC_DATA - When true, uses cached JSON files for static data
 * (fields, subjects, topics, stages, difficulty levels, etc.)
 *
 * Benefits:
 * - Faster loading (no network requests)
 * - Works offline
 * - Reduces database load
 * - Consistent test data
 *
 * To update cached data: run `npm run export-data`
 */
export const USE_LOCAL_STATIC_DATA = forceLocalMode || true;

/**
 * USE_LOCAL_AUTH - When true, uses mock authentication without Supabase
 *
 * Benefits:
 * - No Supabase setup required for development
 * - Works offline
 * - Fast authentication for testing
 * - Predictable test users
 *
 * Test accounts available:
 * - test@example.com / password123
 * - admin@example.com / admin123
 */
export const USE_LOCAL_AUTH = forceLocalMode || true;

/**
 * Display mode indicators in development
 */
export const SHOW_MODE_INDICATOR = isDevelopment;

/**
 * Get current mode summary for debugging
 */
export function getCurrentMode() {
  return {
    staticData: USE_LOCAL_STATIC_DATA ? 'local' : 'remote',
    auth: USE_LOCAL_AUTH ? 'local' : 'remote',
    environment: process.env.NODE_ENV,
  };
}

/**
 * Log current configuration (useful for debugging)
 */
export function logConfiguration() {
  console.log('🔧 Application Configuration:', {
    'Static Data': USE_LOCAL_STATIC_DATA ? '📦 Local JSON' : '🌐 Supabase',
    'Authentication': USE_LOCAL_AUTH ? '🔐 Local Mock' : '🌐 Supabase',
    'Environment': process.env.NODE_ENV,
    'Show Indicators': SHOW_MODE_INDICATOR,
  });
}