'use server';

import { userRoleServices } from "@/services/user-role";


/** DELETE USER ROLE */
export const deleteUserRole = async (id) => {
    return await userRoleServices.delete(id);
};

/** CREATE USER ROLE */
export const createUserRole = async (data) => {
    return await userRoleServices.create(data);
};

/** USER ROLE STATUS UPDATE */
export const updateUserRoleStatus = async (id, subPath, data) => {
    return await userRoleServices.patch(id, subPath, data);
};

/** GET USER ROLE LIST WITH PAGINATION */
export const getUserRoleList = async (currentPage, rowsPerPage, searchTerm, filter) => {
    return await userRoleServices.get(currentPage, rowsPerPage, searchTerm, filter);
};
