// Component Imports
import ResetPasswordV1 from '@views/pages/auth/ResetPasswordV1'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
export const metadata = {
  title: 'Reset Password',
  description: 'Reset Password to your account'
}
const ResetPasswordV1Page = async () => {
  // Vars
  const mode = await getServerMode()

  return <ResetPasswordV1 mode={mode} />
}

export default ResetPasswordV1Page
