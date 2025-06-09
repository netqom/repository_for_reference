'use server'

import { categoryService } from '@/services/category';
import CategoryList from '@/views/admin/ecommerce/products/category/list';

export async function fetchCategoryList (currentPage = 1,rowsPerPage = 10, searchTerm = '', filteredData=null) {
  try {
    return await categoryService.get(currentPage, rowsPerPage, searchTerm, filteredData);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};
export async function getAllCategory () {
  try {
    return await categoryService.getAll();
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};
export async function updateCategoryStatus (id, newStatus) {
  try {
    return await categoryService.updateStatus(id, newStatus);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};

export async function deleteCategory(selectedCatId) {
  try {
    return await categoryService.delete(selectedCatId);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};

export async function updateCategory(id, data) {
  try {
    return await categoryService.update(id, data);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};
export async function createCategory(data) {
  try {
    return await categoryService.create(data);
  } catch (error) {
    console.error('Failed to fetch Supplier List', error);
  }
};


const CategoryListApp = async () => {
  return <CategoryList
          fetchCategoryList = {fetchCategoryList}
          deleteCategory={deleteCategory}
          updateCategoryStatus={updateCategoryStatus}
        />;
};

export default CategoryListApp;
