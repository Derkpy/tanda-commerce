import { httpClient } from "@/shared/api/http-client";

export type ProductGroupDto = {
  idGroup: number;
  idBranch: number;
  groupName: string;
};

export type CategoryDto = {
  idCategory: number;
  idGroup: number;
  categoryName: string;
  code: string;
  group?: ProductGroupDto;
};

export type ProductDto = {
  idProduct: number;
  idCategory: number;
  nameProducts: string;
  code: string;
  priceProduct: string | number | null;
  category?: CategoryDto;
};

export type CreateProductInput = {
  idCategory: number;
  nameProducts: string;
  priceProduct?: string | null;
};

export type UpdateProductInput = {
  nameProducts: string;
  priceProduct?: string | null;
};

export const inventoryApi = {
  async listGroups() {
    const response = await httpClient.get<ProductGroupDto[]>("/groups");
    return response.data;
  },

  async createGroup(input: { groupName: string }) {
    const response = await httpClient.post<ProductGroupDto>("/groups", input);
    return response.data;
  },

  async updateGroup(idGroup: number, input: { groupName: string }) {
    const response = await httpClient.put<ProductGroupDto>(`/groups/${idGroup}`, input);
    return response.data;
  },

  async deleteGroup(idGroup: number) {
    await httpClient.delete(`/groups/${idGroup}`);
  },

  async listCategories() {
    const response = await httpClient.get<CategoryDto[]>("/categories");
    return response.data;
  },

  async createCategory(input: { idGroup: number; categoryName: string }) {
    const response = await httpClient.post<CategoryDto>("/categories", input);
    return response.data;
  },

  async updateCategory(idCategory: number, input: { categoryName: string }) {
    const response = await httpClient.put<CategoryDto>(`/categories/${idCategory}`, input);
    return response.data;
  },

  async deleteCategory(idCategory: number) {
    await httpClient.delete(`/categories/${idCategory}`);
  },

  async listProducts() {
    const response = await httpClient.get<ProductDto[]>("/products");
    return response.data;
  },

  async createProduct(input: CreateProductInput) {
    const response = await httpClient.post<ProductDto>("/products", input);
    return response.data;
  },

  async updateProduct(idProduct: number, input: UpdateProductInput) {
    const response = await httpClient.put<ProductDto>(`/products/${idProduct}`, input);
    return response.data;
  },

  async deleteProduct(idProduct: number) {
    await httpClient.delete(`/products/${idProduct}`);
  },
};
