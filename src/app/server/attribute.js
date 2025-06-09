'use server'

import { measurementUnit } from "@/services/measurment-units";
import { productAttribute, productAttributeList } from "@/services/productAttribute";

export const getAttributesData = async (currentPage, rowsPerPage, searchTerm, filteredData) => {
     return await productAttributeList.get(currentPage, rowsPerPage, searchTerm, filteredData);
}

export const addAttributesData = async (data) => {
     return await productAttribute.create(data);
}

export const updateAttributesData = async (id, data) => {
     return await productAttribute.update(id, data);
}

export const deleteAttribute = async (id) => {
     return await productAttribute.delete(id);
}

export const updateStatus = async (id, subPath, data) => {
     return await productAttribute.patch(id, subPath, data);
}

export const getAttributesDetails = async (id) => {
     return await productAttribute.getById(id);
}

export const getMeasurementUnits = async (id) => {
     return await measurementUnit.get();
}
