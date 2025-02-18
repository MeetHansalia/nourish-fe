// Component Imports
import LoginOld from '@/views/blank-layout-pages/LoginOld'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = () => {
  // Vars
  const mode = getServerMode()

  return <LoginOld mode={mode} />
}

export default LoginPage
