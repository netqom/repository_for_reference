'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import { useSession } from 'next-auth/react'
import { checkUserRoleIsAdmin } from '@/components/common/userRole'

const UserRight = ({ tabContentList, data }) => {


   const [isAdmin, setIsAdmin] = useState(false)
    const { data: session, status } = useSession()

    useEffect(() => {
      const verifyRole = async () => {
        const isAdminUser = await checkUserRoleIsAdmin()
        if (isAdminUser) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      }

      verifyRole()
    }, [])

  // States
  const [activeTab, setActiveTab] = useState('security')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>

                {/* <Tab icon={<i className='ri-user-3-line' />} value='overview' label='Overview' iconPosition='start' /> */}
                <Tab icon={<i className='ri-lock-line' />} value='security' label='Security' iconPosition='start' />
                {/* <Tab icon={<i className='ri-lock-line' />} value='orders' label='Order History' iconPosition='start' /> */}



            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default UserRight
