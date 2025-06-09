// MUI Imports
'use client';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';
import { toTitleCase } from '@/components/common/helper';
import { useParams, useRouter } from 'next/navigation';

const ProductDetails = ({ productData, statusMap, stockStatusMap }) => {
  const NEXT_PUBLIC_BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
  const { lang: locale } = useParams();
  const router = useRouter();


  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col justify-self-center items-center gap-6'>
          <div className='flex flex-col items-center gap-4'>
            <CustomAvatar src={`${NEXT_PUBLIC_BACKEND_DOMAIN}${productData?.productFeaturedImage?.filePath}`} variant='rounded' alt='Customer Avatar' size={120} />
            <div className='flex flex-col items-center text-center'>
              <Typography variant='h5'>{productData?.name}</Typography>
              <Typography>Product ID #{productData?.sku}</Typography>
            </div>
          </div>
          <div className='flex items-center justify-around gap-4 flex-wrap w-full'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='success'>
                <i className='ri-shopping-bag-line' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{productData?.unitsSold ?? 0}</Typography>
                <Typography>Units Sold</Typography>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='warning'>
                <i className='ri-star-line' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{productData?.rating ?? '0.00'}</Typography>
                <Typography>Rating</Typography>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='info'>
                <i className='ri-inbox-archive-line' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{productData?.totalQuantity ?? 0}</Typography>
                <Typography>In Stock</Typography>
              </div>
            </div>
          </div>

        </div>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Details</Typography>
          <Divider />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Factory Name:
              </Typography>
              <Typography>{toTitleCase(productData?.supplier?.companyName)}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Collection Name:
              </Typography>
              <Typography>
                {toTitleCase(productData?.categories?.map(item => item?.name).join(', '))}
              </Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Created By:
              </Typography>
              <Typography>{toTitleCase(productData?.createdBy?.name)}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Billing Email:
              </Typography>
              <Typography>{productData?.email}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>Status:</Typography>
              <Chip
                label={statusMap[productData?.status]?.label || 'Unknown'}
                variant='tonal'
                color={statusMap[productData?.status]?.color || 'default'}
                size='small'
              />
            </div>

            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>Stock Status:</Typography>
              <Chip
                label={stockStatusMap[productData?.stockStatus]?.label || 'Unknown'}
                variant='tonal'
                color={stockStatusMap[productData?.stockStatus]?.color || 'default'}
                size='small'
              />
            </div>

            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Contact:
              </Typography>
              <Typography>{productData?.createdBy?.phone}</Typography>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/${locale}/admin/ecommerce/products/${productData?._id}`)} variant='contained' type='button'>
          {'Edit Product'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;
