'use client';

// React Imports
import { useEffect, useRef, useState, useCallback } from 'react';
// MUI Imports
import Backdrop from '@mui/material/Backdrop';
import useMediaQuery from '@mui/material/useMediaQuery';

// Third-party Imports
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

// Slice Imports
import { getActiveUserData, fetchChatData, setChatData } from '@/redux-store/slices/chat'; // Add fetchChatData

// Component Imports
import SidebarLeft from './SidebarLeft';
import ChatContent from './ChatContent';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';
import io from 'socket.io-client';
// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses';
import { useParams, useRouter } from 'next/navigation';
import { getChatMessageForTicket, getRawDataForChat } from '@/app/server/support-ticket-chat';
import { callCommonAction } from '@/redux-store/slices/common';
import { getLocalizedUrl } from '@/utils/i18n';

const ChatWrapper = () => {
  let { id } = useParams();
  const router = useRouter();
  const [ticketId, setTicketId] = useState(id ? id[0] : null);
  const socket = useRef();
  // States
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Refs
  const chatBoxRef = useRef(null);
  const messageInputRef = useRef(null);
  const { lang: locale } = useParams();

  // Hooks
  const { settings } = useSettings();
  const dispatch = useDispatch();
  const chatStore = useSelector(state => state.chatReducer);
  const isBelowLgScreen = useMediaQuery(theme => theme.breakpoints.down('lg'));
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'));
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));


  const fetchChatData = async (currentPage = 1, searchTerm = '') => {
    try {
      dispatch(callCommonAction({ loading: true }));
      const response = await getChatMessageForTicket(ticketId, currentPage, rowsPerPage, searchTerm, {});
      dispatch(callCommonAction({ loading: false }));
      if (response.statusCode === 200 && response.data) {
        const formatted = {
          contacts: response?.data?.docs,
          chats: response?.data?.chats,
          profileUser: response?.data?.profileUser,
        };

        dispatch(setChatData(formatted));
        activeUser(ticketId);
        if (chatStore.activeUser?.id !== null && messageInputRef.current) {
          messageInputRef.current.focus();
        }
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }));
      console.error('Failed to fetch team members', error);
    }
  };


  useEffect(() => {
    fetchChatData();
  }, []);



  useEffect(() => {
    // Initialize socket connection
    socket.current = io(process.env.NEXT_PUBLIC_BACKEND_DOMAIN, {
      transports: ['websocket', 'polling']
    });

    // Clean up on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };


  }, []);

  const handleLoadMore = () => {
    alert('Call Me');
    setPage(page + 1);
    fetchChatData(page + 1);
  };

  // Get active user’s data
  const activeUser = ticketId => {
    if (!socket.current) return;
    router.push(getLocalizedUrl(`/admin/support-tickets/view/${ticketId}`, locale));

    socket.current.emit("join", { ticketId });
    setTicketId(ticketId);
    dispatch(getActiveUserData(ticketId));

    //
  };

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [chatStore.activeUser]);

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen]);

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen]);

  // Close sidebar when backdrop is closed on below md screen
  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen]);

  return (
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered'
      })}
    >
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={activeUser}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        handleLoadMore={handleLoadMore}
      />

      <ChatContent
        chatStore={chatStore}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        ticketId={ticketId}
        socket={socket}

      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  );
};

export default ChatWrapper;
