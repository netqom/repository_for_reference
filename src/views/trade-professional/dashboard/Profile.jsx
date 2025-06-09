'use client';

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { green, red, orange } from '@mui/material/colors';
import { useSession } from 'next-auth/react';
import { Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';

const Profile = ({ userData }) => {

  // Status mapping logic
  const userStatus = userData?.business?.status;
  const router = useRouter();
  const { lang: locale } = useParams();
  const getStatusProps = status => {
    switch (status) {
      case 1:
        return {
          label: 'Verified',
          color: 'success',
          sx: {
            borderColor: green[500],
            color: green[800],
            backgroundColor: green[50],
            fontWeight: 500
          }
        };
      case 0:
        return {
          label: 'Unverified',
          color: 'error',
          sx: {
            borderColor: red[500],
            color: red[800],
            backgroundColor: red[50],
            fontWeight: 500
          }
        };
      case 2:
      default:
        return {
          label: 'Pending',
          color: 'warning',
          sx: {
            borderColor: orange[500],
            color: orange[800],
            backgroundColor: orange[50],
            fontWeight: 500
          }
        };
    }
  };

  const statusProps = getStatusProps(userStatus);

  return (
    <Card>
      <CardContent className='flex flex-col gap-2 relative items-start'>
        <div>
          <Typography variant='h5'>Welcome back, <strong>{userData?.name}</strong></Typography>
        </div>
        <div>
          <Typography variant='body2'>
            <strong>Email:</strong> {userData?.email || 'Not Available'}
          </Typography>
          <Typography variant='body2'>
            <strong>Phone:</strong> {userData?.phone || 'Not Available'}
          </Typography>
          <div className='mt-1 mb-2'>
            <Box variant='body2'>
              <strong>Business Status:</strong>
              <Chip variant='outlined' size='small' style={{ marginLeft: '6px' }} {...statusProps} />
            </Box>
          </div>
        </div>
        <Button size='small' variant='contained' onClick={() => router.push(`/${locale}/trade-professional/profile`)}>
          View Profile
        </Button>
        <img
          src='/images/avatars/1.png'
          alt='profile image'
          height={102}
          className='absolute inline-end-7 bottom-6 rounded-full'
        />
      </CardContent>
    </Card>
  );
};

export default Profile;
