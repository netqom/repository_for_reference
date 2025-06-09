'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Typography, List, ListItem } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDropzone } from 'react-dropzone'
import { useFormContext, Controller } from 'react-hook-form'
import CustomAvatar from '../../@core/components/mui/Avatar'
import AppReactDropzone from '../../libs/styles/AppReactDropzone'
import Image from 'next/image'

// Styled wrapper for dropzone container
const DropzoneWrapper = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

function DropzoneImageUploader({
  fieldName,
  title = 'Upload Image',
  requiredMessage = 'Image is required',
  multiple = false,
  defaultValue = [],
  maxFiles = 5
}) {
  const { control } = useFormContext()
  const [dropzoneErrorMessage, setDropzoneErrorMessage] = useState(null) // ✅ State for maxFiles error

  const renderFilePreview = file => {
    const isImage = file.type?.startsWith('image/')
    const isLocalFile = file instanceof File
    const fileUrl = isLocalFile
      ? URL.createObjectURL(file)
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${file.filePath}`

    if (isImage) {
      return (
        <div style={{ position: 'relative', width: 38, height: 38 }}>
          <Image
            src={fileUrl}
            alt={file.name || file.fileName || 'Image'}
            fill
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        </div>
      )
    }

    // Render icon for non-image files
    return (
      <CustomAvatar skin='light' color='primary' variant='rounded'>
        <i className='ri-file-line' />
      </CustomAvatar>
    )
  }

  return (
    <DropzoneWrapper>
      <Card>
        <CardHeader title={title} sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }} />
        <CardContent>
          <Controller
            name={fieldName}
            control={control}
            rules={{ required: requiredMessage }}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const handleDrop = (acceptedFiles, rejectedFiles) => {
                setDropzoneErrorMessage(null) // Clear previous message

                const currentFiles = multiple ? value || [] : value ? [value] : []
                const remainingSlots = maxFiles - currentFiles.length

                // Slice accepted files to max allowed slots
                const allowedFiles = acceptedFiles.slice(0, remainingSlots)
                const ignoredFilesCount = acceptedFiles.length - allowedFiles.length + rejectedFiles.length

                // Add accepted files (up to remainingSlots)
                if (allowedFiles.length > 0) {
                  if (multiple) {
                    onChange([...currentFiles, ...allowedFiles])
                  } else {
                    onChange(allowedFiles[0])
                  }
                }

                // Show warning if any files were rejected or ignored due to maxFiles
                if (ignoredFilesCount > 0) {
                  setDropzoneErrorMessage(`Only ${maxFiles} file${maxFiles > 1 ? 's are' : ' is'} allowed.`)
                }
              }

              const { getRootProps, getInputProps } = useDropzone({
                accept: {},
                multiple,
                onDrop: handleDrop,
                maxFiles: multiple ? maxFiles : 1
              })

              const handleRemoveFile = index => {
                setDropzoneErrorMessage(null) // ✅ Reset error on remove

                if (multiple) {
                  if (typeof index === 'number') {
                    const updatedFiles = [...(value || [])]
                    updatedFiles.splice(index, 1)
                    onChange(updatedFiles)
                  } else {
                    onChange([])
                  }
                } else {
                  onChange(null)
                }
              }

              const filesToRender = multiple ? (value && value.length ? value : defaultValue) : value || defaultValue[0]

              return (
                <>
                  <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <div className='flex items-center flex-col gap-2 text-center'>
                      <CustomAvatar variant='rounded' skin='light' color='secondary'>
                        <i className='ri-upload-2-line' />
                      </CustomAvatar>
                      <Typography variant='h4'>Drag and Drop {multiple ? 'Images' : 'an Image'}</Typography>
                      <Typography color='text.disabled'>or</Typography>
                      <Button variant='outlined' size='small'>
                        Browse {multiple ? 'Images' : 'Image'}
                      </Button>
                    </div>
                  </div>

                  {/* ✅ Display error from validation rules */}
                  {error && (
                    <Typography variant='body2' color='red' sx={{ mt: 2 }}>
                      {error.message}
                    </Typography>
                  )}

                  {/* ✅ Display maxFiles error */}
                  {dropzoneErrorMessage && (
                    <Typography variant='body2' color='red' sx={{ mt: 1 }}>
                      {dropzoneErrorMessage}
                    </Typography>
                  )}

                  {filesToRender && (Array.isArray(filesToRender) ? filesToRender.length > 0 : true) && (
                    <>
                      <List>
                        {(Array.isArray(filesToRender) ? filesToRender : [filesToRender]).map((file, index) => (
                          <ListItem
                            key={file.name || file.fileName || `file-${index}`}
                            className='pis-4 plb-3'
                            secondaryAction={
                              <IconButton onClick={() => handleRemoveFile(index)}>
                                <i className='ri-close-line text-xl' />
                              </IconButton>
                            }
                          >
                            <div
                              className='file-details'
                              style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
                            >
                              <div className='file-preview'>{renderFilePreview(file)}</div>
                              <div>
                                <Typography className='file-name font-medium' color='text.primary'>
                                  {file.name || file.fileName}
                                </Typography>
                                {file.size && (
                                  <Typography className='file-size' variant='body2'>
                                    {file.size > 1000000
                                      ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                                      : `${(file.size / 1024).toFixed(1)} KB`}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </ListItem>
                        ))}
                      </List>

                      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                        <Button color='error' variant='outlined' onClick={() => handleRemoveFile()}>
                          {multiple ? 'Remove All' : 'Remove'}
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
    </DropzoneWrapper>
  )
}

export default DropzoneImageUploader
