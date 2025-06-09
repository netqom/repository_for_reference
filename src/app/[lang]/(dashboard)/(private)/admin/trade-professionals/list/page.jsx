'use server'

import { tradeProfessionalService } from '@/services/trade-professionals';
// Data Imports

import TradeProfessionalsList from '@/views/admin/trade-professionals/list';

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/user-list` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
/* const getUserData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/user-list`)

  if (!res.ok) {
    throw new Error('Failed to fetch userData')
  }

  return res.json()
} */

export async function fetchList (currentPage = 1,rowsPerPage = 10, searchTerm = '', filteredData=null) {
  try {
    return await tradeProfessionalService.get(currentPage, rowsPerPage, searchTerm, filteredData);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};


export async function updateStatus(id, subPath, data) {
  try {
    return await tradeProfessionalService.patch(id, subPath, data);
  } catch (error) {
    console.error('Error updating Status:', error);
    return { success: false };
  }
}

// export async function createSupplier (finalPayload) {
//   try {
//     return await tradeProfessionalService.create(finalPayload);
//   } catch (error) {
//     console.error('Failed to create Supplier', error);
//   }
// };

export async function deleteRecord(id) {
  try {
    return await tradeProfessionalService.delete(id);
  } catch (error) {
    console.error('Error deleting team member:', error);
    return { success: false };
  }
}

const TradeProfessionals = async () => {

  return <TradeProfessionalsList
          fetchList={fetchList}
          deleteRecord={deleteRecord}
          updateStatus={updateStatus}
        />
}

export default TradeProfessionals
