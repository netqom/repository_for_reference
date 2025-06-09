"use client";

// React Imports
import { useContext } from "react";

// Next Imports
import Link from "next/link";

// MUI Imports
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";

// Context Import
import { CheckoutContext } from "./CheckoutWizard";

const StepConfirmation = () => {
  const { cartItems, orderSummary, selectedAddress, addresses, selectedShipping, user, adminSettings } = useContext(CheckoutContext);

  // Get selected address details
  const selectedAddressDetails = addresses.find((addr) => addr.id === selectedAddress);

  // Generate order ID (in real app, this would come from the server)
  const orderId = `#${Date.now().toString().slice(-8)}`;

  // Get current date and time
  const currentDate = new Date().toLocaleString();

  // Get shipping method details
  const getShippingMethodName = () => {
    switch (selectedShipping) {
      case "express":
        return "Express Delivery";
      case "overnight":
        return "Overnight Delivery";
      default:
        return "Standard Delivery";
    }
  };

  const getShippingDescription = () => {
    switch (selectedShipping) {
      case "express":
        return "(Normally 3-4 business days)";
      case "overnight":
        return "(Next business day)";
      default:
        return "(Normally 5-7 business days)";
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid xs={12}>
        <div className="flex items-center flex-col text-center gap-4">
          <Typography variant="h4">Thank You! 😇</Typography>
          <Typography>
            Your order <span className="font-medium text-textPrimary">{orderId}</span> has been placed!
          </Typography>
          <div>
            <Typography>
              We sent an email to <span className="font-medium text-textPrimary">{user?.email || "your email"}</span>{" "}
              with your order confirmation and receipt.
            </Typography>
            <Typography>
              If the email hasn't arrived within two minutes, please check your spam folder to see if the email was
              routed there.
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-time-line text-xl" />
            <Typography>Time placed: {currentDate}</Typography>
          </div>
        </div>
      </Grid>

      <Grid xs={12} lg={8}>
        <div className="border rounded">
          {cartItems?.map((product, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center [&:not(:last-child)]:border-be">
              <img
                width={140}
                height={140}
                alt={product.name}
                src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product?.product?.productFeaturedImage?.filePath}` || "/placeholder.svg?height=140&width=140"}
                className="object-cover rounded-lg m-4"
              />
              <div className="flex justify-between is-full p-5 flex-col sm:flex-row items-center sm:items-start">
                <div className="flex flex-col gap-2 items-center sm:items-start">
                  <Typography className="font-medium" color="text.primary">
                    {product?.isSample ?
                      `${product?.product?.name} (${product?.sampleAttributes?.type} Sample)` :
                      product?.product?.name}
                  </Typography>
                </div>
                <Typography className="font-medium">£{(product.price * product.quantity).toFixed(2)}</Typography>
              </div>
            </div>
          ))}
        </div>
      </Grid>

      <Grid xs={12} lg={4}>
        <div className="border rounded">
          <CardContent className="flex gap-4 flex-col">
            <Typography className="font-medium" color="text.primary">
              Price Details
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Order Total</Typography>
                <Typography>£{orderSummary.subtotal?.toFixed(2) || "0.00"}</Typography>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">Delivery Charges</Typography>
                <div className="flex gap-2">
                  {orderSummary.shipping === 0 ? (
                    <>
                      <Typography className="line-through" color="text.disabled">
                        £5.00
                      </Typography>
                      <Chip variant="tonal" size="small" color="success" label="Free" />
                    </>
                  ) : (
                    <Typography>£{orderSummary.shipping?.toFixed(2) || "0.00"}</Typography>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Typography color="text.primary">VAT ({orderSummary.vatRate || 0}%)</Typography>
                <Typography>£{orderSummary.vat?.toFixed(2) || "0.00"}</Typography>
              </div>
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <Typography className="font-medium" color="text.primary">
                Total
              </Typography>
              <Typography className="font-medium" color="text.primary">
                £{orderSummary.total?.toFixed(2) || "0.00"}
              </Typography>
            </div>
          </CardContent>
        </div>
      </Grid>
    </Grid>
  );
};

export default StepConfirmation;
