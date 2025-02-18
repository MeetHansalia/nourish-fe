'use client'

// React Imports
import { useEffect } from 'react'

// Server Action Imports
import { navigate } from '@/app/server/actions'

const ClientRedirect = ({ redirectPath }) => {
  useEffect(() => {
    console.log('redirect run here: ', redirectPath)
    navigate({ url: redirectPath })
  }, [])

  return <div>Redirecting...</div>
}

export default ClientRedirect
