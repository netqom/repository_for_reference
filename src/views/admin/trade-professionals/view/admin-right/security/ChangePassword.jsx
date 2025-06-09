'use client'

// React Imports
import { useState } from 'react'

// React Hook Form
import { useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import { changeTradeProfessionalPassword } from '@/app/server/trade-professional'
import { toast } from 'react-toastify'

const ChangePassword = ({userId}) => {
  // States to handle visibility of each password field
  const [isOldPasswordShown, setIsOldPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  // Initialize useForm
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm()

  // Submit handler
  const onSubmit = async (data) => {
    try {
      const response = await changeTradeProfessionalPassword(userId, data);
      if (response.success) {
        toast.success('Password Changed Successfully');
        setValue('currentPassword', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false })
        setValue('newPassword', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false })
        setValue('confirmPassword', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false })
      }
      else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("error return:", error);
      toast.error('Password Changed Successfully');
    }
  }

  return (
    <Card>
      <CardHeader title='Change Password' />
      <CardContent className='flex flex-col gap-4'>
        <Alert icon={false} severity='warning' onClose={() => { }}>
          <AlertTitle>Ensure that these requirements are met</AlertTitle>
          Minimum 8 characters long, uppercase & symbol
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Old Password Field */}
            <Grid size={{ xs: 12}}>
              <TextField
                fullWidth
                label='Old Password'
                type={isOldPasswordShown ? 'text' : 'password'}
                {...register('currentPassword', { required: 'Old password is required' })}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsOldPasswordShown(!isOldPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isOldPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* New Password Field */}
            <Grid size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label='Password'
                type={isNewPasswordShown ? 'text' : 'password'}
                {...register('newPassword', {
                  required: 'Password is required',
                  validate: value => {
                    if (value.length < 8) return 'Password must be at least 8 characters'
                    if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter'
                    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must include at least one symbol'
                    return true
                  }
                })}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

            </Grid>

            {/* Confirm Password Field */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Confirm Password'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: value =>
                    value === watch('newPassword') || 'Passwords do not match'
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isConfirmPasswordShown ? 'ri-eye-off-line text-xl' : 'ri-eye-line text-xl'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

            </Grid>

            {/* Submit Button */}
            <Grid xs={12} className='flex gap-4'>
              <Button
                type='submit'
                variant='contained'
                disabled={isSubmitting}
                startIcon={isSubmitting && <i className="ri-loader-line animate-spin" />}
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePassword
