'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Box,
  FormControlLabel,
  FormGroup,
  Switch,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';

import ConfirmationDialog from '@components/dialogs/confirmation-dialog';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import CustomAvatar from '@core/components/mui/Avatar';
import { updateStatus } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/list/page';
import { toast } from 'react-toastify';
import AlertDialog from '@/components/common/AlertDialog';
import EditUserInfo from './editUserInfo';
import { fetchById } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page';
import { updateBusinessStatus, updateProfile } from '@/app/server/trade-professional';
import { checkUserRoleIsAdmin } from '@/components/common/userRole';
import { useSession } from "next-auth/react"

const UserDetails = ({ data }) => {
  const [userData, setUserData] = useState(data ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userStatus, setUserStatus] = useState(userData.status == 1);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // for edit menu anchor
  const inputFileRef = useRef(null);
  const { data: session, status } = useSession()
  // console.log('session', session);
  // console.log('userData', userData);


  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyRole = async () => {
      const isAdminUser = await checkUserRoleIsAdmin();
      if (isAdminUser) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    verifyRole();
  }, []);


  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  });

  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    confirmText: 'Yes',
    cancelText: 'No',
    confirmColor: 'success',
    cancelColor: 'inherit',
    onConfirm: null
  });

  const roleName = userData.roles?.[0]?.name || 'Unknown';

  const handleBusiness = async (status, reasonText = '') => {
    // If rejecting and no reason is provided, do not proceed
    if (status === 0 && !reasonText.trim()) {
      toast.error('Rejection reason is required.');
      return; // Prevent request and dialog close
    }

    // setIsLoading(true)

    const requestData = {
      reason: status === 0 ? reasonText : null,
      email: userData.email,
      name: userData.name,
      userRole: userData.roles?.[0]?.name || 'Unknown',
      status
    };

    try {
      const response = await updateBusinessStatus(userData?.business?._id, 'status', requestData);
      toast.success(`User ${status === 3 ? 'approved' : 'rejected'} successfully.`);
      refreshUserDetails(userData._id);
      setDialogOpen(false);
      setRejectionReasonText(''); // Clear input after success
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${status === 3 ? 'approve' : 'reject'} user. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmationDialog = ({
    title,
    description,
    confirmText,
    cancelText,
    confirmColor,
    cancelColor,
    status,
    showInput = false
  }) => {
    setShowInput(showInput);
    setDialogConfig({
      title,
      description,
      confirmText,
      cancelText,
      confirmColor,
      cancelColor,
      onConfirm: reason => handleBusiness(status, reason)
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    if (refresh) {
      refreshUserDetails(userData._id);
    }
  }, [refresh]);

  const refreshUserDetails = async userId => {
    const updatedResult = await fetchById(userId);
    setUserData(updatedResult?.data ?? []);
    setRefresh(false);
  };

  // Handle clicking edit icon
  const handleEditIconClick = event => {
    setAnchorEl(event.currentTarget);
  };

  // Close menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Remove image handler
  const handleRemoveImage = async () => {
    setIsLoading(true); // Show loading indicator

    try {
      // Create FormData without attaching a file
      const formData = new FormData();
      formData.append('userImage', ''); // This assumes your backend will interpret this as a remove request

      // Call the same updateProfile endpoint to clear the image
      const response = await updateProfile(userData._id, formData);

      if (response.success) {
        toast.success('Image removed successfully');
        // Clear userImage from local state
        setUserData(prevUserData => ({ ...prevUserData, userImage: '' }));
      }
    } catch (error) {
      toast.error('Failed to remove image');
      console.error(error);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Trigger hidden file input on update image click
  const handleUpdateImageClick = () => {
    handleMenuClose();
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleFileChange = async event => {
    const file = event.target.files?.[0]; // Get the selected file
    if (!file) return;

    setIsLoading(true); // Show loading indicator

    try {
      // Create FormData and append the file with key 'userImage'
      const formData = new FormData();
      formData.append('userImage', file);

      // Upload the formData to backend, assuming uploadUserImage handles FormData correctly
      const response = await updateProfile(userData._id, formData);

      if (response.success) {
        toast.success('Image updated successfully');
        setUserData(prevUserData => ({ ...prevUserData, userImage: response.data.userImage }));
      }
    } catch (error) {
      toast.error('Failed to update image');
      console.error(error);
    } finally {
      setIsLoading(false); // Hide loading indicator
      event.target.value = ''; // Reset file input for future uploads
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return { label: 'Approved', color: 'success' };
      case 0:
        return { label: 'Rejected', color: 'error' };
      case 2:
      default:
        return { label: 'Pending', color: 'warning' };
    }
  };

  const statusDetails = getStatusLabel(userData?.business?.status);

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        {/* User info */}
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-center flex-col gap-4'>
            {/* <CustomAvatar alt='user-profile' src='/images/avatars/1.png' variant='rounded' size={120} /> */}
            {/* Avatar with edit icon and loading */}
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                margin: 'auto',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              {/* Avatar */}
              <CustomAvatar
                alt='user-profile'
                src={
                  userData.userImage
                    ? `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${userData.userImage}`
                    : '/images/avatars/1.png'
                }
                variant='rounded'
                size={120}
              />

              {/* Loading spinner overlay */}
              {isLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              {/* Edit Icon button */}
              {!isLoading && (
                <>
                  <IconButton
                    aria-label='edit avatar'
                    size='small'
                    onClick={handleEditIconClick}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': {
                        bgcolor: '#891815',
                        '& i': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <i className='ri-add-line text-lg'></i>
                  </IconButton>
                </>
              )}
            </Box>

            {/* Hidden file input */}
            <input
              type='file'
              accept='image/*'
              ref={inputFileRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Menu for Remove / Update */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleRemoveImage}>Remove Image</MenuItem>
              <MenuItem onClick={handleUpdateImageClick}>Update Image</MenuItem>
            </Menu>
            <Typography variant='h5'>{userData.name}</Typography>
            <Chip label={roleName} color='error' size='small' variant='tonal' />
          </div>
        </div>

        {/* Details */}
        <div>
          <Typography variant='h5'>Details</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            {[
              ['Email', userData.email],
              ['Phone', userData.phone],
              ['Status', userData.status === 0 ? 'Inactive' : userData.status === 1 ? 'Active' : userData.status === 2 ? 'Pending' : 'Unknown'],
              ['Role', roleName]
            ].map(([label, value]) => (
              <div key={label} className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {label}:
                </Typography>
                <Typography>{value || 'N/A'}</Typography>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Typography variant='h5'>Address</Typography>
          <Divider className='mlb-4' />
          <div className='flex flex-col gap-2'>
            {[
              [
                'Address',
                [userData.addresses?.addressLine1, userData.addresses?.addressLine2].filter(Boolean).join(', ')
              ],
              ['City', userData.addresses?.city],
              ['State', userData.addresses?.state],
              ['Postal Code', userData.addresses?.postalCode],
              ['Country', userData.addresses?.country]
            ].map(([label, value]) => (
              <div key={label} className='flex items-center flex-wrap gap-x-1.5'>
                <Typography className='font-medium' color='text.primary'>
                  {label}:
                </Typography>
                <Typography>{value || 'N/A'}</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Business Info */}
        {userData.business && (
          <div>
            <Typography variant='h5'>Business Info</Typography>
            <Divider className='mlb-4' />
            <div className='flex flex-col gap-2'>
              {[
                ['Business Name', userData.business.name],
                ['Business Email', userData.business.email],
                ['Business Phone', userData.business.phone]
              ].map(([label, value]) => (
                <div key={label} className='flex items-center flex-wrap gap-x-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    {label}:
                  </Typography>
                  <Typography>{value || 'N/A'}</Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* <Chip label='Status Disabled' color='error' size='small' variant='tonal' /> */}

      </CardContent>
    </Card>
  );
};

export default UserDetails;
