import { createSlice } from '@reduxjs/toolkit';

const initialState = { loading: false, contentLoading: false };

export const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        callCommonAction: (state, action) => {
            return state = { ...state, ...action.payload };
        },
    }
});

// Action creators are generated for each case reducer function
export const { callCommonAction } = commonSlice.actions;

export default commonSlice.reducer;