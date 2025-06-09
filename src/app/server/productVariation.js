'use server';

import { productVariation } from "@/services/productVariant";



export const deleteProductVariation = async (id) => {
     return await productVariation.delete(id);
};
