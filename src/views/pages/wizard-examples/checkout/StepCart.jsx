"use client";

// React Imports
import { useState, useEffect, useContext } from "react";

// Next Imports
import Link from "next/link";

// MUI Imports
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import CircularProgress from "@mui/material/CircularProgress";


// Component Imports
import DirectionalIcon from "@components/DirectionalIcon";

// Context Import
import { CheckoutContext } from "./CheckoutWizard";
import { cartApi } from "@/services/cart/index";
import { removeCartItem, updateCartItem } from "@/app/server/actions";
import { toast } from "react-toastify";

// API Import


const StepCart = ({ handleNext }) => {
  // States
  const [openCollapse, setOpenCollapse] = useState(true);
  const [openFade, setOpenFade] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Context
  const {
    cartItems,
    setCartItems,
    orderSummary,
    setOrderSummary,
    setStepValid,
    loading,
    user,
    adminSettings,
    calculateOrderSummary
  } = useContext(CheckoutContext);

  useEffect(() => {
    if (!openFade) {
      setTimeout(() => {
        setOpenCollapse(false);
      }, 300);
    }
  }, [openFade]);

  // Update cart item quantity
  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    setError("");
    try {
      const response = await updateCartItem(itemId, newQuantity);
      // // console.log(response, 'response updateCartItem');
      if (response.success) {
        const { items, orderSummary: newOrderSummary } = response.data;
        setCartItems(items);
        setOrderSummary(newOrderSummary);
      } else {
        setError(response.message || "Error updating cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setError("Failed to update cart item");
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    setIsUpdating(true);
    setError("");
    try {
      const response = await removeCartItem(itemId);

      if (response.success) {
        const { items, orderSummary: newOrderSummary } = response.data;
        setCartItems(items);
        setOrderSummary(newOrderSummary);
        setStepValid(0, items.length > 0);
      } else {
        setError(response.message || "Error removing item");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item from cart");
    } finally {
      setIsUpdating(false);
    }
  };

  // Move item to wishlist
  const moveToWishlist = async (itemId) => {
    setIsUpdating(true);
    setError("");
    try {
      const response = await cartApi.addToWishlist(itemId);

      if (response.success) {
        // Remove from cart after adding to wishlist
        await removeItem(itemId);
      } else {
        setError(response.message || "Error moving item to wishlist");
      }
    } catch (error) {
      console.error("Error moving item to wishlist:", error);
      setError("Failed to move item to wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setIsUpdating(true);
    setError("");
    try {
      const response = await cartApi.applyPromoCode(couponCode);

      if (response.success) {
        const { orderSummary: newOrderSummary } = response.data;
        setOrderSummary(newOrderSummary);
        setCouponCode("");
        setShowCouponInput(false);
        toast.success("Coupon applied successfully!");
      } else {
        setError(response.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setError("Failed to apply coupon");
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if cart is empty and update validation
  useEffect(() => {
    setStepValid(0, cartItems.length > 0);
  }, [cartItems, setStepValid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }
  // // console.log(JSON.stringify(orderSummary, null, 2), 'orderSummary');
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 8 }} className="flex flex-col gap-4">
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* <Collapse in={openCollapse}>
          <Fade in={openFade} timeout={{ exit: 300 }}>
            <Alert
              icon={<i className="ri-percent-line" />}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpenFade(false)
                  }}
                >
                  <i className="ri-close-line" />
                </IconButton>
              }
            >
              <AlertTitle>Available Offers</AlertTitle>
              <Typography color="success.main">
                - 10% Instant Discount on Bank of America Corp Bank Debit and Credit cards
              </Typography>
              <Typography color="success.main">
                - 25% Cashback Voucher of up to $60 on first ever PayPal transaction. TCA
              </Typography>
            </Alert>
          </Fade>
        </Collapse> */}

        <Typography className="rounded" variant="h5">
          My Shopping Bag ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
        </Typography>

        {cartItems.length === 0 ? (
          <Alert severity="info">Your cart is empty. Please add items to your cart to continue shopping.</Alert>
        ) : (
          <div className="border rounded">
            {cartItems.map((product, index) => (
              <div
                key={product._id || index}
                className="flex flex-col sm:flex-row items-center relative p-5 gap-4 [&:not(:last-child)]:border-be"
              >
                <img
                  height={140}
                  width={140}
                  src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${product?.product?.productFeaturedImage?.filePath}` || "/placeholder.svg?height=140&width=140"}
                  alt={product?.product?.name || 'Product Image'}
                  className="object-cover rounded-lg"
                />
                <IconButton
                  size="small"
                  className="absolute block-start-2 inline-end-2"
                  onClick={() => removeItem(product._id)}
                  disabled={isUpdating}
                >
                  <i className="ri-close-line text-lg" />
                </IconButton>
                <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full">
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <Typography className="font-medium" color="text.primary">
                      {product?.isSample ? 
                        `${product?.product?.name} (${product?.sampleAttributes?.type} Sample)` : 
                        product?.product?.name}
                    </Typography>

                    {/* Variation Details */}
                    <div className="flex flex-col gap-1">
                      <Typography color="text.secondary" className="text-sm">
                        Sold By: {product?.product?.supplier?.companyName || 'N/A'}
                      </Typography>
                      {product?.isSample ? (
                        <>
                          <Typography color="text.secondary" className="text-sm">
                            Sample Type: {product?.sampleAttributes?.type || 'N/A'}
                          </Typography>
                          <Typography color="text.secondary" className="text-sm">
                            Size: {product?.sampleAttributes?.size || 'N/A'}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography color="text.secondary" className="text-sm">
                            Variation: {product?.variation?.description || 'Standard'}
                          </Typography>
                          <Typography color="text.secondary" className="text-sm">
                            Tiles: {product?.numberOfTiles || 0}
                          </Typography>
                          <Typography color="text.secondary" className="text-sm">
                            Pallets: {product?.numberOfPallets || 0}
                          </Typography>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Typography color="text.disabled">Supplier:</Typography>
                        <Typography color="primary.main">
                          {product?.product?.supplier?.companyName || 'N/A'}
                        </Typography>
                      </div>
                      {product?.variation?.stockQuantity > 0 ? (
                        <Chip
                          size="small"
                          variant="tonal"
                          color="success"
                          label={`In Stock (${product.variation.stockQuantity} SQ.M)`}
                        />
                      ) : (
                        <Chip size="small" variant="tonal" color="error" label="Out of Stock" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      {!product?.isSample && (
                        <TextField
                          size="small"
                          type="number"
                          value={product?.quantity || 0}
                          onChange={(e) => updateItemQuantity(product._id, Number(e.target.value))}
                          className="block max-w-[100px]"
                          disabled={isUpdating}
                          inputProps={{ min: 1, step: 1 }}
                          label="SQ.M"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-center mt-4 gap-3 sm:items-end">
                    <div className="flex flex-col items-end">
                      <Typography variant="h6" color="primary.main" className="font-semibold">
                        £{(product?.price || 0).toFixed(2)}/SQ.M
                      </Typography>
                      <Typography color="text.secondary" className="text-sm">
                        Total: £{((product?.price || 0) * (product?.quantity || 0)).toFixed(2)}
                      </Typography>
                      {product?.isCustomPrice && (
                        <Chip
                          size="small"
                          variant="tonal"
                          color="info"
                          label="Custom Price"
                          className="mt-1"
                        />
                      )}
                    </div>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => moveToWishlist(product._id)}
                      disabled={isUpdating}
                      className="mt-2"
                    >
                      Move to wishlist
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Typography
          href="/"
          component={Link}
          onClick={(e) => e.preventDefault()}
          className="flex items-center font-medium justify-between gap-4 plb-2 pli-5 border rounded"
          color="primary.main"
        >
          Add more products from wishlist
          <DirectionalIcon
            ltrIconClass="ri-arrow-right-s-line"
            rtlIconClass="ri-arrow-left-s-line"
            className="text-base"
          />
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} className="flex flex-col gap-2">


        <div className="border rounded">
          <CardContent className="flex gap-4 flex-col">
            <Typography className="font-medium" color="text.primary">
              Price Details
            </Typography>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Typography color="text.primary">Bag Total</Typography>
                <Typography>£{orderSummary.subtotal?.toFixed(2)}</Typography>
              </div>

              {/* <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Typography color="text.primary">Coupon Discount</Typography>
                  {!showCouponInput ? (
                    <Button
                      color="primary"
                      onClick={() => setShowCouponInput(true)}
                      disabled={isUpdating}
                    >
                      Apply Coupon
                    </Button>
                  ) : (
                    <Typography color="success.main">
                      -£{orderSummary.discount?.toFixed(2)}
                    </Typography>
                  )}
                </div>

                {showCouponInput && (
                  <div className="flex gap-2">
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isUpdating}
                    />
                    <Button
                      variant="contained"
                      onClick={handleApplyCoupon}
                      disabled={isUpdating || !couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div> */}

              <div className="flex items-center justify-between">
                <Typography color="text.primary">Shipping Charges</Typography>
                <div className="flex items-center gap-2">
                  {orderSummary.shipping > 0 ? (
                    <Typography>£{orderSummary.shipping?.toFixed(2)}</Typography>
                  ) : (
                    <>
                      <Typography color="text.disabled" className="line-through">
                        £5.00
                      </Typography>
                      <Chip variant="tonal" size="small" color="success" label="Free" />
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Typography color="text.primary">VAT ({orderSummary.vatRate || 0}%)</Typography>
                <Typography>£{orderSummary.vat?.toFixed(2)}</Typography>
              </div>

              {error && (
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}
            </div>
          </CardContent>
          <Divider />
          <CardContent>
            <div className="flex items-center justify-between">
              <Typography className="font-medium" color="text.primary">
                Total Amount
              </Typography>
              <Typography className="font-medium" color="text.primary">
                £{orderSummary.total?.toFixed(2)}
              </Typography>
            </div>
          </CardContent>
        </div>

        <div className="flex justify-normal sm:justify-end xl:justify-normal">
          <Button
            fullWidth
            variant="contained"
            onClick={handleNext}
            disabled={cartItems.length === 0 || isUpdating}
            className="bg-red-800 hover:bg-red-900"
          >
            {isUpdating ? (
              <CircularProgress size={24} />
            ) : (
              <>
                Proceed to Checkout
                <i className="ri-arrow-right-line ml-2"></i>
              </>
            )}
          </Button>
        </div>

      </Grid>
    </Grid>
  );
};

export default StepCart;
