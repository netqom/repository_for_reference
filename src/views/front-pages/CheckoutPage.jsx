"use client"

// React Imports
import { SessionProvider } from "next-auth/react"
import { useState, useEffect } from "react"

// Third-party Imports
import classnames from "classnames"

// Component Imports
import CheckoutWizard from "@/views/pages/wizard-examples/checkout/CheckoutWizard"

// Styles Imports
import frontCommonStyles from "./styles.module.css"

const CheckoutPage = ({ initialData, session }) => {
  const [orderSummary, setOrderSummary] = useState(initialData?.orderSummary || {});
  const cartItems = initialData?.cartItems || [];

  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      vat: 0,
      total: 0
    };

    // Calculate subtotal from cart items
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.variation?.regularPriceB2C * item.quantity);
    }, 0);

    // Get other values from existing order summary
    const discount = orderSummary?.discount || 0;
    const shipping = orderSummary?.shipping || 0;

    // Calculate VAT
    const vatRate = initialData?.adminSettings?.vatOnOrder || 0;
    const vat = ((subtotal - discount) * vatRate) / 100;

    // Calculate final total
    const total = subtotal - discount + shipping + vat;

    return {
      subtotal,
      discount,
      shipping,
      vat,
      total
    };
  };

  // Calculate totals whenever cart items or order summary changes
  useEffect(() => {
    const newTotals = calculateTotals();
    setOrderSummary(newTotals);
  }, [cartItems, initialData?.orderSummary]);

  return (
    <SessionProvider session={session}>
      <section className={classnames("md:plb-[100px] plb-6", frontCommonStyles.layoutSpacing)}>
        <CheckoutWizard initialData={{...initialData, orderSummary}} />
      </section>

    </SessionProvider>
  )
}

export default CheckoutPage
