'use client'

// Next Imports
import { useParams } from 'next/navigation'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import Link from '@components/Link'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { verifyTradProfessionalEmail } from '@/app/server/trade-professional'

const VerifyEmail = ({ mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const params = useParams()
  const locale = params?.lang
  const verificationToken = params?.token

  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTokenMismatch, setIsTokenMismatch] = useState(false)

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await verifyTradProfessionalEmail(verificationToken, 'status', { status: 1 })

        if (response.success) {
          setUserData(response.data)
        } else {
          setIsTokenMismatch(true)
        }
      } catch (error) {
        setIsTokenMismatch(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (verificationToken) {
      verifyEmail()
    } else {
      setIsLoading(false)
      setIsTokenMismatch(true)
    }
  }, [verificationToken])

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      {isLoading ? (
        <CircularProgress />
      ) : userData ? (
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='p-6 sm:!p-12'>
            <Link href={getLocalizedUrl('/', locale)} className='flex justify-center items-center mbe-6'>
              <Logo />
            </Link>

            <Typography variant='h4' gutterBottom>
              Email Verified Successfully
            </Typography>

            <div className='flex flex-col gap-5'>
              <Typography className='mbs-1'>
                Your email address{' '}
                <span className='font-medium text-textPrimary'>{userData?.email}</span> has been successfully verified.
                You can now log in to your account.
              </Typography>

              <Button fullWidth variant='contained' type='button' href={getLocalizedUrl('/login', locale)}>
                Go to Login
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>If you have any issues,</Typography>
                <Typography color='primary.main' component={Link} href={getLocalizedUrl('/support', locale)}>
                  Contact Support
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='p-6 sm:!p-12'>
            <Typography variant='h5' color='error' gutterBottom>
              Token Mismatch or Invalid
            </Typography>
            <Typography>
              The verification token is invalid or expired. Please check your email or contact support for help.
            </Typography>
            <div className='mt-4'>
              <Button variant='contained' href={getLocalizedUrl('/support', locale)}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default VerifyEmail
