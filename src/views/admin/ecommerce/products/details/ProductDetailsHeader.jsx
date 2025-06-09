// MUI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import moment from 'moment/moment';

const CustomerDetailHeader = ({ productData, customerId }) => {
  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  });

  return (
    <div className='flex flex-wrap justify-between max-sm:flex-col sm:items-center gap-x-6 gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <Typography variant='h4'>{`Product ID #${productData?.sku}`}</Typography>
        <Typography>{moment(productData?.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</Typography>
      </div>
      {/* <OpenDialogOnElementClick
        element={Button}
        elementProps={buttonProps('Delete Customer', 'error', 'outlined')}
        dialog={ConfirmationDialog}
        dialogProps={{ type: 'delete-customer' }}
      /> */}
    </div>
  );
};

export default CustomerDetailHeader;
