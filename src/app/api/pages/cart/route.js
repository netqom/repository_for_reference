// File: src/app/api/pages/cart/route.js

import { NextResponse } from "next/server";
import { db } from "@/fake-db/pages/cart"; // adjust the path if needed

export async function GET(req) {
  // Get the userId from the query parameters
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  // console.log("userId", userId);

  // Dummy cart data (replace with db if needed)
  const cartItems = db;

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.count,
    0
  );
  const discount = 0;
  const shipping = 20;
  const total = subtotal + shipping - discount;

  // Return JSON response
  return NextResponse.json({
    success: true,
    message: "Cart data retrieved successfully",
    data: {
      userId,
      cartItems,
      orderSummary: {
        subtotal,
        discount,
        shipping,
        total,
      },
    },
  });
}
