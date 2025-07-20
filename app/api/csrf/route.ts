import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const timestamp = Date.now()
    const randomData = randomBytes(16).toString('hex')
    // Use a separator that won't conflict with UUID format
    const tokenData = `${user.id}|${timestamp}|${randomData}`
    const token = Buffer.from(tokenData).toString('base64')

    return NextResponse.json({ csrfToken: token })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}