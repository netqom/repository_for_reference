// MUI Imports
import ClientListTable from '@/views/trade-professional/client/list/ClientListTable';
import Grid from '@mui/material/Grid2';

const ClientList = async () => {
  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <SupportTicketCard />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <ClientListTable />
      </Grid>
    </Grid>
  );
};

export default ClientList;
