'use client'

import Link from 'next/link'
import { ReactElement } from 'react'
import { useSearchParams } from 'next/navigation'

const AuthCodeErrorPage = (): ReactElement => {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'otp_verification_failed':
        return 'Failed to verify magic link. The link may be expired or invalid.'
      case 'pkce_verification_failed':
        return 'Failed to verify magic link. The link may be expired or invalid.'
      case 'code_exchange_failed':
        return 'Failed to authenticate. The link may be expired or invalid.'
      case 'missing_parameters':
        return 'Invalid authentication link. Please request a new magic link.'
      case 'unexpected_error':
        return 'An unexpected error occurred during authentication.'
      default:
        return 'An error occurred during authentication. Please try again.'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-neutral-600 mb-6">
          {getErrorMessage(error)}
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full justify-center"
          >
            Back to Home
          </Link>
          <p className="text-sm text-neutral-500">
            If the problem persists, try requesting a new magic link from the home page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthCodeErrorPage;