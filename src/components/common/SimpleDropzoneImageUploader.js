'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton, Typography, List, ListItem } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDropzone } from 'react-dropzone'
import CustomAvatar from '../../@core/components/mui/Avatar'
import AppReactDropzone from '../../libs/styles/AppReactDropzone'
import Image from 'next/image'

// Styled wrapper
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

function SimpleDropzoneImageUploader({
  title = 'Upload Image',
  multiple = false,
  defaultValue = [],
  maxFiles = 5,
  requiredMessage = 'Image is required',
  onFilesChange
}) {
  const [selectedFiles, setSelectedFiles] = useState(multiple ? defaultValue : defaultValue[0] || null)
  const [dropzoneErrorMessage, setDropzoneErrorMessage] = useState(null)

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    setDropzoneErrorMessage(null)

    if (multiple) {
      const updatedFiles = [...(selectedFiles || []), ...acceptedFiles]
      setSelectedFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    } else {
      const singleFile = acceptedFiles[0] || null
      setSelectedFiles(singleFile)
      onFilesChange?.(singleFile)
    }

    if (rejectedFiles.length > 0) {
      setDropzoneErrorMessage('Some files were rejected. Please upload valid image files.')
    }
  }


  const handleRemoveFile = index => {
    setDropzoneErrorMessage(null)
    if (multiple) {
      if (typeof index === 'number') {
        const updatedFiles = [...selectedFiles]
        updatedFiles.splice(index, 1)
        setSelectedFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
      } else {
        setSelectedFiles([])
        onFilesChange?.([])
      }
    } else {
      setSelectedFiles(null)
      onFilesChange?.(null)
    }
  }

  const renderFilePreview = file => {
    const isLocalFile = file instanceof File
    const imageUrl = isLocalFile
      ? URL.createObjectURL(file)
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${file.filePath}`

    return (
      <div style={{ position: 'relative', width: 38, height: 38 }}>
        <Image
          src={imageUrl}
          alt={file.name || file.fileName || 'Image'}
          fill
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      </div>
    )
  }

  const filesToRender = multiple
    ? selectedFiles && selectedFiles.length
      ? selectedFiles
      : []
    : selectedFiles
      ? [selectedFiles]
      : []

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple,
    onDrop: handleDrop,
    maxFiles: multiple ? maxFiles : 1
  })

  return (
    <DropzoneWrapper>
      <Card>
        <CardHeader title={title} />
        <CardContent>
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

          {/* Validation */}
          {dropzoneErrorMessage && (
            <Typography variant='body2' color='red' sx={{ mt: 1 }}>
              {dropzoneErrorMessage}
            </Typography>
          )}

          {filesToRender.length > 0 && (
            <>
              <List>
                {filesToRender.map((file, index) => (
                  <ListItem
                    key={file.name || file.fileName || `file-${index}`}
                    className='pis-4 plb-3'
                    secondaryAction={
                      <IconButton onClick={() => handleRemoveFile(index)}>
                        <i className='ri-close-line text-xl' />
                      </IconButton>
                    }
                  >
                    <div className='file-details' style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
        </CardContent>
      </Card>
    </DropzoneWrapper>
  )
}

export default SimpleDropzoneImageUploader
