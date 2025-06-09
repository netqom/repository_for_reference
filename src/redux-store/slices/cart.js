// Third-party Imports

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: null
};
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getCart(userId); // adjust to match your API
      return response; // Should return { items: [...], totalItems, totalAmount }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {

    addToCart: (state, action) => {
        const newItem = action.payload;

        // console.log(newItem,'chek');


        const existingItem = state.items.find(item => item.productId === newItem.productId && item.variationId === newItem.variationId);

        if (existingItem) {
          // If adding more of the same variation, update quantity and totalPrice
          existingItem.quantity += newItem.quantity;
          existingItem.totalPrice = existingItem.quantity * existingItem.price;
        } else {
          // Add as new item
          state.items.push({
            ...newItem,
            totalPrice: newItem.quantity * newItem.price
          });
        }

        // Recalculate totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
      },

    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      const itemToRemove = state.items.find(item => item.id === productId);

      if (itemToRemove) {
        state.totalItems -= itemToRemove.quantity;
        state.totalAmount -= itemToRemove.totalPrice;
        state.items = state.items.filter(item => item.id !== productId);
      }
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.id === productId);

      if (item) {
        const quantityDifference = quantity - item.quantity;
        item.quantity = quantity;
        item.totalPrice = item.price * quantity;

        state.totalItems += quantityDifference;
        state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || []; // ensure safe fallback
        state.totalItems = action.payload.totalItems || 0;
        state.totalAmount = action.payload.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load cart';
      });
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  setError
} = cartSlice.actions;

export default cartSlice.reducer;
