import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, paymentIntentId, status } = body;

    if (!orderId || !paymentIntentId || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Make API call to your backend to update order status
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/orders/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentIntentId,
        status
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { message: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 