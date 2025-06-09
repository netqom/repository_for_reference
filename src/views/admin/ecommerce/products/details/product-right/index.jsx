'use client';

// React Imports
import { useState } from 'react';

// MUI Imports
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Grid from '@mui/material/Grid2';

// Component Imports
import ProductTabList from '@core/components/mui/TabList';

const ProductRight = ({ tabContentList, statusMap, stockStatusMap }) => {
  // States
  const [activeTab, setActiveTab] = useState('overview');

  const handleChange = (event, value) => {
    setActiveTab(value);
  };

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ProductTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab icon={<i className='ri-user-3-line' />} value='overview' label='Overview' iconPosition='start' />
              <Tab icon={<i className='ri-lock-line' />} value='orders' label='Orders' iconPosition='start' />
              {/* <Tab
                icon={<i className='ri-map-pin-line' />}
                value='addressBilling'
                label='Address & Billing'
                iconPosition='start'
              />
              <Tab
                icon={<i className='ri-notification-2-line' />}
                value='notifications'
                label='Notifications'
                iconPosition='start'
              /> */}
            </ProductTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  );
};

export default ProductRight;
