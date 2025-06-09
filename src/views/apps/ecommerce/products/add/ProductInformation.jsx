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
import { useFormContext } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';

// Components
import CustomIconButton from '@core/components/mui/IconButton';
import '@/libs/styles/tiptapEditor.css';

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-5 pbe-4 pli-5'>
      {/* ...Toolbar Buttons Same As Before... */}
    </div>
  );
};

const ProductInformation = () => {
  const { register } = useFormContext();

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
      <CardHeader title='Product Information 2' />
      <CardContent>
        <Grid container spacing={5} className='mbe-5'>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label='Product Name' placeholder='iPhone 14' {...register('name')} />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='SKU' placeholder='FXSK123U' {...register('sku')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label='Barcode' placeholder='0123-4567' {...register('barcode')} />
          </Grid> */}
        </Grid>
        <Typography className='mbe-1'>Description (Optional)</Typography>
        <Card className='p-0 border shadow-none'>
          <CardContent className='p-0'>
            <EditorToolbar editor={editor} />
            <Divider className='mli-5' />
            <EditorContent editor={editor} className='bs-[135px] overflow-y-auto flex' />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ProductInformation;
