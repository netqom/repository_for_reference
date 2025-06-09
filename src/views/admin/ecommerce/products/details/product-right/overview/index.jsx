// MUI Imports
import Grid from '@mui/material/Grid2';
import ProductVariationListTable from './ProductVariationListTable';


const Overview = async ({ productData, statusMap, stockStatusMap }) => {

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductVariationListTable productData={productData} statusMap={statusMap} stockStatusMap={stockStatusMap} />
      </Grid>
    </Grid>
  );
};

export default Overview;
