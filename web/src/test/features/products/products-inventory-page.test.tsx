import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductsInventoryPage } from "@/features/products/view/products-inventory-page";
import { inventoryApi } from "@/features/products/api/inventory.api";

const inventoryApiMock = vi.hoisted(() => ({
  createCategory: vi.fn(),
  createGroup: vi.fn(),
  createProduct: vi.fn(),
  deleteCategory: vi.fn(),
  deleteGroup: vi.fn(),
  deleteProduct: vi.fn(),
  listCategories: vi.fn(),
  listGroups: vi.fn(),
  listProducts: vi.fn(),
  updateCategory: vi.fn(),
  updateGroup: vi.fn(),
  updateProduct: vi.fn(),
}));

vi.mock("@/features/products/api/inventory.api", () => ({
  inventoryApi: inventoryApiMock,
}));

const mockedInventoryApi = vi.mocked(inventoryApi);

const group = {
  groupName: "Moda",
  idBranch: 1,
  idGroup: 1,
};

const category = {
  categoryName: "Blusas",
  code: "1201",
  group,
  idCategory: 2,
  idGroup: 1,
};

const product = {
  category,
  code: "23092",
  idCategory: 2,
  idProduct: 3,
  nameProducts: "Blusa negra",
  priceProduct: "299.90",
};

describe("ProductsInventoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedInventoryApi.listGroups.mockResolvedValue([]);
    mockedInventoryApi.listCategories.mockResolvedValue([]);
    mockedInventoryApi.listProducts.mockResolvedValue([]);
    mockedInventoryApi.createGroup.mockResolvedValue(group);
    mockedInventoryApi.createCategory.mockResolvedValue(category);
    mockedInventoryApi.createProduct.mockResolvedValue(product);
  });

  it("carga las tres tablas de inventario", async () => {
    render(<ProductsInventoryPage />);

    await waitFor(() => {
      expect(mockedInventoryApi.listGroups).toHaveBeenCalledTimes(1);
      expect(mockedInventoryApi.listCategories).toHaveBeenCalledTimes(1);
      expect(mockedInventoryApi.listProducts).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole("button", { name: "Añadir Categorias" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Añadir Productos" })).toBeDisabled();
  });

  it("crea un grupo, recarga y habilita categorias", async () => {
    const user = userEvent.setup();
    mockedInventoryApi.listGroups
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([group]);

    render(<ProductsInventoryPage />);

    await user.click(await screen.findByRole("button", { name: "Añadir Grupos" }));
    await user.type(screen.getByLabelText("Nombre"), "Moda");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(mockedInventoryApi.createGroup).toHaveBeenCalledWith({ groupName: "Moda" });
      expect(mockedInventoryApi.listGroups).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Moda")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir Categorias" })).toBeEnabled();
  });

  it("crea una categoria con el grupo seleccionado y habilita productos", async () => {
    const user = userEvent.setup();
    mockedInventoryApi.listGroups.mockResolvedValue([group]);
    mockedInventoryApi.listCategories
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([category]);

    render(<ProductsInventoryPage />);

    await user.click(await screen.findByRole("button", { name: "Añadir Categorias" }));
    await user.type(screen.getByLabelText("Nombre"), "Blusas");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(mockedInventoryApi.createCategory).toHaveBeenCalledWith({
        categoryName: "Blusas",
        idGroup: 1,
      });
      expect(mockedInventoryApi.listCategories).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Blusas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir Productos" })).toBeEnabled();
  });

  it("crea un producto con categoria, nombre y precio opcional", async () => {
    const user = userEvent.setup();
    mockedInventoryApi.listGroups.mockResolvedValue([group]);
    mockedInventoryApi.listCategories.mockResolvedValue([category]);
    mockedInventoryApi.listProducts
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([product]);

    render(<ProductsInventoryPage />);

    await user.click(await screen.findByRole("button", { name: "Añadir Productos" }));
    await user.type(screen.getByLabelText("Nombre"), "Blusa negra");
    await user.type(screen.getByLabelText("Precio"), "299.90");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(mockedInventoryApi.createProduct).toHaveBeenCalledWith({
        idCategory: 2,
        nameProducts: "Blusa negra",
        priceProduct: "299.90",
      });
      expect(mockedInventoryApi.listProducts).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Blusa negra")).toBeInTheDocument();
    expect(screen.getByText("23092")).toBeInTheDocument();
  });

  it("elimina un grupo solo despues de advertencia y confirmacion por nombre", async () => {
    const user = userEvent.setup();
    mockedInventoryApi.listGroups
      .mockResolvedValueOnce([group])
      .mockResolvedValueOnce([]);
    mockedInventoryApi.listCategories.mockResolvedValue([category]);
    mockedInventoryApi.listProducts.mockResolvedValue([product]);
    mockedInventoryApi.deleteGroup.mockResolvedValue(undefined);

    render(<ProductsInventoryPage />);

    await user.click(await screen.findByText("Moda"));
    await user.click(screen.getByRole("button", { name: "Eliminar Grupos" }));

    expect(screen.getByText("Advertencia de eliminacion")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const deleteButton = screen.getByRole("button", { name: "Eliminar" });
    expect(deleteButton).toBeDisabled();

    await user.type(screen.getByLabelText("Nombre del grupo"), "Moda");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedInventoryApi.deleteGroup).toHaveBeenCalledWith(1);
      expect(mockedInventoryApi.listGroups).toHaveBeenCalledTimes(2);
    });
  });

  it("elimina una categoria despues de advertencia y confirmacion simple", async () => {
    const user = userEvent.setup();
    mockedInventoryApi.listGroups.mockResolvedValue([group]);
    mockedInventoryApi.listCategories
      .mockResolvedValueOnce([category])
      .mockResolvedValueOnce([]);
    mockedInventoryApi.listProducts.mockResolvedValue([product]);
    mockedInventoryApi.deleteCategory.mockResolvedValue(undefined);

    render(<ProductsInventoryPage />);

    await user.click(await screen.findByText("Blusas"));
    await user.click(screen.getByRole("button", { name: "Eliminar Categorias" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getAllByText("Blusas").some((element) =>
      element.classList.contains("text-rose-300"),
    )).toBe(true);
    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(mockedInventoryApi.deleteCategory).toHaveBeenCalledWith(2);
      expect(mockedInventoryApi.listCategories).toHaveBeenCalledTimes(2);
    });
  });

  it("elimina un producto con confirmacion directa", async () => {
    const user = userEvent.setup();
    mockedInventoryApi.listGroups.mockResolvedValue([group]);
    mockedInventoryApi.listCategories.mockResolvedValue([category]);
    mockedInventoryApi.listProducts
      .mockResolvedValueOnce([product])
      .mockResolvedValueOnce([]);
    mockedInventoryApi.deleteProduct.mockResolvedValue(undefined);

    render(<ProductsInventoryPage />);

    await user.click(await screen.findByText("Blusa negra"));
    await user.click(screen.getByRole("button", { name: "Eliminar Productos" }));

    expect(screen.queryByText("Advertencia de eliminacion")).not.toBeInTheDocument();
    expect(screen.getByText("¿Desea eliminar Blusa negra del inventario?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(mockedInventoryApi.deleteProduct).toHaveBeenCalledWith(3);
      expect(mockedInventoryApi.listProducts).toHaveBeenCalledTimes(2);
    });
  });
});
