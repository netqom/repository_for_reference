'use client';
// React Imports
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

// MUI Imports
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon';
import AddressSearch from './AddressSearch';

const StepAccountDetails = ({ activeStep, handleNext, handlePrev }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);

  // Get form context
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext();

  const handleClickShowPassword = () => {
    setIsPasswordShown(!isPasswordShown);
  };

  const handleClickShowConfirmPassword = () => {
    setIsConfirmPasswordShown(!isConfirmPasswordShown);
  };

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Account Information</Typography>
        <Typography>Enter Your Account Details</Typography>
      </div>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('name', { required: 'Name is required' })}
            error={Boolean(errors?.name)}
            helperText={errors.name?.message}
            fullWidth
            label='Name'
            placeholder='John Doe'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={Boolean(errors?.email)}
            helperText={errors.email?.message}
            fullWidth
            type='email'
            label='Email'
            placeholder='johndoe@gmail.com'
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('phone', {
              required: 'Phone is required',
              pattern: {
                value: /^\+?[0-9\s\-().]{7,20}$/,
                message: 'Enter a valid phone number (no letters)',
              },
            })}
            inputProps={{
              inputMode: 'tel',
              pattern: '\\+?[0-9\\s\\-().]{7,20}',
              onKeyDown: (e) => {
                const allowedKeys = [
                  'Backspace',
                  'Tab',
                  'ArrowLeft',
                  'ArrowRight',
                  'Delete',
                  'Home',
                  'End',
                  '+',
                  '-',
                  '(',
                  ')',
                  ' ',
                ];
                const isNumber = /[0-9]/.test(e.key);
                if (!isNumber && !allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              },
            }}
            error={Boolean(errors?.phone)}
            helperText={errors.phone?.message}
            fullWidth
            label='Phone'
          />


        </Grid>



        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={Boolean(errors?.password)}
            helperText={errors.password?.message}
            fullWidth
            label='Password'
            placeholder='············'
            id='outlined-adornment-password'
            type={isPasswordShown ? 'text' : 'password'}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle password visibility'
                    >
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('confirmPassword', {
              required: 'Confirm Password is required',
              validate: value => {
                const password = watch('password');
                return value === password || 'Passwords do not match';
              }
            })}
            error={Boolean(errors?.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            fullWidth
            label='Confirm Password'
            placeholder='············'
            id='outlined-confirm-password'
            type={isConfirmPasswordShown ? 'text' : 'password'}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle confirm password visibility'
                    >
                      <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>

        {/* Address Search Section */}
        <Grid size={{ xs: 12 }}>
          <Typography variant='h6' className='mb-3'>
            Address Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AddressSearch label='Search Address' placeholder='Start typing your address...' />
        </Grid>

        {/* Address Fields - Auto-filled by AddressSearch */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('address.addressLine1', { required: 'Address Line 1 is required' })}
            error={Boolean(errors?.address?.addressLine1)}
            helperText={errors?.address?.addressLine1?.message}
            fullWidth
            label='Address Line 1'
            placeholder='Street address'
            InputLabelProps={{
              shrink: Boolean(watch('address.addressLine1')) // Float label only if there's a value
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('address.addressLine2')}
            error={Boolean(errors?.address?.addressLine2)}
            helperText={errors?.address?.addressLine2?.message}
            fullWidth
            label='Address Line 2'
            placeholder='Apartment, suite, etc. (optional)'
            InputLabelProps={{
              shrink: Boolean(watch('address.addressLine2')) // Float label only if there's a value
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            {...register('address.city', { required: 'City is required' })}
            error={Boolean(errors?.address?.city)}
            helperText={errors?.address?.city?.message}
            fullWidth
            label='City'
            placeholder='City'
            InputLabelProps={{
              shrink: Boolean(watch('address.city')) // Float label only if there's a value
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            {...register('address.state', { required: 'State is required' })}
            error={Boolean(errors?.address?.state)}
            helperText={errors?.address?.state?.message}
            fullWidth
            label='State/Province'
            placeholder='State or Province'
            InputLabelProps={{
              shrink: Boolean(watch('address.state')) // Float label only if there's a value
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            {...register('address.postalCode', { required: 'Postal code is required' })}
            error={Boolean(errors?.address?.postalCode)}
            helperText={errors?.address?.postalCode?.message}
            fullWidth
            label='Postal Code'
            placeholder='Postal/ZIP code'
            InputLabelProps={{
              shrink: Boolean(watch('address.postalCode')) // Float label only if there's a value
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('address.country', { required: 'Country is required' })}
            error={Boolean(errors?.address?.country)}
            helperText={errors?.address?.country?.message}
            fullWidth
            label='Country'
            placeholder='Country'
            InputLabelProps={{
              shrink: Boolean(watch('address.country')) // Float label only if there's a value
            }}
          />
        </Grid>

        {/* Hidden fields for coordinates */}
        <input type='hidden' {...register('address.lat')} />
        <input type='hidden' {...register('address.long')} />

        <Grid size={{ xs: 12 }} className='flex justify-between'>
          <Button
            disabled={activeStep === 0}
            color='secondary'
            variant='outlined'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <Button
            variant='contained'
            onClick={handleNext}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default StepAccountDetails;
