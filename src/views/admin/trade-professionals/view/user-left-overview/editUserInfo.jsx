'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import Grid from '@mui/material/Grid2';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { update } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page';
import { toast } from 'react-toastify';
import { updateTradeProfessional } from '@/app/server/trade-professional';
import { CircularProgress, InputAdornment, List, ListItem, ListItemText, Paper } from '@mui/material';


const statusOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
  { label: 'Pending', value: 2 }
];

const AddressSearch = ({ label = 'Search Address', placeholder = 'Enter your address...', setValue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(searchQuery);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchAddress = async query => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching address:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = suggestion => {
    const address = suggestion.address || {};

    // Parse the display name to get address components
    const displayName = suggestion.display_name;
    const addressParts = displayName.split(', ');

    // Extract address components from the suggestion
    const addressLine1 =
      [address.house_number, address.road || address.street].filter(Boolean).join(' ') || addressParts[0] || '';

    const addressLine2 = address.suburb || address.neighbourhood || '';

    const city = address.city || address.town || address.village || address.municipality || '';

    const state = address.state || address.province || address.region || '';

    const postalCode = address.postcode || '';

    const country = address.country || '';

    const lat = suggestion.lat || '';
    const long = suggestion.lon || '';

    // Set all address fields
    setValue('address.addressLine1', addressLine1);
    setValue('address.addressLine2', addressLine2);
    setValue('address.city', city);
    setValue('address.state', state);
    setValue('address.postalCode', postalCode);
    setValue('address.country', country);
    setValue('address.lat', lat);
    setValue('address.long', long);

    // Update search query with selected address
    setSearchQuery(displayName);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    // Clear all address fields
    setValue('address.addressLine1', '');
    setValue('address.addressLine2', '');
    setValue('address.city', '');
    setValue('address.state', '');
    setValue('address.postalCode', '');
    setValue('address.country', '');
    setValue('address.lat', '');
    setValue('address.long', '');
  };

  return (
    <div className='relative' ref={suggestionsRef}>
      <TextField
        fullWidth
        label={label}
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              {loading && <CircularProgress size={20} />}
              {searchQuery && (
                <IconButton size='small' onClick={clearSearch} edge='end'>
                  <i className='ri-close-line' />
                </IconButton>
              )}
              <IconButton size='small' edge='end'>
                <i className='ri-map-pin-line' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper elevation={3} className='absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto mt-1'>
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleSuggestionClick(suggestion)}
                className='hover:bg-gray-50 cursor-pointer'
              >
                <ListItemText
                  primary={suggestion.display_name}
                  secondary={`${suggestion.type} • ${suggestion.importance?.toFixed(2) || 'N/A'}`}
                  primaryTypographyProps={{
                    className: 'text-sm'
                  }}
                  secondaryTypographyProps={{
                    className: 'text-xs text-gray-500'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {showSuggestions && suggestions.length === 0 && !loading && searchQuery.length > 2 && (
        <Paper elevation={3} className='absolute top-full left-0 right-0 z-10 mt-1'>
          <List dense>
            <ListItem>
              <ListItemText
                primary='No addresses found'
                secondary='Try a different search term'
                primaryTypographyProps={{
                  className: 'text-sm text-gray-500'
                }}
                secondaryTypographyProps={{
                  className: 'text-xs text-gray-400'
                }}
              />
            </ListItem>
          </List>
        </Paper>
      )}
    </div>
  );
};

const EditUserInfo = ({ open, setOpen, data, setRefresh, isAdmin }) => {
  const formatInitialData = data => ({
    fullName: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    role: data?.roles?.[0]?.name || '',
    status: data?.status ?? '',
    businessId: data?.business?._id || '',
    businessName: data?.business?.name || '',
    businessEmail: data?.business?.email || '',
    businessPhone: data?.business?.phone || '',
    businessStatus: data?.business?.status ?? '',
    businessCreatedAt: data?.business?.createdAt || '',
    businessUpdatedAt: data?.business?.updatedAt || '',

    address: {
      addressLine1: data?.addresses?.addressLine1 || '',
      addressLine2: data?.addresses?.addressLine2 || '',
      city: data?.addresses?.city || '',
      state: data?.addresses?.state || '',
      postalCode: data?.addresses?.postalCode || '',
      country: data?.addresses?.country || '',
      lat: data?.addresses?.lat || '',
      long: data?.addresses?.long || '',
      type: data?.addresses?.type || ''
    }
  });



  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: formatInitialData(data)
  });

  useEffect(() => {
    if (data) {
      reset(formatInitialData(data));
    }
  }, [data, reset]);

  const handleClose = () => {
    setOpen(false);
    // setRefresh(false);
    reset(formatInitialData(data));
  };

  const onSubmit = async formValues => {
    try {
      const requestData = {
        name: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        address: {
          addressLine1: formValues.address?.addressLine1 || '',
          addressLine2: formValues.address?.addressLine2 || '',
          city: formValues.address?.city || '',
          state: formValues.address?.state || '',
          postalCode: formValues.address?.postalCode || '',
          country: formValues.address?.country || '',
          lat: formValues.address?.lat || '',
          long: formValues.address?.long || ''
        },
        business_name: formValues.businessName,
        business_email: formValues.businessEmail,
        business_phone: formValues.businessPhone,
        status: formValues.status,
        business_status: formValues.businessStatus,
        accept_term: 1
      };

      const response = await updateTradeProfessional(data._id, requestData);

      const isSuccess = response?.statusCode === 200 || response?.statusCode === 201;

      if (isSuccess) {
        toast.success(response?.message || 'Operation successful');
        setRefresh(true);
        handleClose();
        reset();
        return;
      }

      const fieldErrors = response?.data?.errors;
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([fieldName, messages]) => {
          setError(fieldName, { message: messages?.[0] || 'Invalid value' });
        });
      } else {
        toast.error(response?.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('User update failed:', error);
      toast.error('Unexpected error occurred. Please try again.');
    }
  };

  //// console.log('formatInitialDataformatInitialData', data);

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle variant='h4' className='flex gap-0 flex-col items-center sm:pbs-16 sm:pbe-6 sm:pli-16 mb-3'>
        <div className='max-sm:is-[80%] max-sm:text-center'>Edit Trade Professional</div>
        <Typography component='span' className='flex flex-col text-center'>
          Updating this user will trigger a privacy audit.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>

          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Full Name' {...register('fullName')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Email' type='email' {...register('email')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Phone' {...register('phone')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Role' disabled {...register('role')} />
            </Grid>
            {isAdmin && (
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label='Status'
                    {...register('status')}
                    value={watch('status')}
                    onChange={e => setValue('status', e.target.value)}
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Address Search Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' className='mb-3'>
                Address Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AddressSearch label='Search Address' placeholder='Start typing your address...' setValue={setValue} />
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

            {/* Business Info Fields */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant='h5'
                className='mb-2'
                sx={{ borderBottom: '1px solid #ebebeb', paddingBottom: '8px' }}
              >
                Business Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Business Name' {...register('businessName')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Business Email' {...register('businessEmail')} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Business Phone' {...register('businessPhone')} />
            </Grid>

            {isAdmin && (
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Business Status</InputLabel>
                  <Select
                    label='Business Status'
                    {...register('businessStatus')}
                    value={watch('businessStatus')}
                    onChange={e => setValue('businessStatus', e.target.value)}
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Read-only business metadata */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Business Created At'
                value={new Date(watch('businessCreatedAt')).toLocaleString()}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Business Updated At'
                value={new Date(watch('businessUpdatedAt')).toLocaleString()}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className='flex justify-end items-center gap-4 sm:pli-16 sm:pbe-6'>
          <Button variant='outlined' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserInfo;
