import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { cartServices } from '@/services/cart';
import { addressService } from '@/services/address';
import { fetchUserProfile } from '@/app/front-pages/checkout/page'; 
import { getCartById, getClientById } from '@/app/server/actions';
import { notFound } from 'next/navigation';
import PaymentPageClient from './PaymentPageClient';

// Server-side data fetching functions
async function fetchCartData(cartId) {
  try {
    const response = await getCartById(cartId);

    console.log(response,'response cartServices');
    
    return response || {};
  } catch (error) {
    console.error('Failed to fetch cart data:', error);
    return null;
  }
}

async function fetchClientData(clientId) {
  try {
    const response = await getClientById(clientId);
    return response?.data || null;
  } catch (error) {
    console.error('Failed to fetch client data:', error);
    return null;
  }
}

const PaymentPage = async props => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const cartId = params.id;
  const clientId = searchParams.client;

  console.log('Payment page params:', { params, searchParams });

  if (!cartId || !clientId) {
    notFound();
  }

  // Initialize data
  let initialData = {
    cartItems: [],
    client: null,
    orderSummary: {
      discount: 0,
      shipping: 0,
      subtotal: 0,
      total: 0
    }
  };

  try {
    // Fetch cart and client data in parallel
    const [cartData, clientData] = await Promise.all([
      fetchCartData(cartId),
      fetchClientData(clientId)
    ]);

    // if (!cartData || !clientData) {
    //   notFound();
    // }

    initialData = {
      cartItems: cartData.items || [],
      client: clientData,
      orderSummary: cartData.orderSummary || initialData.orderSummary,
      cartData: cartData,
      shippingAddress: clientData.addressDetails || null
    };

  } catch (error) {
    console.error('Error fetching payment data:', error);
    notFound();
  }

  console.log('Payment page initialData:', initialData);

  return <>
    <PaymentPageClient 
      initialData={initialData} 
      cartId={cartId} 
      clientId={clientId} 
    />
  
  </>;
};

export default PaymentPage;

// MUI Imports