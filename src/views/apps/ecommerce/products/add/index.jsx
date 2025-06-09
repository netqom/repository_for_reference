'use client'

// React Imports
import { useForm, FormProvider } from 'react-hook-form'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'

// Component Imports
import ProductAddHeader from '@views/apps/ecommerce/products/add/ProductAddHeader'
import ProductInformation from '@views/apps/ecommerce/products/add/ProductInformation'
import ProductImage from '@views/apps/ecommerce/products/add/ProductImage'
import ProductVariants from '@views/apps/ecommerce/products/add/ProductVariants'
import ProductInventory from '@views/apps/ecommerce/products/add/ProductInventory'
import ProductPricing from '@views/apps/ecommerce/products/add/ProductPricing'
import ProductOrganize from '@views/apps/ecommerce/products/add/ProductOrganize'
import ProductFeaturedImage from './ProductFeaturedImage';
import { useEffect, useState } from 'react';
import { createProduct, getProductRawData } from '@/app/server/actions';
import { generateSku, generateSlug } from '@/components/common/helper';

const AddProduct = () => {
  const formMethods = useForm()

  const { handleSubmit } = formMethods
   const [rawProduct, setRawProduct] = useState([])
   const [productSuppliers, setProductSuppliers] = useState([])

  const getRawData = async () => {
    try {
      const response = await getProductRawData()
      if (response?.data) {
        setRawProduct(response?.data)
      }
    } catch (error) {
      console.error('Failed to fetch raw data:', error)
    }
  }

  useEffect(() => {
    getRawData()
  }, [])

const onSubmit = async (data) => {
  // Generate slug and SKU
  const slug = generateSlug(data.name);
  const sku = generateSku();

  // Create a new FormData instance
  const formData = new FormData();

  // Append all fields except files first
  for (const key in data) {
    if (!['productFeaturedImage', 'productImages'].includes(key)) {
      // Handle arrays or objects by stringifying
      if (Array.isArray(data[key]) || typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  }

  // Append slug and sku as strings
  formData.append('slug', slug);
  formData.append('sku', sku);

  // Append productFeaturedImage file if exists
  if (data.productFeaturedImage && data.productFeaturedImage.file) {
    // Assuming your file object is in productFeaturedImage.file
    formData.append('productFeaturedImage', data.productFeaturedImage.file);
  }

  // Append multiple productImages files if exist
  if (Array.isArray(data.productImages)) {
    data.productImages.forEach((img, index) => {
      if (img.file) {
        formData.append('productImages[]', img.file); // name as array
      }
    });
  }

  // Call the API with FormData (make sure API accepts multipart/form-data)
  const response = await createProduct(formData);

};

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ProductAddHeader />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12 }}>
                <ProductInformation />
              </Grid>
               <Grid size={{ xs: 12 }}>
                <ProductVariants productAttributes={rawProduct?.productAttributes}/>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ProductImage />
              </Grid>

              {/* <Grid size={{ xs: 12 }}>
                <ProductInventory />
              </Grid> */}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={6}>
              {/* <Grid size={{ xs: 12 }}>
                <ProductPricing />
              </Grid> */}
              <Grid size={{ xs: 12 }}>
                <ProductOrganize rawProductData={rawProduct}/>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ProductFeaturedImage />
              </Grid>
              {/* <Grid size={{ xs: 12 }}>
                <Button type='submit' variant='contained'>
                  Publish Product
                </Button>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  )
}

export default AddProduct
