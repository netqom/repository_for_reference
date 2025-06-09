// Next Imports
import dynamic from 'next/dynamic';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import ProductDetailsHeader from './ProductDetailsHeader';
import ProductLeftOverview from './product-left-overview';
import ProductRight from './product-right';
import OrderList from '@/views/admin/trade-professionals/view/user-right/orders/list';

const OverViewTab = dynamic(() => import('@/views/admin/ecommerce/products/details/product-right/overview'));

// Vars
const tabContentList = (productData, statusMap, stockStatusMap) => ({
  overview: <OverViewTab productData={productData} statusMap={statusMap} stockStatusMap={stockStatusMap} />,
   orders: <OrderList />,
});

const ProductDetails = ({ productData, productId }) => {

  const statusMap = { 1: { label: 'Published', color: 'success' }, 0: { label: 'Draft', color: 'default' } };
  const stockStatusMap = { in_stock: { label: 'In Stock', color: 'success' }, out_of_stock: { label: 'Out of Stock', color: 'warning' } };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductDetailsHeader productData={productData} productId={productId} statusMap={statusMap} stockStatusMap={stockStatusMap} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ProductLeftOverview productData={productData} statusMap={statusMap} stockStatusMap={stockStatusMap} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <ProductRight tabContentList={tabContentList(productData, statusMap, stockStatusMap)} />
      </Grid>
    </Grid>
  );
};

export default ProductDetails;
