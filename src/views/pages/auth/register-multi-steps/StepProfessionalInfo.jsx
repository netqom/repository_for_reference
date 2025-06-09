'use client';
// React Imports
import { useFormContext } from 'react-hook-form';

// MUI Imports
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon';
import DropzoneImageUploader from '@/components/common/DropzoneImageUploader';

const StepProfessionalInfo = ({ activeStep, handlePrev }) => {
  // Get form context
  const {
    register,
    formState: { errors, isSubmitting }
  } = useFormContext();

  return (
    <>
      <div className='mbe-5'>
        <Typography variant='h4'>Professional Information</Typography>
        <Typography>Enter Your Professional Information</Typography>
      </div>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('business_name', { required: 'Business name is required' })}
            error={Boolean(errors?.business_name)}
            helperText={errors?.business_name?.message}
            fullWidth
            label='Business Name'
            placeholder='Your Business Name'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('business_email', {
              required: 'Business email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={Boolean(errors?.business_email)}
            helperText={errors?.business_email?.message}
            fullWidth
            type='email'
            label='Business Email'
            placeholder='business@company.com'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...register('business_phone', {
              required: 'Business phone is required',
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
            error={Boolean(errors?.business_phone)}
            helperText={errors?.business_phone?.message}
            fullWidth
            label='Business Phone'
            placeholder='+1 (555) 123-4567'
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DropzoneImageUploader
            fullWidth
            fieldName='business_documents'
            title='Business Documents'
            multiple={true}
            maxFiles={2}
            requiredMessage='Business Documents is required'
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DropzoneImageUploader
            fullWidth
            fieldName='registration_certificate'
            title='Registration Certificate'
            multiple={false}
            maxFiles={1}
            requiredMessage='Registration Certificate is required'
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DropzoneImageUploader
            fullWidth
            fieldName='trade_license'
            title='Trade License'
            multiple={false}
            maxFiles={1}
            requiredMessage='Trade License is required'
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DropzoneImageUploader
            fullWidth
            fieldName='proof_of_business'
            title='Proof Of Business'
            multiple={true}
            maxFiles={2}
            requiredMessage='Proof Of Business is required'
          />
        </Grid>

        <Grid size={{ xs: 12 }} className='flex justify-between'>
          <Button
            disabled={activeStep === 0}
            variant='outlined'
            color='secondary'
            onClick={handlePrev}
            startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
          >
            Previous
          </Button>
          <Button
            variant='contained'
            color='success'
            type='submit'
            disabled={isSubmitting}
            endIcon={<i className='ri-check-line' />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'} {/* Optional loading text */}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default StepProfessionalInfo;
