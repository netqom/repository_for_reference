// Third-party Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Data Imports
import { db } from '@/fake-db/apps/chat';

const initialState = {
  contacts: [],
  chats: [],
  activeUser: null,
  profileUser: {},
  loading: false,
  error: null
};



export const chatSlice = createSlice({
  name: 'chat',
  //initialState: db,
  initialState,
  reducers: {
    setChatData: (state, action) => {
      // console.log(action.payload, 'action.payload');
      state.contacts = action.payload.contacts;
      state.chats = action.payload.chats;
      state.profileUser = action.payload.profileUser;
    },
    getActiveUserData: (state, action) => {

      const activeUser = state.contacts.find(user => user.id === action.payload);
      const chat = state.chats.find(chat => chat.userId === action.payload);
      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0;
      }
      if (activeUser) {
        state.activeUser = activeUser;
      }
    },
    addNewChat: (state, action) => {
      const { id } = action.payload;
      state.contacts.find(contact => {
        if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
          state.chats.unshift({
            id: state.chats.length + 1,
            userId: contact.id,
            unseenMsgs: 0,
            chat: []
          });
        }
      });
    },
    setUserStatus: (state, action) => {
      state.profileUser = {
        ...state.profileUser,
        status: action.payload.status
      };
    },
    sendMsg: (state, action) => {
      const { data } = action.payload;
      const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id);

      if (existingChat) {
        existingChat.chat.push({
          message: data.message,
          time: new Date(),
          senderId: data.sender,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        });

        // Increment unseenMsgs
    // if (typeof existingChat.unseenMsgs === 'number') {
    //   existingChat.unseenMsgs += 1;
    // } else {
    //   existingChat.unseenMsgs = 1;
    // }

        // Remove the chat from its current position
        state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id);

        // Add the chat back to the beginning of the array
        state.chats.unshift(existingChat);
      }
    }
  }
});
export const { getActiveUserData, addNewChat, setUserStatus, sendMsg, setChatData } = chatSlice.actions;
export default chatSlice.reducer;
