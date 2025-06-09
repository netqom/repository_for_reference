'use client';

// MUI Imports
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// TipTap and RHF Imports
import { Controller, useFormContext } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';

// Components
import CustomIconButton from '@core/components/mui/IconButton';
import '@/libs/styles/tiptapEditor.css';
import { TextareaAutosize } from '@mui/material';

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-5 pbe-4 pli-5'>{/* ...Toolbar Buttons Same As Before... */}</div>
  );
};

const ProductInformation = () => {
  const { control } = useFormContext();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write something here...' })
    ]
  });

  return (
    <Card>
      <CardHeader title='Product Information' />
      <CardContent>
        <Grid container spacing={5} className='mbe-5'>
          <Grid size={{ xs: 12 }}>
            <Controller
              name='name'
              control={control}
              defaultValue='' // default value needed to avoid uncontrolled warnings
              rules={{ required: 'Product name is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Product Name'
                  placeholder='Product Name'
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='SKU' placeholder='FXSK123U' {...register('sku')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='Barcode' placeholder='0123-4567' {...register('barcode')} />
          </Grid> */}
        </Grid>
        <Typography className='mbe-1'>Description (Optional)</Typography>
        <CardContent className='p-0'>
          <Controller
            name='description'
            control={control}
            defaultValue=''
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                label='Product Description'
                placeholder='Enter product description'
                multiline
                rows={4}
                sx={{ mt: 2 }}
              />
            )}
          />
          {/* <EditorToolbar editor={editor} />
            <Divider className='mli-5' />
            <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex' /> */}
        </CardContent>
      </CardContent>
    </Card>
  );
};

export default ProductInformation;
