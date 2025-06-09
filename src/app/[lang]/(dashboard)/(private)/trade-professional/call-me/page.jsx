// MUI Imports
import Grid from '@mui/material/Grid2';
// Component Imports
// import SupportTicketCard from '@views/apps/support-tickets/list/SupportTicketCard';
import PaymentPage from '@/views/trade-professional/call-me/PaymentPage';

const SupportTicketList = async () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <PaymentPage />
            </Grid>
        </Grid>
    );
};

export default SupportTicketList;
