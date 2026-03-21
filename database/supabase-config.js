// Supabase Configuration - Simple Direct Initialization
// This file is loaded AFTER the Supabase library
// The supabase client is initialized in index.html and available as window.supabase

console.log('📦 supabase-config.js loaded');

// For debugging - check if supabase is available
setTimeout(() => {
  if (window.supabase) {
    console.log('✓ Supabase library available on window');
  } else {
    console.warn('⚠️ Supabase library not found on window');
  }
}, 100);
