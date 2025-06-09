// Next.js Server Component
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { addressService } from "@/services/address"
import CheckoutPage from "@/views/front-pages/CheckoutPage"
import { authOptions } from "@/libs/auth"
import { cartServices } from "@/services/cart"

// Server-side data fetching functions
export async function fetchCartData(userId) {
  try {
    const cartData = await cartServices.getById(userId)

    // console.log(cartData, 'cartData hello');

    return {
      items: cartData?.items || [],
      subtotal: cartData?.subtotal || 0,
      total: cartData?.total || 0,
    }
  } catch (error) {
    console.error("Failed to fetch cart data:", error)
    return { items: [], subtotal: 0, total: 0 }
  }
}

export async function fetchUserAddresses(userId) {
  try {
    const addresses = await addressService.getById(userId)
    return addresses.data || []
  } catch (error) {
    console.error("Failed to fetch user addresses:", error)
    return []
  }
}

export async function fetchUserProfile(userId) {
  try {
    // Fetch user profile data
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/${userId}`)
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return null
  }
}

// Main Server Component
const CheckoutServerPage = async () => {
  // Get session on server side
  const session = await getServerSession(authOptions)

  // Initialize data
  let initialData = {
    cartItems: [],
    addresses: [],
    user: null,
    orderSummary: {
      subtotal: 0,
      shipping: 0,
      total: 0,
    },
  }

  // Fetch data if user is authenticated
  if (session?.user?._id) {
    const [cartData, addresses, userProfile] = await Promise.all([
      fetchCartData(session.user._id),
      fetchUserAddresses(session.user._id),
      fetchUserProfile(session.user._id),
    ])


    initialData = {
      cartItems: cartData.items,
      addresses: addresses,
      user: userProfile || session.user,
      orderSummary: {
        subtotal: cartData.subtotal,
        shipping: 0,
        total: cartData.total,
      },
    }
  }


  return <CheckoutPage initialData={initialData} session={session} />
}

export default CheckoutServerPage
