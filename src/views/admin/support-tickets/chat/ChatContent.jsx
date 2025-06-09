// React Imports
import { useEffect, useState, useRef } from 'react';

// MUI Imports
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';

// Component Imports
import OptionMenu from '@core/components/option-menu';
import AvatarWithBadge from './AvatarWithBadge';
import { statusObj } from './SidebarLeft';
import ChatLog from './ChatLog';
import SendMsgForm from './SendMsgForm';
import UserProfileRight from './UserProfileRight';
import CustomAvatar from '@core/components/mui/Avatar';
// Slice Imports
import { sendMsg } from '@/redux-store/slices/chat';
import { Box } from '@mui/material';

// Renders the user avatar with badge and user information
const UserAvatar = ({ activeUser, setUserProfileLeftOpen, setBackdropOpen }) => (
  <div
    className='flex items-center gap-4 cursor-pointer'
    onClick={() => {
      setUserProfileLeftOpen(true);
      setBackdropOpen(true);
    }}
  >
    <AvatarWithBadge
      alt={activeUser?.fullName}
      src={activeUser?.avatar}
      color={activeUser?.avatarColor}
      badgeColor={statusObj[activeUser?.status || 'offline']}
    />
    <div>
      <Typography color='text.primary'>{activeUser?.fullName}</Typography>
      <Typography variant='body2'>{activeUser?.role}</Typography>
    </div>
  </div>
);

const ChatContent = props => {

  // Props
  const {
    chatStore,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    setSidebarOpen,
    isBelowMdScreen,
    isBelowSmScreen,
    isBelowLgScreen,
    messageInputRef,
    socket
  } = props;

  const { activeUser } = chatStore;
  // States
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false);

  // useEffect(() => {
  //   if (!socket.current) return;
  //   // Listen for incoming messages
  //   socket.current.on('receiveMessage', (data) => {
  //     // console.log('Received message:', JSON.parse(data));
  //     const parseData = JSON.parse(data);
  //     // Update your chat store with the new message
  //     dispatch(sendMsg({ msg: parseData?.message }));
  //   });


  // }, [socket]);

  useEffect(() => {
    if (!socket.current) return;

    const handleReceiveMessage = (data) => {
      try {
        const parseData = typeof data === 'string' ? JSON.parse(data) : data;
        // console.log('Received message:', parseData);
        dispatch(sendMsg({ data: parseData }));
      } catch (error) {
        console.error('Failed to parse received message:', error);
      }
    };

    socket.current.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.current.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket.current, dispatch]);

  // useEffect(() => {
  //   if (!socket.current) return;
  //   // console.log('saxxxx');
  //   const handleReceiveMessage = (data) => {
  //     try {
  //       const parseData = typeof data === 'string' ? JSON.parse(data) : data;
  //       // console.log('Received message:', parseData);
  //       dispatch(sendMsg({ msg: parseData?.message }));
  //     } catch (error) {
  //       console.error('Failed to parse received message:', error);
  //     }
  //   };

  //   socket.current.on('receiveMessage', handleReceiveMessage);

  //   // Cleanup to prevent duplicate listeners
  //   return () => {
  //     socket.current.off('receiveMessage', handleReceiveMessage);
  //   };
  // }, [socket, dispatch]);

  const sendMessage = (messageContent) => {
    if (!socket.current) return;
    //let tId = props.ticketId;
    // console.log('chatStore.profileUser?.id', chatStore.profileUser?.id, chatStore.activeUser?.id);

    const messageData = {
      content: messageContent,
      senderId: chatStore.profileUser?.id,
      receiverId: chatStore.activeUser?.id,
      timestamp: new Date(),
      ticketId: props.ticketId
    };
    let ticketId = messageData.ticketId;


    socket.current.emit("join", { ticketId });
    // Emit the message to the server
    socket.current.emit('sendMessage', JSON.stringify(messageData));
  };

  // Close user profile right drawer if backdrop is closed and user profile right drawer is open
  useEffect(() => {
    if (!backdropOpen && userProfileRightOpen) {
      setUserProfileRightOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen]);

  return !chatStore.activeUser ? (
    <CardContent className='flex flex-col flex-auto items-center justify-center bs-full gap-[18px] bg-[var(--mui-palette-customColors-chatBg)]'>
      <CustomAvatar variant='circular' size={98} color='primary' skin='light'>
        <i className='ri-wechat-line text-[50px]' />
      </CustomAvatar>
      <Typography className='text-center'>Select a contact to start a conversation.</Typography>
      {isBelowMdScreen && (
        <Button
          variant='contained'
          className='rounded-full'
          onClick={() => {
            setSidebarOpen(true);
            isBelowSmScreen ? setBackdropOpen(false) : setBackdropOpen(true);
          }}
        >
          Select Contact
        </Button>
      )}
    </CardContent>
  ) : (
    <>
      {activeUser && (
        <div className='flex flex-col flex-grow bs-full'>
          <div className='flex items-center justify-between border-be plb-[17px] pli-5 bg-[var(--mui-palette-customColors-chatBg)]'>
            {isBelowMdScreen ? (
              <div className='flex items-center gap-4'>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSidebarOpen(true);
                    setBackdropOpen(true);
                  }}
                >
                  <i className='ri-menu-line text-textSecondary' />
                </IconButton>
                <UserAvatar
                  activeUser={activeUser}
                  setBackdropOpen={setBackdropOpen}
                  setUserProfileLeftOpen={setUserProfileRightOpen}
                />
              </div>
            ) : (
              <UserAvatar
                activeUser={activeUser}
                setBackdropOpen={setBackdropOpen}
                setUserProfileLeftOpen={setUserProfileRightOpen}
              />
            )}
            {/* {isBelowMdScreen ? (
              <OptionMenu
                iconClassName='text-textSecondary'
                options={[
                  {
                    text: 'View Contact',
                    menuItemProps: {
                      onClick: () => {
                        setUserProfileRightOpen(true);
                        setBackdropOpen(true);
                      }
                    }
                  },
                  'Mute Notifications',
                  'Block Contact',
                  'Clear Chat',
                  'Block'
                ]}
              />
            ) : (
              <div className='flex items-center gap-1'>
                <IconButton size='small'>
                  <i className='ri-phone-line text-textSecondary' />
                </IconButton>
                <IconButton size='small'>
                  <i className='ri-video-add-line text-textSecondary' />
                </IconButton>
                <IconButton size='small'>
                  <i className='ri-search-line text-textSecondary' />
                </IconButton>
                <OptionMenu
                  iconClassName='text-textSecondary'
                  options={[
                    {
                      text: 'View Contact',
                      menuItemProps: {
                        onClick: () => {
                          setUserProfileRightOpen(true);
                          setBackdropOpen(true);
                        }
                      }
                    },
                    'Mute Notifications',
                    'Block Contact',
                    'Clear Chat',
                    'Block'
                  ]}
                />
              </div>
            )} */}
          </div>



          <ChatLog
            chatStore={chatStore}
            isBelowMdScreen={isBelowMdScreen}
            isBelowSmScreen={isBelowSmScreen}
            isBelowLgScreen={isBelowLgScreen}
          />

          <SendMsgForm
            dispatch={dispatch}
            activeUser={activeUser}
            isBelowSmScreen={isBelowSmScreen}
            messageInputRef={messageInputRef}
            sendMessage={sendMessage}
          />
        </div>
      )}

      {activeUser && (
        <UserProfileRight
          open={userProfileRightOpen}
          handleClose={() => {
            setUserProfileRightOpen(false);
            setBackdropOpen(false);
          }}
          activeUser={activeUser}
          isBelowSmScreen={isBelowSmScreen}
          isBelowLgScreen={isBelowLgScreen}
        />
      )}
    </>
  );
};

export default ChatContent;
