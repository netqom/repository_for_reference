'use client';

// React imports
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Toast
import { toast } from 'react-toastify';

// API calls
import {
    addBankAccountForTradeProfessional,
    getStripeAccountStatus,
    reVerifyStripeAccount
} from '@/app/server/trade-professional';

const AddBankAccount = () => {
    const [accountStatus, setAccountStatus] = useState(null);
    const {
        handleSubmit,
        formState: { isSubmitting }
    } = useForm();

    useEffect(() => {
        fetchAccountStatus();
    }, []);

    const fetchAccountStatus = async () => {
        try {
            const response = await getStripeAccountStatus();
            console.log('Account Status:', response); // Log the response for debugging purpose
            if (response?.data?.success) {
                setAccountStatus(response?.data?.data);
            }
        } catch (error) {
            console.error('Error fetching account status:', error);
            toast.error('Unexpected error occurred while fetching account status');
        }
    };

    const onSubmit = async () => {
        try {
            const response = await addBankAccountForTradeProfessional();
            console.log('Response:', response); // Log the response for debugging purpose
            if (response.success && response.data?.object === "account_link") {
                window.open(response.data.url, '_blank');
                // Refresh status after a short delay to allow for completion
                setTimeout(fetchAccountStatus, 5000);
            } else {
                toast.error("Failed to get Stripe onboarding link");
            }
        } catch (error) {
            console.error('Error adding bank account:', error);
            toast.error('Unexpected error occurred. Please try again.');
        }
    };

    const handleReVerify = async () => {
        try {
            const response = await reVerifyStripeAccount();
            if (response.success && response.data?.object === "account_link") {
                window.open(response.data.url, '_blank');
                setTimeout(fetchAccountStatus, 5000);
            } else {
                toast.error("Failed to get re-verification link");
            }
        } catch (error) {
            console.error('Error initiating re-verification:', error);
            toast.error('Unexpected error occurred during re-verification');
        }
    };

    return (
        <Card>
            <CardHeader title='Stripe Connect Account' />
            <CardContent className='flex flex-col gap-4'>
                {!accountStatus ? (
                    <>
                        <Alert severity="info">
                            <AlertTitle>Connect Your Bank Account</AlertTitle>
                            You'll be redirected to Stripe's secure onboarding process to connect your bank account.
                        </Alert>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={4}>
                                <Grid xs={12} className='flex gap-4'>
                                    <Button
                                        type='submit'
                                        variant='contained'
                                        disabled={isSubmitting}
                                        startIcon={isSubmitting && <i className="ri-loader-line animate-spin" />}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Connect Bank Account'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </>
                ) : (
                    <>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Details</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            {(accountStatus?.stripe_account_id)}
                                        </TableCell>
                                        <TableCell>
                                            {accountStatus.details_submitted ? 'Details submitted' : 'Pending details'}
                                            <br />
                                            {accountStatus.charges_enabled ? 'Charges enabled' : 'Charges disabled'}
                                            <br />
                                            {accountStatus.payouts_enabled ? 'Payouts enabled' : 'Payouts disabled'}
                                        </TableCell>
                                        <TableCell>
                                            {!accountStatus.details_submitted && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleReVerify}
                                                >
                                                    Complete Verification
                                                </Button>
                                            )}
                                            {accountStatus.details_submitted && !accountStatus.charges_enabled && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleReVerify}
                                                >
                                                    Verify Account
                                                </Button>
                                            )}
                                            {accountStatus.details_submitted && accountStatus.charges_enabled && (
                                                <span style={{ color: 'green', fontWeight: 'bold' }}>Account Verified ✅</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default AddBankAccount;
