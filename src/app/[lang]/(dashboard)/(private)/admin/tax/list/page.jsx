'use server'

import { taxService } from '@/services/tax';
import TaxManagementList from '@/views/admin/tax/list';

export async function fetchTaxs (currentPage = 1,rowsPerPage = 10, searchTerm = '', filteredData=null) {
  try {
    return await taxService.get(currentPage, rowsPerPage, searchTerm, filteredData);
  } catch (error) {
    console.error('Failed to fetch Supplier', error);
  }
};

export async function updateTax (id, finalPayload) {
  try {
    return await taxService.update(id, finalPayload);
  } catch (error) {
    console.error('Failed to update Supplier', error);
  }
};

export async function createTax (finalPayload) {
  try {
    return await taxService.create(finalPayload);
  } catch (error) {
    console.error('Failed to create Supplier', error);
  }
};

export async function updateStatus (id, newStatus) {
  try {
    return await taxService.updateStatus(id, newStatus);
  } catch (error) {
    console.error('Failed to create Supplier', error);
  }
};




const TaxManagementApp = async () => {
  return <TaxManagementList
            fetchTaxs={fetchTaxs}
            updateStatus={updateStatus}
      />;
};

export default TaxManagementApp;
