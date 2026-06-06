import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "@/shared/api/http-client";
import { inventoryApi } from "@/features/products/api/inventory.api";

vi.mock("@/shared/api/http-client", () => ({
  httpClient: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedHttpClient = vi.mocked(httpClient);

describe("inventoryApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consume los endpoints de lectura de inventario", async () => {
    mockedHttpClient.get.mockResolvedValue({ data: [] });

    await inventoryApi.listGroups();
    await inventoryApi.listCategories();
    await inventoryApi.listProducts();

    expect(mockedHttpClient.get).toHaveBeenNthCalledWith(1, "/groups");
    expect(mockedHttpClient.get).toHaveBeenNthCalledWith(2, "/categories");
    expect(mockedHttpClient.get).toHaveBeenNthCalledWith(3, "/products");
  });

  it("envia los payloads de creacion esperados", async () => {
    mockedHttpClient.post.mockResolvedValue({ data: {} });

    await inventoryApi.createGroup({ groupName: "Moda" });
    await inventoryApi.createCategory({ categoryName: "Blusas", idGroup: 1 });
    await inventoryApi.createProduct({
      idCategory: 2,
      nameProducts: "Blusa negra",
      priceProduct: null,
    });

    expect(mockedHttpClient.post).toHaveBeenNthCalledWith(1, "/groups", {
      groupName: "Moda",
    });
    expect(mockedHttpClient.post).toHaveBeenNthCalledWith(2, "/categories", {
      categoryName: "Blusas",
      idGroup: 1,
    });
    expect(mockedHttpClient.post).toHaveBeenNthCalledWith(3, "/products", {
      idCategory: 2,
      nameProducts: "Blusa negra",
      priceProduct: null,
    });
  });

  it("envia updates y deletes a las rutas correctas", async () => {
    mockedHttpClient.put.mockResolvedValue({ data: {} });
    mockedHttpClient.delete.mockResolvedValue({ data: undefined });

    await inventoryApi.updateGroup(1, { groupName: "Moda actualizada" });
    await inventoryApi.updateCategory(2, { categoryName: "Blusas actualizada" });
    await inventoryApi.updateProduct(3, {
      nameProducts: "Blusa actualizada",
      priceProduct: "399.90",
    });
    await inventoryApi.deleteGroup(1);
    await inventoryApi.deleteCategory(2);
    await inventoryApi.deleteProduct(3);

    expect(mockedHttpClient.put).toHaveBeenNthCalledWith(1, "/groups/1", {
      groupName: "Moda actualizada",
    });
    expect(mockedHttpClient.put).toHaveBeenNthCalledWith(2, "/categories/2", {
      categoryName: "Blusas actualizada",
    });
    expect(mockedHttpClient.put).toHaveBeenNthCalledWith(3, "/products/3", {
      nameProducts: "Blusa actualizada",
      priceProduct: "399.90",
    });
    expect(mockedHttpClient.delete).toHaveBeenNthCalledWith(1, "/groups/1");
    expect(mockedHttpClient.delete).toHaveBeenNthCalledWith(2, "/categories/2");
    expect(mockedHttpClient.delete).toHaveBeenNthCalledWith(3, "/products/3");
  });
});
