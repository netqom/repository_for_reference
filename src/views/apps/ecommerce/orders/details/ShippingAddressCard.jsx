// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import AddAddress from '@components/dialogs/add-edit-address'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Vars
const data = {
  firstName: 'Roker',
  lastName: 'Terrace',
  email: 'sbaser0@boston.com',
  country: 'UK',
  address1: 'Latheronwheel',
  address2: 'KW5 8NW, London',
  landmark: 'Near Water Plant',
  city: 'London',
  state: 'Capholim',
  zipCode: '403114',
  taxId: 'TAX-875623',
  vatNumber: 'SDF754K77',
  contact: '+1 (609) 972-22-22'
}

const ShippingAddress = ({ data }) => {
  // Vars
  const typographyProps = (children, color, className) => ({
    children,
    color,
    className
  })

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <Typography variant='h5'>Shipping Address</Typography>
          {/* <OpenDialogOnElementClick
            element={Typography}
            elementProps={typographyProps('Edit', 'primary', 'cursor-pointer font-medium')}
            dialog={AddAddress}
            dialogProps={{ type: 'Add address for billing address', data }}
          /> */}
        </div>
        {data?.shippingAddress?.type === 'Shipping' ? (
          <div className='flex flex-col gap-1'>
            <Typography variant='body1' className='font-medium'>
              {data.shippingAddress.name}
            </Typography>
            <Typography variant='body2'>{data.shippingAddress.addressLine1}</Typography>
            {data.shippingAddress.addressLine2 && (
              <Typography variant='body2'>{data.shippingAddress.addressLine2}</Typography>
            )}
            <Typography variant='body2'>
              {data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.postalCode}
            </Typography>
            <Typography variant='body2'>{data.shippingAddress.country}</Typography>
            <Typography variant='body2' className='text-sm text-gray-500'>
              Phone: {data.shippingAddress.phone}
            </Typography>
            {data.shippingAddress.label && (
              <Typography variant='caption' className='text-xs text-gray-500 italic'>
                Label: {data.shippingAddress.label}
              </Typography>
            )}
          </div>
        ) : (
          <Typography variant='body2' className='text-gray-500'>
            No Address Added
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default ShippingAddress
