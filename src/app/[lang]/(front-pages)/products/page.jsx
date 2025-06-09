// MUI Imports
import ProductsPage from '@/views/front-pages/product/ProductsPage';
import Grid from '@mui/material/Grid2';
// Component Imports
// import SupportTicketCard from '@views/apps/support-tickets/list/SupportTicketCard';

const ProductList = async () => {
  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <SupportTicketCard />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <ProductsPage />
      </Grid>
    </Grid>
  );
};

export default ProductList;
