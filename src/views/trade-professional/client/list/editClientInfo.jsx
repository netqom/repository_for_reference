'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { toast } from 'react-toastify';
import {
  createTradeProfessionalClient,
  updateTradeProfessionalClient
} from '@/app/server/trade-professional';

// AddressSearch Component
const AddressSearch = ({ label = 'Search Address', placeholder = 'Enter your address...', setValue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(searchQuery);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = suggestion => {
    const address = suggestion.address || {};
    const displayName = suggestion.display_name;
    const addressLine1 =
      [address.house_number, address.road || address.street].filter(Boolean).join(' ') || displayName.split(', ')[0];
    const addressLine2 = address.suburb || address.neighbourhood || '';
    const city = address.city || address.town || address.village || address.municipality || '';
    const state = address.state || address.province || address.region || '';
    const postalCode = address.postcode || '';
    const country = address.country || '';
    const lat = suggestion.lat || '';
    const long = suggestion.lon || '';

    setValue('address.addressLine1', addressLine1);
    setValue('address.addressLine2', addressLine2);
    setValue('address.city', city);
    setValue('address.state', state);
    setValue('address.postalCode', postalCode);
    setValue('address.country', country);
    setValue('address.lat', lat);
    setValue('address.long', long);

    setSearchQuery(displayName);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
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
                <IconButton size='small' onClick={clearSearch}>
                  <i className='ri-close-line' />
                </IconButton>
              )}
              <IconButton size='small'>
                <i className='ri-map-pin-line' />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper className='absolute top-full left-0 right-0 z-10 max-h-60 overflow-auto mt-1'>
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} button onClick={() => handleSuggestionClick(suggestion)}>
                <ListItemText
                  primary={suggestion.display_name}
                  secondary={`${suggestion.type} • ${suggestion.importance?.toFixed(2) || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

// Main Modal Component
const EditClientInfo = ({ open, setOpen, data = null, setRefresh }) => {
  const isEditMode = data !== null ? true : false;

  const formatInitialData = data => ({
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    address: {
      name: data?.name || '',
      phone: data?.phone || '',
      addressLine1: data?.addressDetail?.addressLine1 || '',
      addressLine2: data?.addressDetail?.addressLine2 || '',
      street: data?.addressDetail?.street || '',
      city: data?.addressDetail?.city || '',
      state: data?.addressDetail?.state || '',
      postalCode: data?.addressDetail?.postalCode || '',
      country: data?.addressDetail?.country || '',
      type: data?.addressDetail?.type || '',
      isDefault: data?.addressDetail?.isDefault ?? true,
      label: data?.addressDetail?.label || '',
      lat: data?.addressDetail?.lat || '',
      long: data?.addressDetail?.long || '',
      location: {
        type: 'Point',
        coordinates: [data?.addressDetail?.lat || '', data?.addressDetail?.long || '']
      }
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({ defaultValues: formatInitialData(data) });

  useEffect(() => {
    if (data) reset(formatInitialData(data));
  }, [data]);

  const handleClose = () => {
    setOpen(false);
    reset(formatInitialData(data));
  };

  const onSubmit = async formValues => {
    const lat = formValues.address?.lat || '';
    const long = formValues.address?.long || '';

    const requestData = {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      address: {
        ...formValues.address,
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        type: "Shipping",
        lat,
        long,
        location: {
          type: 'Point',
          coordinates: [lat, long]
        }
      }
    };


    try {
      const response = isEditMode ? await updateTradeProfessionalClient(data?.id, requestData) : await createTradeProfessionalClient(requestData);

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message || 'Operation successful');
        setRefresh(true);
        handleClose();
        reset();
      } else {
        toast.error(response?.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle>{isEditMode ? 'Edit Client' : 'Add Client'}</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <IconButton onClick={handleClose} className='absolute top-4 right-4'>
            <i className='ri-close-line' />
          </IconButton>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Full Name' {...register('name', { required: 'Name is required' })}
                error={!!errors?.name}
                helperText={errors?.name?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Email' type='email'
                {...register('email', { required: 'Email is required' })}
                error={!!errors?.email}
                helperText={errors?.email?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label='Phone' {...register('phone', { required: 'Phone is required' })}
                error={!!errors?.phone}
                helperText={errors?.phone?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' className='mb-2'>
                Address Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AddressSearch setValue={setValue} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.addressLine1', { required: 'Address Line 1 is required' })}
                error={!!errors?.address?.addressLine1}
                helperText={errors?.address?.addressLine1?.message}
                fullWidth
                label='Address Line 1'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...register('address.addressLine2')} fullWidth label='Address Line 2' />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                {...register('address.city', { required: 'City is required' })}
                error={!!errors?.address?.city}
                helperText={errors?.address?.city?.message}
                fullWidth
                label='City'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                {...register('address.state', { required: 'State is required' })}
                error={!!errors?.address?.state}
                helperText={errors?.address?.state?.message}
                fullWidth
                label='State/Province'
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                {...register('address.postalCode', { required: 'Postal code is required' })}
                error={!!errors?.address?.postalCode}
                helperText={errors?.address?.postalCode?.message}
                fullWidth
                label='Postal Code'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.country', { required: 'Country is required' })}
                error={!!errors?.address?.country}
                helperText={errors?.address?.country?.message}
                fullWidth
                label='Country'
              />
            </Grid>

            {/* Hidden Fields */}
            <input type='hidden' {...register('address.lat')} />
            <input type='hidden' {...register('address.long')} />
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditClientInfo;
