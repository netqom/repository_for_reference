// MUI Imports
import Grid from '@mui/material/Grid2';
// Component Imports
// import SupportTicketCard from '@views/apps/support-tickets/list/SupportTicketCard';
import SupportTicketListTable from '@/views/admin/support-tickets/list';

const SupportTicketList = async () => {
  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <SupportTicketCard />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <SupportTicketListTable />
      </Grid>
    </Grid>
  );
};

export default SupportTicketList;
