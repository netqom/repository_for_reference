// Component Imports
import { fetchUserProfile } from '@/app/front-pages/checkout/page';
import { getCartData } from '@/app/server/actions';
import { authOptions } from '@/libs/auth';
import { addressService } from '@/services/address';
import { cartServices } from '@/services/cart';
import { adminSettingServices } from '@/services/adminSetting';
import { adminSettingId } from '@/configs/constant';
import Checkout from '@views/front-pages/CheckoutPage'
import { getServerSession } from 'next-auth';

// Server-side data fetching functions
export async function fetchCartData(userId) {
  try {
    const response = await cartServices.getById(userId);
    const cartData = response?.data || {};
    return cartData;
  } catch (error) {
    console.error('Failed to fetch cart data:', error)
    return { items: [], subtotal: 0, total: 0 }
  }
}

export async function fetchUserAddresses(userId) {
  try {
    const addresses = await addressService.getById(userId)
    return addresses?.data || []
  } catch (error) {
    console.error('Failed to fetch user addresses:', error)
    return []
  }
}

export async function fetchAdminSettings() {
  try {
    const response = await adminSettingServices.getById(adminSettingId);
    return response?.data || null;
  } catch (error) {
    console.error('Failed to fetch admin settings:', error);
    return null;
  }
}

const CheckoutPage = async () => {
  // Get session on server side
  const session = await getServerSession(authOptions)

  // Initialize data
  let initialData = {
    cartItems: [],
    addresses: [],
    user: null,
    orderSummary: {
      discount: 0,
      shipping: 0,
      subtotal: 0,
      vat: 0,
      total: 0
    },
    adminSettings: null
  }

  // Fetch data if user is authenticated
  if (session?.user?._id) {
    const [cartData, addresses, userProfile, adminSettings] = await Promise.all([
      fetchCartData(session.user._id),
      fetchUserAddresses(session.user._id),
      fetchUserProfile(session.user._id),
      fetchAdminSettings()
    ]);

    // Calculate VAT
    const subtotal = cartData.orderSummary?.subtotal || 0;
    const vatRate = adminSettings?.vatOnOrder || 0;
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;

    // Update order summary with VAT
    const orderSummary = {
      ...cartData.orderSummary,
      vat: vatAmount,
      total: total
    };

    initialData = {
      cartItems: cartData.items,
      addresses: addresses,
      user: userProfile || session.user,
      orderSummary: orderSummary,
      cartData: cartData,
      adminSettings: adminSettings
    }
  }

  return <>
    <Checkout initialData={initialData} session={session} />
  </>
}

export default CheckoutPage
