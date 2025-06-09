'use client'

import Grid from '@mui/material/Grid2'

// Component Imports
import { useEffect, useRef, useState } from 'react'
import UserDetails from './UserDetails'
import AdminDetails from './AdminDetails'
import { useSession } from 'next-auth/react'
import { checkUserRoleIsAdmin } from '@/components/common/userRole'
const UserLeftOverview = ({ data }) => {
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

  return (
    <>
        {isAdmin && session?.user?._id == data._id ? (
          <AdminDetails data={data} />
        ) : (
          <UserDetails data={data} />
        )}
        </>
  )
}

export default UserLeftOverview
