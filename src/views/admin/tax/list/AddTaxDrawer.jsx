import { useEffect } from 'react';

// MUI Imports
import {
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormHelperText,
  Typography,
  Divider,
} from '@mui/material';

// Third-party
import { useForm } from 'react-hook-form';

import { createTax, updateTax } from '@/app/[lang]/(dashboard)/(private)/admin/tax/list/page';

const customerTypes = ['Retail', 'Trade'];
const statusOptions = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
];

const AddTaxDrawer = ({ open, handleClose, editData }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      id: editData?.id || '',
      customerType: editData?.customerType || '',
      taxPercentage: Number(editData?.taxPercentage) || '',
      status: String(editData?.status) || '1',
    },
  });


  useEffect(() => {
    reset({
      id: editData?.id || '',
      customerType: editData?.customerType || '',
      taxPercentage: editData?.taxPercentage ? Number(editData?.taxPercentage) : '',
      status: editData ? String(editData?.status) : '1',
    });

  }, [editData, reset]);

  const onSubmit = async formValues => {
    try {
      const payload = {
        ...formValues,
        taxPercentage: parseFloat(formValues.taxPercentage),
      };

      const response = editData
        ? await updateTax(editData.id, payload)
        : await createTax(payload);

      if ([200, 201].includes(response?.statusCode)) {
        handleClose();
        reset();
      } else if (response?.data?.errors) {
        Object.entries(response.data.errors).forEach(([field, messages]) => {
          setError(field, { message: messages[0] || 'Invalid value' });
        });
      } else {
        setError('apiError', { message: response?.message || 'Something went wrong' });
      }
    } catch (err) {
      console.error('Tax save failed:', err);
      setError('apiError', { message: err.message || 'Something went wrong' });
    }
  };

  const handleDrawerClose = () => {
    handleClose();
    reset();
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={handleDrawerClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between p-5 pb-4">
        <Typography variant="h5">
          {editData ? 'Edit Tax' : 'Add New Tax'}
        </Typography>
        <IconButton size="small" onClick={handleDrawerClose}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />

      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Customer Type */}
          <FormControl fullWidth error={Boolean(errors.customerType)}>
            <InputLabel id="customerType-label">Customer Type</InputLabel>
            <Select
              labelId="customerType-label"
              label="Customer Type"
              disabled
              value={watch('customerType') ?? ''}
              onChange={(e) => setValue('customerType', e.target.value)}
              error={Boolean(errors.customerType)}
            >
              <MenuItem value="">None</MenuItem>
              {customerTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {errors.customerType && (
              <FormHelperText>{errors.customerType.message}</FormHelperText>
            )}
          </FormControl>

          {/* Tax Percentage */}
          <TextField
            {...register('taxPercentage', {
              required: 'Tax percentage is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Minimum value is 0',
              },
              max: {
                value: 100,
                message: 'Maximum value is 100',
              },
              pattern: {
                value: /^\d{1,3}(\.\d{1,2})?$/,
                message: 'Enter a valid percentage (e.g. 12 or 12.5)',
              },
            })}
            fullWidth
            type="number"
            label="Tax Percentage"
            placeholder="Enter tax percentage"
            error={Boolean(errors.taxPercentage)}
            helperText={errors.taxPercentage?.message}
            InputLabelProps={{ shrink: true }}
          />


          {/* Status */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              defaultValue='1'

              value={String(watch('status')) ?? '1'}
              {...register('status', { required: 'Status is required' })}
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <FormHelperText>{errors.status.message}</FormHelperText>
            )}
          </FormControl>

          {/* API Error */}
          {errors.apiError && (
            <Typography color="error" variant="body2">
              {errors.apiError.message}
            </Typography>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" color="error" onClick={handleDrawerClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddTaxDrawer;
