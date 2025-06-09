'use client'

// React Imports
import React, { useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// React Hook Form Imports
import { useFormContext, Controller } from 'react-hook-form'

// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5),
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight,
    },
  },
}))

const ProductImage = () => {
  // Get RHF form context
  const { control, setValue, watch } = useFormContext()

  // Watch current files value from form state
  const files = watch('productImages') || []

  // Dropzone setup using react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop: acceptedFiles => {
      // Append new files to existing ones in form state
      const newFiles = [...files, ...acceptedFiles.map(file => Object.assign(file))]
      setValue('productImages', newFiles, { shouldValidate: true, shouldDirty: true })
    },
  })

  // Remove individual file from form state
  const handleRemoveFile = (fileToRemove) => {
    const filteredFiles = files.filter(file => file.name !== fileToRemove.name)
    setValue('productImages', filteredFiles, { shouldValidate: true, shouldDirty: true })
  }

  // Remove all files from form state
  const handleRemoveAllFiles = () => {
    setValue('productImages', [], { shouldValidate: true, shouldDirty: true })
  }

  // Render preview for each file
  const renderFilePreview = (file) => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    } else {
      return <i className='ri-file-text-line' />
    }
  }

  return (
    <Dropzone>
      <Card>
        <CardHeader
          title="Product Image"
          action={
            <Typography component={Link} color="primary.main" className="font-medium">
              Add media from URL
            </Typography>
          }
          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
        />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className="flex items-center flex-col gap-2 text-center">
              <CustomAvatar variant="rounded" skin="light" color="secondary">
                <i className="ri-upload-2-line" />
              </CustomAvatar>
              <Typography variant="h4">Drag and Drop Your Image Here.</Typography>
              <Typography color="text.disabled">or</Typography>
              <Button variant="outlined" size="small">
                Browse Image
              </Button>
            </div>
          </div>

          {/* Show list of uploaded files if any */}
          {files.length > 0 && (
            <>
              <List>
                {files.map((file) => (
                  <ListItem key={file.name} className="pis-4 plb-3" secondaryAction={
                    <IconButton onClick={() => handleRemoveFile(file)}>
                      <i className="ri-close-line text-xl" />
                    </IconButton>
                  }>
                    <div className="file-details" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="file-preview">{renderFilePreview(file)}</div>
                      <div>
                        <Typography className="file-name font-medium" color="text.primary">
                          {file.name}
                        </Typography>
                        <Typography className="file-size" variant="body2">
                          {file.size > 1000000
                            ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                            : `${(file.size / 1024).toFixed(1)} KB`}
                        </Typography>
                      </div>
                    </div>
                  </ListItem>
                ))}
              </List>

              <div className="buttons" style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <Button color="error" variant="outlined" onClick={handleRemoveAllFiles}>
                  Remove All
                </Button>
                {/* You can implement upload logic here */}
                <Button variant="contained">Upload Files</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ProductImage
