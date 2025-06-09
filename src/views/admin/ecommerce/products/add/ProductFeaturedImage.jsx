'use client'

import React from 'react'
import {
  Card, CardHeader, CardContent, Button, IconButton,
  Typography, List, ListItem
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDropzone } from 'react-dropzone'
import { useFormContext, Controller } from 'react-hook-form'
import CustomAvatar from '@core/components/mui/Avatar'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import Image from 'next/image'

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
  const { control } = useFormContext()

  const renderFilePreview = file => {
    const isLocalFile = file instanceof File
    const imageUrl = isLocalFile
      ? URL.createObjectURL(file)
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${file.filePath}`

    return (
      <div style={{ position: 'relative', width: 38, height: 38 }}>
        <Image
          src={imageUrl}
          alt={file.name || 'Featured image'}
          fill
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      </div>
    )
  }

  return (
    <Dropzone>
      <Card>
        <CardHeader
          title="Featured Image"
          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
        />
        <CardContent>
          <Controller
            name="productFeaturedImage"
            control={control}
            rules={{ required: 'Featured image is required' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const onDrop = acceptedFiles => {
                if (acceptedFiles.length > 0) {
                  onChange(acceptedFiles[0])
                }
              }

              const { getRootProps, getInputProps } = useDropzone({
                accept: { 'image/*': [] },
                multiple: false,
                onDrop
              })

              const handleRemoveFile = () => {
                onChange(null)
              }

              return (
                <>
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

                  {error && (
                    <Typography variant="body2" color="red" sx={{ mt: 2 }}>
                      {error.message}
                    </Typography>
                  )}

                  {value && (
                    <>
                      <List>
                        <ListItem
                          key={value.name || value.fileName || 'uploaded-image'}
                          className="pis-4 plb-3"
                          secondaryAction={
                            <IconButton onClick={handleRemoveFile}>
                              <i className="ri-close-line text-xl" />
                            </IconButton>
                          }
                        >
                          <div
                            className="file-details"
                            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
                          >
                            <div className="file-preview">{renderFilePreview(value)}</div>
                            <div>
                              <Typography className="file-name font-medium" color="text.primary">
                                {value.name || value.fileName}
                              </Typography>
                              {value.size && (
                                <Typography className="file-size" variant="body2">
                                  {value.size > 1000000
                                    ? `${(value.size / 1024 / 1024).toFixed(1)} MB`
                                    : `${(value.size / 1024).toFixed(1)} KB`}
                                </Typography>
                              )}
                            </div>
                          </div>
                        </ListItem>
                      </List>

                      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                        <Button color="error" variant="outlined" onClick={handleRemoveFile}>
                          Remove
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )
            }}
          />
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ProductFeaturedImage
