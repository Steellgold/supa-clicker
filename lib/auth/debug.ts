// Script de débogage à ajouter temporairement dans un composant pour diagnostiquer
// les problèmes d'authentification en production

export const authDebugInfo = () => {
  if (typeof window !== 'undefined') {
    console.log('=== AUTH DEBUG INFO ===')
    console.log('Current URL:', window.location.href)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Has Supabase Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Vérifier les cookies Supabase
    const cookies = document.cookie.split(';').filter(cookie => 
      cookie.trim().includes('sb-') || cookie.trim().includes('supabase')
    )
    console.log('Supabase cookies:', cookies)
    
    // Vérifier le localStorage pour les tokens
    const authToken = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('://')[1]?.split('.')[0] + '-auth-token')
    console.log('Auth token in localStorage:', !!authToken)
    
    console.log('=== END DEBUG INFO ===')
  }
}
