'use client'

// React Imports
import { useForm, FormProvider } from 'react-hook-form'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports

import ProductFeaturedImage from './ProductFeaturedImage'
import { useEffect, useState } from 'react'
import { createProduct, getProductDetails, getProductRawData, updateProduct } from '@/app/server/actions'
import { generateSku, generateSlug } from '@/components/common/helper'
import { useParams, useRouter } from 'next/navigation'
import ProductVariants from './ProductVariants'
import ProductOrganize from './ProductOrganize'
import ProductAddHeader from './ProductAddHeader'
import ProductInformation from './ProductInformation'
import { toast } from 'react-toastify'
import SampleOrder from './SampleOrder'

const AddProduct = () => {
  const router = useRouter()
  const { lang: locale, id: productId } = useParams()

  const [rawProduct, setRawProduct] = useState([])
  const [productSuppliers, setProductSuppliers] = useState([])
  const [attributeVariations, setAttributeVariations] = useState([])
  const [defaultAttribute, setDefaultAttribute] = useState([])
  const [productVariations, setProductVariations] = useState([])
  const [sampleData, setSampleData] = useState({})

  const defaultValues = {
    productVariations: productVariations || []
  }
  const formMethods = useForm({ defaultValues })
  const { handleSubmit, reset } = formMethods

  useEffect(() => {
    getRawData()
  }, [])

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

  const fetchProductDetails = async () => {
    try {
      const response = await getProductDetails(productId)

      if (response?.success && response?.data) {
        const product = response.data

        // Map supplier object to supplier ID string (or empty string)
        const supplierId = product.supplier?._id || ''

        // Map categories array of objects to array of IDs
        const categoryIds = Array.isArray(product.categories) ? product.categories.map(category => category._id) : []

        // Map attributeVariations array of objects to array of IDs
        const attributeVariationIds = Array.isArray(product.attributeVariations)
          ? product.attributeVariations.map(attr => attr._id)
          : []

        const attributeIds = Array.isArray(product.attributes) ? product.attributes : []

        const sampleData = product?.samples ?
          (typeof product.samples === 'string' ? JSON.parse(product.samples) : product.samples)
          : {};

        // Map productVariations array with complete data structure
        const productVariations = Array.isArray(product.productVariations)
          ? product.productVariations.map(variation => {
              // Extract attribute information from the product's attributeVariations
              const attributes = product.attributeVariations.map(attr => ({
                _id: attr._id,
                productAttribute: attr.productAttribute,
                metaKey: attr.metaKey,
                metaValue: attr.metaValue,
                measurementUnit: attr.productMeasurementUnit
                  ? {
                      _id: attr.productMeasurementUnit,
                      name: '' // This will be filled if available
                    }
                  : null
              }))

              return {
                _id: variation?._id,
                variationId: variation?._id,
                description: variation.description || '',
                stockStatus: variation.stockStatus || '',
                stockQuantity: variation.stockQuantity || 0,
                allowBackorders: variation.allowBackorders || false,
                weight: variation.weight || 0,
                dimensions: {
                  length: variation.dimensions?.length || 0,
                  width: variation.dimensions?.width || 0,
                  height: variation.dimensions?.height || 0
                },
                regularPriceB2B: variation.regularPriceB2B || 0,
                regularPriceB2C: variation.regularPriceB2C || 0,
                tierDiscount: variation.tierDiscount || {},
                salePrice: variation.salePrice || 0,
                purchasedPrice: variation.purchasedPrice || 0,
                numberOfTiles: variation?.numberOfTiles || 0,
                boxSize: variation?.boxSize || 0,
                palletSize: variation?.palletSize || 0,
                sqmPerTile: variation?.sqmPerTile || 0,
                palletWeight: variation?.palletWeight || 0,
                boxesPerPallet: variation?.boxesPerPallet || 0,
                boxWeight: variation?.boxWeight || 0,
                customImageUrl: variation.customImageUrl || '',
                variationImages: variation.variationImages || [],
                image: variation.image || '',
                shippingClass: variation.shippingClass || '',
                taxClass: variation.taxClass || '',
                status: variation.status || false,
                attributes: attributes, // Add the attributes array
                // Add attribute key-value pairs for the UI display
                ...product.attributeVariations.reduce((acc, attr) => {
                  const key = attr.metaKey.toLowerCase()
                  const value = attr.metaValue
                  acc[key] = value
                  return acc
                }, {})
              }
            })
          : []

        // Map productImages array if needed, example:
        // const productImages = Array.isArray(product.productImages)
        //   ? product.productImages.map(image => ({
        //       // Map as per your form expects
        //       id: image._id || '',
        //       url: image.url || '' // Assuming your image object has url property
        //     }))
        //   : []

        // Prepare full form values object
        const formValues = {
          _id: product._id,
          externalId: product.externalId || '',
          sku: product.sku || '',
          name: product.name || '',
          slug: product.slug || '',
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          isDeleted: product.isDeleted || false,
          supplier: supplierId,
          stockStatus: product.stockStatus || '',
          status: product.status || 0,
          defaultPrice: product.defaultPrice || 0,
          categories: categoryIds,
          attributes: attributeIds,
          attributeVariations: attributeVariationIds,
          samples: product?.samples, // add for sample
          allowSample: product?.allowSample, // add for sample
          productVariations: productVariations,
          // productImages: productImages,
          productFeaturedImage: product.productFeaturedImage || null,
          createdBy: product.createdBy || null,
          updatedBy: product.updatedBy || null,
          createdAt: product.createdAt || null,
          updatedAt: product.updatedAt || null
        }

        setDefaultAttribute(attributeIds)
        setAttributeVariations(attributeVariationIds)
        setProductVariations(productVariations)
        setSampleData(sampleData)

        // Reset the form with fetched and mapped values
        reset(formValues)
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  const onSubmit = async formDataValues => {
    // console.log(formDataValues, 'formDataValuesformDataValuesformDataValues');
    // return;
    try {
      const missingFields = []

      // Validate all product variations
      formDataValues.productVariations?.forEach((variation, index) => {
        if (!variation.regularPriceB2B) missingFields.push('B2B Regular Price')
        if (!variation.regularPriceB2C) missingFields.push('B2C Regular Price')
        if (!variation.purchasedPrice) missingFields.push('Purchased Price')
        if (!variation.weight) missingFields.push('Weight')
        if (!variation.numberOfTiles) missingFields.push('Number of Tiles')
        if (!variation.boxSize) missingFields.push('Box Size')
        if (!variation.palletSize) missingFields.push('Pallet Size')

        if (!variation.variationImages || variation.variationImages.length === 0) {
          missingFields.push('Variation Images')
        }
      })

      // Stop submission and show error if any required fields are missing
      if (missingFields.length > 0) {
        toast.error(`${missingFields[0]} is a required field`)
        return false
      }

      const formData = new FormData()

      // Handle featured image
      const isExistingFeaturedImage =
        formDataValues.productFeaturedImage &&
        typeof formDataValues.productFeaturedImage === 'object' &&
        formDataValues.productFeaturedImage._id &&
        !(formDataValues.productFeaturedImage instanceof File)

      if (isExistingFeaturedImage) {
        formDataValues.productFeaturedImage = []
      }

      // Generate slug and SKU if creating a new product
      if (!productId) {
        formDataValues.slug = generateSlug(formDataValues.name)
        formDataValues.sku = generateSku()
      } else {
        delete formDataValues.slug
        delete formDataValues.sku
      }

      // Append variation images and replace file objects with reference keys
      const updatedProductVariations =
        formDataValues.productVariations?.map((variation, variationIndex) => {
          const updatedVariation = { ...variation }

          if (Array.isArray(updatedVariation.variationImages)) {
            updatedVariation.variationImages = updatedVariation.variationImages.map((file, imageIndex) => {
              const formDataKey = `productVariations[${variationIndex}].variationImages[${imageIndex}]`

              if (file instanceof File) {
                formData.append(formDataKey, file)
              }

              return formDataKey
            })
          }

          return updatedVariation
        }) || []

      formDataValues.productVariations = updatedProductVariations

      // Append all fields to formData
      for (const fieldKey in formDataValues) {
        if (fieldKey !== 'productFeaturedImage') {
          const fieldValue = formDataValues[fieldKey]

          if (Array.isArray(fieldValue) || typeof fieldValue === 'object') {
            formData.append(fieldKey, JSON.stringify(fieldValue))
          } else {
            formData.append(fieldKey, fieldValue)
          }
        }
      }

      // Append featured image if it's a new file
      if (formDataValues.productFeaturedImage instanceof File) {
        formData.append('productFeaturedImage', formDataValues.productFeaturedImage)
      }

      // Debug: log formData keys and values
      // for (let [key, value] of formData.entries()) {
      //   // console.log(`${key}:`, value);
      // }

      // Call appropriate API
      let response
      if (productId) {
        response = await updateProduct(productId, formData)
      } else {
        response = await createProduct(formData)
      }

      // console.log('API Response:', response);

      if (response.success) {
        router.push(`/${locale}/admin/ecommerce/products/list`)
        toast.success(response.message || 'Product created successfully')
      } else {
        toast.error(response.message || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error during product submission:', error)
      toast.error(error?.message || 'Something went wrong while submitting the product')
    }
  }

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
                <ProductVariants
                  productAttributes={rawProduct?.productAttributes}
                  defaultAttribute={defaultAttribute}
                  defaultAttributeVariations={attributeVariations}
                  defaultProductVariations={productVariations}
                />
              </Grid>
              {/* <Grid size={{ xs: 12 }}>
                <ProductImage />
              </Grid> */}

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
                <ProductOrganize rawProductData={rawProduct} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SampleOrder sampleData={sampleData} />
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
