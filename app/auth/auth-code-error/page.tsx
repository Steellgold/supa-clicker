'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

const AuthCodeErrorPage = (): ReactElement => {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-neutral-600 mb-6">
          An error occurred while trying to verify your authentication code. This could be due to an invalid or expired link.
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