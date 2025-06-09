'use server'

// Data Imports
import { supplierService } from '@/services/supplier';
import SupplierList from '@/views/admin/supplier/list';

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

export async function fetchSupplierList(currentPage = 1, rowsPerPage = 10, searchTerm = '', filteredData = null) {
  try {
    return await supplierService.get(currentPage, rowsPerPage, searchTerm, filteredData);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};

export async function fetchSupplierById(id) {
  try {
    return await supplierService.getById(id);
  } catch (error) {
    console.error('Failed to fetch Supplier', error);
  }
};

export async function updateSupplier(id, finalPayload) {
  try {
    return await supplierService.update(id, finalPayload);
  } catch (error) {
    console.error('Failed to update Supplier', error);
  }
};

export async function createSupplier(finalPayload) {
  try {
    return await supplierService.create(finalPayload);
  } catch (error) {
    console.error('Failed to create Supplier', error);
  }
};

export async function deleteTeamMember(id) {
  try {
    return await supplierService.delete(id);
  } catch (error) {
    console.error('Error deleting team member:', error);
    return { success: false };
  }
}
export async function updateStatus(id, data) {
  // console.log(id, data);
  try {
    return await supplierService.updateStatus(id, data);
  } catch (error) {
    console.error('Error updating Status:', error);
    return { success: false };
  }
}

const SupplierListApp = async () => {

  const initialData = await fetchSupplierList();
  return <SupplierList
    initialData={initialData}
    fetchSupplierList={fetchSupplierList}
    deleteTeamMember={deleteTeamMember}
    updateStatus={updateStatus}
  />
}

export default SupplierListApp
