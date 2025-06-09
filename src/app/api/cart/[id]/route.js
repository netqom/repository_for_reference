import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const cartId = params.id;

    if (!cartId) {
      return NextResponse.json(
        { message: 'Cart ID is required' },
        { status: 400 }
      );
    }

    // Make API call to your backend to delete the cart
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/cart/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete cart');
    }

    return NextResponse.json({ message: 'Cart deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart:', error);
    return NextResponse.json(
      { message: 'Failed to delete cart' },
      { status: 500 }
    );
  }
} 