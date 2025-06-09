'use client'

// React Imports
import React from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// React Hook Form Imports
import { useFormContext } from 'react-hook-form'

// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'

// Styled Dropzone Wrapper
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

const ProductFeaturedImage = () => {
  // React Hook Form context
  const { setValue, watch } = useFormContext()

  // Watch featured image file
  const featuredImage = watch('productFeaturedImage') || null

  // Handle drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setValue('productFeaturedImage', file, { shouldValidate: true, shouldDirty: true })
      }
    }
  })

  const handleRemoveFile = () => {
    setValue('productFeaturedImage', null, { shouldValidate: true, shouldDirty: true })
  }

  const renderFilePreview = file => {
    if (file?.type?.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    } else {
      return <i className='ri-file-text-line' />
    }
  }

  return (
    <Dropzone>
      <Card>
        <CardHeader
          title="Featured Image"
          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
        />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className="flex items-center flex-col gap-2 text-center">
              <CustomAvatar variant="rounded" skin="light" color="secondary">
                <i className="ri-upload-2-line" />
              </CustomAvatar>
              <Typography variant="h4">Drag and Drop a Featured Image</Typography>
              <Typography color="text.disabled">or</Typography>
              <Button variant="outlined" size="small">
                Browse Image
              </Button>
            </div>
          </div>

          {featuredImage && (
            <>
              <List>
                <ListItem
                  key={featuredImage.name}
                  className="pis-4 plb-3"
                  secondaryAction={
                    <IconButton onClick={handleRemoveFile}>
                      <i className="ri-close-line text-xl" />
                    </IconButton>
                  }
                >
                  <div className="file-details" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="file-preview">{renderFilePreview(featuredImage)}</div>
                    <div>
                      <Typography className="file-name font-medium" color="text.primary">
                        {featuredImage.name}
                      </Typography>
                      <Typography className="file-size" variant="body2">
                        {featuredImage.size > 1000000
                          ? `${(featuredImage.size / 1024 / 1024).toFixed(1)} MB`
                          : `${(featuredImage.size / 1024).toFixed(1)} KB`}
                      </Typography>
                    </div>
                  </div>
                </ListItem>
              </List>

              <div className="buttons" style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <Button color="error" variant="outlined" onClick={handleRemoveFile}>
                  Remove
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ProductFeaturedImage
