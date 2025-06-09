
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem
} from '@mui/material';
import CustomAvatar from '@core/components/mui/Avatar';
import Image from 'next/image';

const TicketFile = ({ onChangeImage }) => {
  // Separate form to manage file only
  const { control, setValue, watch } = useForm({
    defaultValues: {
      ticketFile: null
    }
  });

  const imageValue = watch('ticketFile');

  useEffect(() => {
    onChangeImage(imageValue);
  }, [imageValue, onChangeImage]);

  const renderFilePreview = file => {
    const isLocalFile = file instanceof File;
    const imageUrl = isLocalFile
      ? URL.createObjectURL(file)
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${file.filePath}`;

    return (
      <div style={{ position: 'relative', width: 38, height: 38 }}>
        <Image
          src={imageUrl}
          alt={file.name || 'Featured image'}
          fill
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardContent>
        <Controller
          name="ticketFile"
          control={control}
          rules={{ required: 'Featured image is required' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            const onDrop = acceptedFiles => {
              if (acceptedFiles.length > 0) {
                onChange(acceptedFiles[0]);
              }
            };

            const { getRootProps, getInputProps } = useDropzone({
              accept: {
                'image/*': [],                // all image types
                'application/pdf': [],       // PDF files
                'application/msword': [],    // .doc
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // .docx
                'application/vnd.ms-excel': [], // .xls
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], // .xlsx
              },
              multiple: false,
              onDrop
            });

            const handleRemoveFile = () => {
              onChange(null);
            };

            return (
              <>
                <div {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} />
                  <div className="flex items-center flex-col gap-2 text-center">
                    <CustomAvatar variant="rounded" skin="light" color="secondary">
                      <i className="ri-upload-2-line" />
                    </CustomAvatar>
                    <Typography variant="h4">Drag and Drop File here</Typography>
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
                        <div className="file-details" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            );
          }}
        />
      </CardContent>
    </Card>
  );
};

export default TicketFile;
