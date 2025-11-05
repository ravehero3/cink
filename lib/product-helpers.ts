import { calculateTotalStock } from './calculate-stock';

export function prepareProductData(data: any): any {
  const productData = { ...data };
  
  if (productData.sizes) {
    productData.totalStock = calculateTotalStock(productData.sizes);
  }
  
  return productData;
}

export async function createProduct(
  prismaClient: any,
  data: any
) {
  return await prismaClient.product.create({
    data: prepareProductData(data),
  });
}

export async function updateProduct(
  prismaClient: any,
  id: string,
  data: any
) {
  return await prismaClient.product.update({
    where: { id },
    data: prepareProductData(data),
  });
}
