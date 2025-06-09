// Component Imports
import VerifyEmailV1 from '@views/pages/auth/VerifyEmailV1'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import VerifyEmail from '@/views/pages/VerifyEmail';

const VerifyEmailV1Page = async () => {
  // Vars
  const mode = await getServerMode()

  return <VerifyEmail/>
}

export default VerifyEmailV1Page
