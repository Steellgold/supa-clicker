import Link from 'next/link'
import { ReactElement } from 'react'

const AuthCodeErrorPage = (): ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <p className="text-neutral-600 mb-6">
          An error occurred during authentication. Please try again.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default AuthCodeErrorPage;