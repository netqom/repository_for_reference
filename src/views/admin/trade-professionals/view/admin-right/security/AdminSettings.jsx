'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import { updateAdminSetting, getAdminSettingDetail } from '@/app/server/actions';
import { callCommonAction } from '@/redux-store/slices/common';
import { useDispatch } from 'react-redux';
import { adminSettingId } from '@/configs/constant';

const AdminSettingsForm = () => {
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            commissionRate: '',
            vatOnOrder: '',
            vatOnCommission: '',
        }
    });

    useEffect(() => {
        getAdminSetting();
    }, []);

    const getAdminSetting = async () => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const response = await getAdminSettingDetail(adminSettingId);
            dispatch(callCommonAction({ loading: false }));
            if (response.statusCode === 200) {
                setValue('commissionRate', response?.data?.commissionRate || '');
                setValue('vatOnOrder', response?.data?.vatOnOrder || '');
                setValue('vatOnCommission', response?.data?.vatOnCommission || '');
            }
        } catch (error) {
            dispatch(callCommonAction({ loading: false }));
            toast.error('Failed to get admin settings. Please try again.');
        }
    };

    const onSubmit = async (data) => {
        try {
            dispatch(callCommonAction({ loading: true }));
            const response = await updateAdminSetting(adminSettingId, data);
            dispatch(callCommonAction({ loading: false }));
            if (response.success) {
                toast.success('Settings updated successfully');
            }
        } catch (error) {
            dispatch(callCommonAction({ loading: false }));
            toast.error('Unexpected error occurred. Please try again.');
        }
    };

    return (
        <Card>
            <CardHeader title='Platform Financial Settings' />
            <CardContent className='flex flex-col gap-4'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label='Commission Rate (%)'
                                type='number'
                                InputLabelProps={{ shrink: true }}
                                {...register('commissionRate', { required: 'Commission rate is required' })}
                                error={!!errors.commissionRate}
                                helperText={errors.commissionRate?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label='VAT on Order (%)'
                                type='number'
                                InputLabelProps={{ shrink: true }}
                                {...register('vatOnOrder', { required: 'VAT on order is required' })}
                                error={!!errors.vatOnOrder}
                                helperText={errors.vatOnOrder?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label='VAT on Commission (%)'
                                type='number'
                                InputLabelProps={{ shrink: true }}
                                {...register('vatOnCommission', { required: 'VAT on commission is required' })}
                                error={!!errors.vatOnCommission}
                                helperText={errors.vatOnCommission?.message}
                            />
                        </Grid>

                        <Grid xs={12}>
                            <Button
                                type='submit'
                                variant='contained'
                                disabled={isSubmitting}
                                startIcon={isSubmitting && <i className="ri-loader-line animate-spin" />}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
};

export default AdminSettingsForm;
