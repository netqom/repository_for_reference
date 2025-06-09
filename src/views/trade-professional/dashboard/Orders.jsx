
//MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';

// Components Imports
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';



const Orders = ({ statusSummary }) => {
  // Define label metadata
  const statusArray = [
    {
      key: 'pending',
      title: 'Pending',
      color: 'warning',
      icon: 'ri-time-line'
    },
    {
      key: 'processing',
      title: 'Process',
      color: 'info',
      icon: 'ri-settings-3-line'
    },
    // {
    //   key: 'shipped',
    //   title: 'Shipped',
    //   color: 'primary',
    //   icon: 'ri-truck-line'
    // },
    {
      key: 'delivered',
      title: 'Delivered',
      color: 'success',
      icon: 'ri-check-double-line'
    },
    {
      key: 'cancelled',
      title: 'Cancelled',
      color: 'error',
      icon: 'ri-close-circle-line'
    }
  ];


  const formattedStatusArray = statusArray?.map(item => ({
    stats: `${(statusSummary?.[item.key] ?? 0)}`,
    title: item.title,
    color: item.color,
    icon: item.icon
  }));

  // Merge status count into metadata

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Order Summary'
      //action={<OptionMenu iconClassName='text-textPrimary' options={[]} />}
      />
      <CardContent>
        <Grid container spacing={2}>
          {formattedStatusArray?.map((item, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div>
                  <Typography className='leading-4'>{item.title}</Typography>
                  <Typography variant='h5'>{item.stats}</Typography>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Orders;
