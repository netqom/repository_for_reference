// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'
import commonReducer from '@/redux-store/slices/common'
import cartReducer from '@/redux-store/slices/cart'

export const store = configureStore({
  reducer: {
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    commonReducer,
    cartReducer

  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})
