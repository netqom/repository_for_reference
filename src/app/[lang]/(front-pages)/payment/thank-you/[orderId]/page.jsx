import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { getOrderById } from '@/app/server/actions';
import Link from 'next/link';
import { Suspense } from 'react';

// Loading component
const LoadingState = () => (
  <div className="container mx-auto max-w-7xl px-4 py-8">
    <Card className="shadow-lg">
      <CardContent className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4"/>
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"/>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"/>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Error component
const ErrorState = () => (
  <div className="container mx-auto max-w-7xl px-4 py-8">
    <Card className="shadow-lg">
      <CardContent className="text-center py-8">
        <Typography variant="h6" color="error" gutterBottom>
          Order not found or there was an error loading the order details.
        </Typography>
        <div className="mt-4">
          <Link href="/">
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#991b1b',
                '&:hover': {
                  backgroundColor: '#7f1d1d',
                },
              }}
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Order details component
const OrderDetails = ({ orderDetails }) => {
  if (!orderDetails) return <ErrorState />;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Grid container spacing={4} justifyContent="center">
        <Grid xs={12} md={8}>
          <Card className="shadow-lg">
            <CardContent className="text-center py-8">
              <div className="flex justify-center mb-6">
                <i className="ri-checkbox-circle-fill text-6xl text-green-500" />
              </div>
              
              <Typography variant="h4" gutterBottom>
                Thank You for Your Order!
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Your payment has been processed successfully
              </Typography>

              <div className="mt-8">
                <Card elevation={0} className="bg-gray-50 mx-auto max-w-2xl">
                  <CardContent>
                    <Typography variant="h6" gutterBottom className="text-left font-semibold">
                      Order Details
                    </Typography>
                    
                    <div className="text-left mb-4">
                      <Typography variant="body2" color="text.secondary">
                        Order ID: {orderDetails._id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date: {new Date(orderDetails.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>

                    <Divider className="my-4" />

                    {/* Order Items */}
                    <div className="space-y-4">
                      {orderDetails.items?.map((item, index) => (
                        <div key={index} className="flex gap-4 bg-white p-3 rounded-lg">
                          {item?.product?.productFeaturedImage?.filePath && (
                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item.product.productFeaturedImage.filePath}`}
                              alt={item.product?.name || 'Product image'}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder-product.png';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <Typography variant="subtitle2" className="font-medium">
                              {item.product?.name || 'Product Name Unavailable'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity || 0} SQ.M
                            </Typography>
                            <Typography variant="body2" className="font-semibold">
                              €{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Divider className="my-4" />

                    {/* Order Summary */}
                    <div className="bg-white p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Typography>Subtotal:</Typography>
                          <Typography>€{(orderDetails.subtotal || 0).toFixed(2)}</Typography>
                        </div>
                        <div className="flex justify-between">
                          <Typography>Shipping:</Typography>
                          <Typography>€{(orderDetails.shipping || 0).toFixed(2)}</Typography>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between font-bold">
                          <Typography variant="h6">Total:</Typography>
                          <Typography variant="h6" color="primary">
                            €{(orderDetails.total || 0).toFixed(2)}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {orderDetails.shippingAddress && (
                      <div className="mt-4 bg-white p-4 rounded-lg text-left">
                        <Typography variant="subtitle2" className="font-medium mb-2">
                          Shipping Address
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {orderDetails.shippingAddress.addressLine1}<br />
                          {orderDetails.shippingAddress.addressLine2 && (
                            <>{orderDetails.shippingAddress.addressLine2}<br /></>
                          )}
                          {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}<br />
                          {orderDetails.shippingAddress.country}
                        </Typography>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 space-y-4">
                <Typography variant="body1">
                  We have sent a confirmation email with your order details.
                </Typography>
              </div>

              {/* <div className="mt-8 flex gap-4 justify-center">
                <Link href="/">
                  <Button 
                    variant="contained"
                    sx={{
                      backgroundColor: '#991b1b',
                      '&:hover': {
                        backgroundColor: '#7f1d1d',
                      },
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div> */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

const ThankYouPage = async ({ params }) => {
  try {
    const orderId = params.orderId;
    const response = await getOrderById(orderId);
    const orderDetails = response?.success ? response.data : null;

    return (
      <Suspense fallback={<LoadingState />}>
        <OrderDetails orderDetails={orderDetails} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading order details:', error);
    return <ErrorState />;
  }
};

export default ThankYouPage;