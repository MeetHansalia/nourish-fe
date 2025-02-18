// Third-party Imports
import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth'

// Server Actions
import { getLangFromUrl } from '@/app/server/actions'

// Lib Imports
import { authOptions } from '@/libs/auth'

/**
 * Page
 */
const axiosApiCall = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'any',
    Accept: 'application/json'
  }
})

// Add a request interceptor
axiosApiCall.interceptors.request.use(
  async config => {
    /**
     * Set Authorization Token in Header
     */
    const session = await getSession()
    const authorizationToken = session?.access_token || ''

    if (authorizationToken && !config?.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${authorizationToken}`
    }

    if (!authorizationToken && !config?.headers?.Authorization && typeof window === 'undefined') {
      const serverSession = await getServerSession(authOptions)
      const serverSessionAuthorizationToken = serverSession?.access_token || ''

      if (serverSessionAuthorizationToken) {
        config.headers.Authorization = `Bearer ${serverSessionAuthorizationToken}`
      }
    }

    /**
     * Set Accept-Language in Header
     */
    const lang = await getLangFromUrl()

    if (lang && !config?.headers?.['Accept-Language']) {
      config.headers['Accept-Language'] = lang
    }

    return config
  },
  error => Promise.reject(error)
)

// Add response interceptor
axiosApiCall.interceptors.response.use(
  response => response,
  async error => {
    const { response } = error
    const responseBody = response?.data
    const responseBodyData = responseBody?.data

    if (response && response?.status === 401) {
      console.log('manually logout user')

      // await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/' + locale })
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
    }

    return Promise.reject(error)
  }
)

export default axiosApiCall
