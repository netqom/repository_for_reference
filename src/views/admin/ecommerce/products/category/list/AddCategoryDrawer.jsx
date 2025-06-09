import { useEffect, useState } from 'react';

// MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// React Hook Form
import { useForm, Controller  } from 'react-hook-form';

// Services
import { categoryService } from '@/services/category';
import { createCategory, getAllCategory, updateCategory } from '@/app/[lang]/(dashboard)/(private)/admin/ecommerce/products/category/list/page';

const AddCategoryDrawer = ({ open, handleClose, editData }) => {
  const [parentOptions, setParentOptions] = useState([]);

  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      parent: '',
      status: '1'
    }
  });

  // Manually register fields not using ref
  useEffect(() => {
    register('parent');
    register('status', { required: 'Status is required' });
  }, [register]);

  // Set form values for editing
  useEffect(() => {
    if (editData) {
      setValue('id', editData.id || '');
      setValue('name', editData.name || '');
      setValue('parent', editData?.parent?.id || '');
      setValue('status', editData.status?.toString() || '1');
    }
  }, [editData, setValue]);

  // Load parent category options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategory();
        if (res.statusCode === 200) {
          setParentOptions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch parent categories:', error);
      }
    };

    fetchCategories();
  }, [open]);

  const onSubmit = async (formValues) => {
    try {
      const transformedValues = {
        ...formValues,
        parent: formValues.parent || null
      };

      const response = editData
        ? await updateCategory(editData.id, transformedValues)
        : await createCategory(transformedValues);

      const statusCode = response?.statusCode;
      const isSuccess = statusCode === 200 || statusCode === 201;

      if (isSuccess) {
        handleClose();
        reset();
        return;
      }
       if(statusCode === 422 ){
        const errors = response?.data || {};
      for (const [field, messages] of Object.entries(errors)) {
        setError(field, {
          message: messages?.[0] || 'Invalid input',
        });
      }
       }

      // Handle field-level validation errors returned from API
      const serverErrors = response?.data?.errors || {};
      for (const [field, messages] of Object.entries(serverErrors)) {
        setError(field, {
          message: messages?.[0] || 'Invalid input',
        });
      }

    } catch (error) {
      // Optionally handle logging or show toast notification here
      console.error('Submission failed:', error);
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
          {editData ? 'Edit Category' : 'Add New Category'}
        </Typography>
        <IconButton size="small" onClick={handleDrawerClose}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />

      <div className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormControl fullWidth error={Boolean(errors.name)}>
          <TextField
            fullWidth
            label="Category Name"
            placeholder="Enter category name"
            value={watch('name') ?? ''}
            {...register('name', { required: 'Category name is required' })}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
        </FormControl>


          {/* Parent Category Select */}
          <FormControl fullWidth error={Boolean(errors.parent)}>
            <InputLabel>Parent Category</InputLabel>
            <Controller
              name="parent"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Parent Category">
                  <MenuItem value={''}>None</MenuItem>
                  {(editData?.id
                    ? parentOptions.filter(option => option._id !== editData.id)
                    : parentOptions
                  ).map(option => (
                    <MenuItem key={option._id} value={option._id}   disabled={option.status === 0}  >
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.parent && <FormHelperText>{errors.parent.message}</FormHelperText>}
          </FormControl>

          {/* Status Select */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={watch('status') || '1'}
              onChange={(e) => setValue('status', e.target.value)}
            >
              <MenuItem value="1">Active</MenuItem>
              <MenuItem value="0">Inactive</MenuItem>
            </Select>
            {errors.status && (
              <FormHelperText>{errors.status.message}</FormHelperText>
            )}
          </FormControl>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              type="button"
              onClick={handleDrawerClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddCategoryDrawer;
