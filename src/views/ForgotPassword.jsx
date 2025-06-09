'use client'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useState } from 'react';
import { Alert } from '@mui/material';
import { api } from "@/utils/api";
import { forgotPasswordApi } from '@/services/auth';
const ForgotPasswordV2 = ({ mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-forgot-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-forgot-password-light-border.png'

  // Hooks
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { settings } = useSettings()

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )
     // Local States
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState(null) // To show success or error messages

  // Handle Form Submit
  const handleSubmit = async event => {
    event.preventDefault()

    if (!email) {
      setResponseMessage({ type: 'error', message: 'Please enter your email.' })
      return
    }

    try {
      setIsLoading(true)
      setResponseMessage(null)

      // Sending request to forgot-password API
      const response = await forgotPasswordApi(email);

      // Check if status code is 200 (success)
      if (response?.statusCode == 200) {
        setResponseMessage({ type: 'success', message: response?.message || 'Password reset instructions sent successfully.' })
        setEmail('')
      } else {
        setResponseMessage({ type: 'error', message: 'Something went wrong. Please try again later.' })
      }
    } catch (error) {
      console.error('Password reset request failed:', error)

      const errorMessage = error?.response?.data?.message || 'Failed to send reset instructions.'
      setResponseMessage({ type: 'error', message: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='plb-12 pis-12'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div>
        <Illustrations
          image1={{ src: '/images/illustrations/objects/tree-2.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>
          </div>
            {/* Show Response Message if exists */}
            {responseMessage && (
            <Alert severity={responseMessage.type} variant='filled'>
              {responseMessage.message}
            </Alert>
          )}
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <TextField
              autoFocus
              fullWidth
              label='Email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary.main'>
              <Link href='/en/login' className='flex items-center'>
                <i className='ri-arrow-left-s-line' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordV2
