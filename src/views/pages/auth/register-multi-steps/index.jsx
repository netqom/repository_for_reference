'use client'

// React Imports
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepAccountDetails from './StepAccountDetails'
import StepProfessionalInfo from './StepProfessionalInfo'
import StepperCustomDot from '@components/stepper-dot'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { createTradeProfessional } from '@/app/server/trade-professional'
import { toast } from 'react-toastify'

// Step Labels
const steps = [
  {
    title: 'Account',
    subtitle: 'Account Details'
  },
  {
    title: 'Professional',
    subtitle: 'Enter Information'
  }
]

// Main Component
const RegisterMultiSteps = () => {
  const [activeStep, setActiveStep] = useState(0)
  const router = useRouter()

  const methods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      confirmPassword: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        lat: '',
        long: ''
      },
      business_name: '',
      business_email: '',
      business_phone: '',
      business_documents: null,
      registration_certificate: null,
      trade_license: null,
      proof_of_business: null
    }
  })

  const {
    handleSubmit,
    trigger,
    setError,
    formState: { errors }
  } = methods

  const { settings } = useSettings()
  const theme = useTheme()
  const { lang: locale } = useParams()

  const handleNext = async () => {
    const valid = await trigger()
    if (valid) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (activeStep !== 0) setActiveStep(prev => prev - 1)
  }

  const fieldStepMap = {
    name: 0,
    email: 0,
    password: 0,
    confirmPassword: 0,
    phone: 0,
    'address.addressLine1': 0,
    'address.addressLine2': 0,
    'address.city': 0,
    'address.state': 0,
    'address.postalCode': 0,
    'address.country': 0,
    business_name: 1,
    business_email: 1,
    business_phone: 1,
    business_documents: 1,
    registration_certificate: 1,
    trade_license: 1,
    proof_of_business: 1
  }

  const onSubmit = async data => {
    try {
      const formData = new FormData()

      // Append basic fields
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      if (data.phone) formData.append('phone', data.phone)
      if (data.business_name) formData.append('business_name', data.business_name)
      if (data.business_email) formData.append('business_email', data.business_email)
      if (data.business_phone) formData.append('business_phone', data.business_phone)

      // Append address fields
      if (data.address && typeof data.address === 'object') {
        Object.entries(data.address).forEach(([key, value]) => {
          if (value) {
            formData.append(`address[${key}]`, value)
          }
        })
      }

      // Append document arrays
      if (Array.isArray(data.business_documents)) {
        data.business_documents.forEach(file => {
          if (file instanceof File) {
            formData.append('business_documents', file)
          }
        })
      }

      if (Array.isArray(data.proof_of_business)) {
        data.proof_of_business.forEach(file => {
          if (file instanceof File) {
            formData.append('proof_of_business', file)
          }
        })
      }

      // Append single documents
      if (data.registration_certificate instanceof File) {
        formData.append('registration_certificate', data.registration_certificate)
      }

      if (data.trade_license instanceof File) {
        formData.append('trade_license', data.trade_license)
      }

      const response = await createTradeProfessional(formData)
      // console.log(response, 'responseresponse')

      if (response.success) {
        toast.success('Registration successful!')
        router.push(`/${locale}/login`)
      } else {
        const apiErrors = response?.data?.errors || response?.data || {}
        for (const [field, messages] of Object.entries(apiErrors)) {
          setError(field, {
            message: messages?.[0] || 'Invalid input'
          })
        }

        const errorFields = Object.keys(apiErrors)
        for (const field of errorFields) {
          const step = fieldStepMap[field]
          if (step !== undefined) {
            setActiveStep(step)
            break
          }
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error)
      toast.error('Something went wrong.')

      // if (error.response) {
      //   console.error('Server error response:', error.response.data)
      //   toast.error('Submission failed: ' + (error.response.data?.message || 'Server error'))
      // } else if (error.request) {
      //   console.error('No response received:', error.request)
      //   toast.error('No response from server.')
      // } else {
      //   console.error('Unexpected error:', error.message)
      //   toast.error('Something went wrong: ' + error.message)
      // }
    }
  }

  const stepProps = {
    activeStep,
    handleNext,
    handlePrev
  }

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <StepAccountDetails {...stepProps} />
      case 1:
        return <StepProfessionalInfo {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className='flex bs-full justify-between items-center'>
      <div
        className={classnames('flex bs-full items-center justify-center is-[594px] max-md:hidden', {
          'border-ie': settings.skin === 'bordered'
        })}
      >
        <img
          src='/images/illustrations/characters/4.png'
          alt='multi-steps-character'
          className={classnames('mis-[92px] bs-auto max-bs-[628px] max-is-full', {
            'scale-x-[-1]': theme.direction === 'rtl'
          })}
        />
      </div>
      <div className='flex justify-center items-center bs-full is-full bg-backgroundPaper'>
        <Link
          href={getLocalizedUrl('/', locale)}
          className='absolute block-start-5 sm:block-start-[25px] inline-start-6 sm:inline-start-[25px]'
        >
          <Logo />
        </Link>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <StepperWrapper className='p-5 sm:p-8 is-[700px]'>
              <Stepper className='mbe-12 mbs-16 sm:mbs-0' activeStep={activeStep}>
                {steps.map((step, index) => (
                  <Step key={index} onClick={() => setActiveStep(index)}>
                    <StepLabel slots={{ stepIcon: StepperCustomDot }}>
                      <div className='step-label cursor-pointer'>
                        <Typography className='step-number' color='text.primary'>{`0${index + 1}`}</Typography>
                        <div>
                          <Typography className='step-title' color='text.primary'>
                            {step.title}
                          </Typography>
                          <Typography className='step-subtitle' color='text.primary'>
                            {step.subtitle}
                          </Typography>
                        </div>
                      </div>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              {getStepContent()}
            </StepperWrapper>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default RegisterMultiSteps
