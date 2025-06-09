// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports
import ProductDetails from './ProductDetails';
// import CustomerPlan from './ProductPlan';



const ProductLeftOverview = ({ productData, statusMap, stockStatusMap }) => {

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductDetails productData={productData} statusMap={statusMap} stockStatusMap={stockStatusMap} />
      </Grid>
      {/* <Grid size={{ xs: 12 }}>
        <CustomerPlan />
      </Grid> */}
    </Grid>
  );
};

export default ProductLeftOverview;
