import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// React Hook Form
import { useForm } from 'react-hook-form'
import TicketFile from './TicketFile'
import { createSupportTicket, updateSupportTicketStatus } from '@/app/server/support-ticket'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

const AddSupportTicketDrawer = ({ open, handleClose, refreshList, editData, setEditData }) => {
  const [featuredImageFile, setFeaturedImageFile] = useState(null)

  const statusOptions = [
    { value: 1, label: 'Open' },
    //{ value: 2, label: 'Closed' },
    { value: 3, label: 'Pending' },
    { value: 4, label: 'In Progress' },
    { value: 5, label: 'Resolved' },
    { value: 6, label: 'Rejected' },
    //{ value: 7, label: 'Cancelled' }
  ]

  const {
    control,
    register,
    reset,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm()

  useEffect(() => {
    if (editData) {
      // Reset form values based on editData
      reset({
        subject: editData.subject || '',
        message: editData.message || '',
        status: editData.status || 1
      })
    } else {
      reset({
        subject: '',
        message: '',
        status: 1,
      })
       setFeaturedImageFile(null)
    }
  }, [editData, reset])

  useEffect(() => {
    register('status', { required: 'Status is required' })
  }, [register])

  const onSubmit = async formValues => {
    try {
      if (editData) {
        // If edit mode, only update the status
        const response = await updateSupportTicketStatus(editData.id, 'status', { status: formValues.status })

        if (response?.statusCode === 200 || response?.statusCode === 201) {
          refreshList()
          handleClose()
          setEditData(null)
          reset()
          return
        }

        const apiErrors = response?.data?.errors || response?.data || {}
        for (const [field, messages] of Object.entries(apiErrors)) {
          setError(field, {
            message: messages?.[0] || 'Invalid input'
          })
        }

        return
      }

      // If not editing, proceed with full ticket creation
      const formData = new FormData()
      formData.append('subject', formValues.subject)
      formData.append('message', formValues.message)
      formData.append('status', formValues.status)

      if (featuredImageFile) {
        formData.append('ticketFile', featuredImageFile)
      }

      const response = await createSupportTicket(formData)

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        refreshList()
        handleClose()
        reset()
        return
      }

      const apiErrors = response?.data?.errors || response?.data || {}
      for (const [field, messages] of Object.entries(apiErrors)) {
        setError(field, {
          message: messages?.[0] || 'Invalid input'
        })
      }
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={() => {
        setEditData(null)
        handleClose()
        reset()
      }}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5 pb-4'>
        <Typography variant='h5'>{editData ? 'Update Ticket' : 'Add Ticket'}</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <TextField
            fullWidth
            label='Subject'
            InputLabelProps={editData ? { shrink: true } : {}}
            placeholder='Enter Subject'
            {...register('subject', { required: 'Subject is required' })}
            disabled={!!editData}
            error={Boolean(errors.subject)}
            helperText={errors.subject?.message}
          />

          <TextField
            fullWidth
            label='Message'
            multiline
            rows={5}
            InputLabelProps={editData ? { shrink: true } : {}}
            placeholder='Enter message'
            {...register('message', { required: 'Message is required' })}
            disabled={!!editData}
            error={Boolean(errors.message)}
            helperText={errors.message?.message}
          />

          {/* Status */}
          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel id='status-label'>Status</InputLabel>
            <Select
              labelId='status-label'
              label='Status'
              defaultValue={1}
              value={watch('status') ?? 1}
              {...register('status', { required: 'Status is required' })}
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
          {!editData && <TicketFile onChangeImage={setFeaturedImageFile} />}

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button variant='outlined' color='error' type='button' onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddSupportTicketDrawer
