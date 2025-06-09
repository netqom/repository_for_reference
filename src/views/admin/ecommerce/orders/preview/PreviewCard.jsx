// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';

// Component Imports
import Logo from '@components/layout/shared/Logo';

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import './print.css';

const PreviewCard = ({ invoiceData }) => {

  const customer = invoiceData?.createdBy;
  const shippingAddress = invoiceData?.shippingAddress;

  // Parse product details from JSON string in orderDetails
  const orderItems = invoiceData?.orderDetails?.map(detail => {
    const productDetail = JSON.parse(detail.productDetail || '{}');
    return {
      name: productDetail?.product?.name || 'N/A',
      description: productDetail?.description || 'N/A',
      price: Number(detail.price || 0),
      quantity: Number(detail.quantity || 0),
      total: Number(detail.price || 0) * Number(detail.quantity || 0)
    };
  }) || [];

  return (
    <Card className='previewCard'>
      <CardContent className='sm:!p-5'>
        <Grid container spacing={6}>
          {/* Header Section */}
          <Grid size={{ xs: 12 }}>
            <div className='p-6 bg-actionHover rounded bg-red-800'>
              <div className='flex justify-between gap-y-4 flex-col sm:flex-row items-center'>
                <div className='flex flex-col gap-6'>
                  <Logo />
                </div>
                <div className='flex flex-col gap-0'>
                  <Typography variant='h5' className='text-white'>{`Invoice #${invoiceData?.orderId}`}</Typography>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='p' className='text-white'>{`Date Issued: ${new Date(invoiceData?.createdAt).toLocaleDateString()}`}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </Grid>

          {/* Billing Information */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, sm: 6 }} className="p-4 rounded border">
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Invoice To:
                  </Typography>
                  <div>
                    <Typography>{customer?.name}</Typography>
                    <Typography>{customer?.email}</Typography>
                    <Typography>{customer?.phone}</Typography>
                    <Typography>
                      {customer?.addresses?.addressLine1}, {customer?.addresses?.city}, {customer?.addresses?.state} {customer?.addresses?.postalCode}
                    </Typography>
                    <Typography>{customer?.addresses?.country}</Typography>
                  </div>
                </div>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} className="p-4 rounded border">
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Ship To:
                  </Typography>
                  <div>
                    <Typography>{shippingAddress?.name}</Typography>
                    <Typography>{shippingAddress?.phone}</Typography>
                    <Typography>
                      {shippingAddress?.addressLine1}, {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}
                    </Typography>
                    <Typography>{shippingAddress?.country}</Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>

          {/* Item Table */}
          <Grid size={{ xs: 12 }}>
            <div className='overflow-x-auto border rounded'>
              <table className={tableStyles.table}>
                <thead className='bg-[#F6F8FA] '>
                  <tr className='border-be'>
                    <th className='!bg-transparent font-bold'>Item</th>
                    <th className='!bg-transparent font-bold'>Description</th>
                    <th className='!bg-transparent font-bold'>Price</th>
                    <th className='!bg-transparent font-bold'>Qty</th>
                    <th className='!bg-transparent font-bold'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td><Typography color='text.primary'>{item?.name}</Typography></td>
                      <td><Typography color='text.primary'>{item?.description}</Typography></td>
                      <td><Typography color='text.primary'>€{item?.price.toFixed(2)}</Typography></td>
                      <td><Typography color='text.primary'>{item?.quantity}</Typography></td>
                      <td><Typography color='text.primary'>€{item?.total.toFixed(2)}</Typography></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Grid>

          {/* Footer Section */}
          <Grid size={{ xs: 12 }}>
            <div className='flex justify-between flex-col gap-y-4 sm:flex-row'>
              <div className='flex flex-col gap-1 order-2 sm:order-[unset]'>
                <div className='flex items-center gap-2'>
                  <Typography className='font-medium' color='text.primary'>
                    Salesperson:
                  </Typography>
                  <Typography>{customer?.name}</Typography>
                </div>
                <Typography>Thanks for your business</Typography>
              </div>
              <div className='min-is-[200px] bg-[#F6F8FA] border p-4 rounded'>
                <div className='flex items-center justify-between mb-1'>
                  <Typography>Subtotal:</Typography>
                  <Typography className='font-medium' color='text.primary'>€{invoiceData?.subtotal?.toFixed(2)}</Typography>
                </div>
                <div className='flex items-center justify-between mb-1'>
                  <Typography>Discount:</Typography>
                  <Typography className='font-medium' color='text.primary'>€{invoiceData?.discount?.toFixed(2)}</Typography>
                </div>
                <div className='flex items-center justify-between mb-1'>
                  <Typography>Tax:</Typography>
                  <Typography className='font-medium' color='text.primary'>€{invoiceData?.tax?.toFixed(2)}</Typography>
                </div>
                <Divider className='mlb-2' />
                <div className='flex items-center justify-between'>
                  <Typography variant='h5'>Total:</Typography>
                  <Typography variant='h5' className='font-medium' color='text.primary'>€{invoiceData?.total?.toFixed(2)}</Typography>
                </div>
              </div>
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider className='border-dashed' />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PreviewCard;
