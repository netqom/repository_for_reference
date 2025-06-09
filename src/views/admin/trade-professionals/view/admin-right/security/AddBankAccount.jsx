'use client';

// React Imports
import { useState } from 'react';

// React Hook Form
import { useForm } from 'react-hook-form';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';

// Toast
import { toast } from 'react-toastify';

// Replace this with actual API call
import { addBankAccountForTradeProfessional } from '@/app/server/trade-professional';

const AddBankAccount = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            sortCode: '',
            accountNumber: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            const response = await addBankAccountForTradeProfessional(data);
            if (response.success) {
                setValue('sortCode', '');
                setValue('accountNumber', '');
                if (response.data?.object === "account_link") {
                    window.open(response.data.url, '_blank');
                } else {
                    toast.error("Failed to get Stripe onboarding link");
                }
            } else {
                toast.error(response.message || 'Failed to get Stripe onboarding link');
            }
        } catch (error) {
            console.error('Error adding bank account:', error);
            toast.error('Unexpected error occurred. Please try again.');
        }
    };

    return (
        <Card>
            <CardHeader title='Add Bank Account' />
            <CardContent className='flex flex-col gap-4'>
                <Alert severity="warning" onClose={() => { }}>
                    <AlertTitle>Ensure that these requirements are met</AlertTitle>
                    Must include both <strong>Routing number</strong> and <strong>Account number</strong>.
                </Alert>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label='Sort Code'
                                {...register('sortCode', { required: 'Sort code is required' })}
                                error={!!errors.sortCode}
                                helperText={errors.sortCode?.message}
                            />
                        </Grid>
                        {/* New Password Field */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label='Account Number'
                                {...register('accountNumber', { required: 'Account number is required' })}
                                error={!!errors.accountNumber}
                                helperText={errors.accountNumber?.message}
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
                                {isSubmitting ? 'Submitting...' : 'Add Bank Account'}
                            </Button>
                        </Grid>
                    </Grid>

                </form>
            </CardContent>
        </Card>
    );
};

export default AddBankAccount;
