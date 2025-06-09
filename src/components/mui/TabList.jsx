'use client';

import { styled } from '@mui/material/styles';
import TabList from '@mui/lab/TabList';

const CustomTabList = styled(TabList)(({ theme, pill }) => ({
  minHeight: 48,
  marginBottom: theme.spacing(4),
  '& .MuiTabs-indicator': {
    display: pill ? 'none' : 'block',
    backgroundColor: '#991b1b',
  },
  '& .MuiTab-root': {
    minHeight: 48,
    minWidth: 130,
    borderRadius: pill ? '50px' : 0,
    '&.Mui-selected': {
      color: pill ? theme.palette.common.white : '#991b1b',
      backgroundColor: pill ? '#991b1b' : 'transparent',
    },
  },
}));

export default CustomTabList;
