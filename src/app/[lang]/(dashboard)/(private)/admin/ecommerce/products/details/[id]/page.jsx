// Next Imports
import { redirect } from 'next/navigation';

// Component Imports
import ProductDetails from '@/views/admin/ecommerce/products/details';
import { productServices } from '@/services/product';

export async function fetchById(id) {
  try {
    return await productServices.getById(id);
  } catch (error) {
    throw new Error('Failed to fetch product data');
  }
}

const ProductDetailsPage = async props => {
  const params = await props.params;
  const productId = params?.id;

  const response = await fetchById(productId);
  const productData = response?.data;

  if (!productData) {
    redirect('/not-found');
  }

  return productData ? <ProductDetails productData={productData} productId={productId} /> : null;
};

export default ProductDetailsPage;
