import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateTandaPage } from "@/features/tandas/view/create-tanda-page";
import { createTandaGateway } from "@/features/tandas/data/create-tanda.gateway";

const createTandaGatewayMock = vi.hoisted(() => ({
  create: vi.fn(),
  createClient: vi.fn(),
  findProductByCode: vi.fn(),
  listClients: vi.fn(),
}));

vi.mock("@/features/tandas/data/create-tanda.gateway", () => ({
  createTandaGateway: createTandaGatewayMock,
}));

const mockedCreateTandaGateway = vi.mocked(createTandaGateway);

const client = {
  idBranch: 1,
  idClient: 1,
  name: "Maria Gonzalez",
  statusGlobal: "regular",
  statusSingular: "activo",
};

const product = {
  category: undefined,
  code: "23092",
  idCategory: 2,
  idProduct: 3,
  nameProducts: "Blusa negra",
  priceProduct: "300.00",
};

const newClient = {
  idBranch: 1,
  idClient: 2,
  name: "Derek Perez",
  statusGlobal: null,
  statusSingular: null,
};

describe("CreateTandaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateTandaGateway.listClients.mockResolvedValue([client]);
    mockedCreateTandaGateway.findProductByCode.mockResolvedValue(product);
    mockedCreateTandaGateway.createClient.mockResolvedValue(newClient);
    mockedCreateTandaGateway.create.mockResolvedValue({ jobId: "1", status: "queued" });
  });

  it("bloquea pasos posteriores si el anterior no esta completo, pero permite ver resumen", async () => {
    const user = userEvent.setup();
    render(<CreateTandaPage />);

    await waitFor(() => {
      expect(mockedCreateTandaGateway.listClients).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole("button", { name: "Ingresar producto" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Resumen de la tanda" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Resumen de la tanda" }));

    expect(screen.getByRole("button", { name: "Confirmar tanda" })).toBeDisabled();
  });

  it("añade un cliente nuevo y lo muestra en el buscador del paso uno", async () => {
    const user = userEvent.setup();
    render(<CreateTandaPage />);

    await user.click(await screen.findByRole("button", { name: "Añadir cliente nuevo" }));
    await user.type(screen.getByLabelText("Nombre del cliente"), "Derek Perez");
    await user.click(screen.getByRole("button", { name: "Añadir cliente" }));

    await waitFor(() => {
      expect(mockedCreateTandaGateway.createClient).toHaveBeenCalledWith("Derek Perez");
    });

    expect(await screen.findByRole("button", { name: "Derek Perez" })).toBeVisible();
    expect(screen.getByPlaceholderText("Buscar cliente por nombre")).toHaveValue("Derek Perez");
  });

  it("crea una tanda despues de completar todos los pasos y confirmar", async () => {
    const user = userEvent.setup();
    render(<CreateTandaPage />);

    await user.click(await screen.findByRole("button", { name: "Maria Gonzalez" }));
    await user.type(screen.getByPlaceholderText("Ingresa el ID del producto"), "23092");
    await user.click(screen.getByRole("button", { name: "Añadir" }));
    await waitFor(() => {
      expect(mockedCreateTandaGateway.findProductByCode).toHaveBeenCalledWith("23092");
    });
    await user.click(screen.getByRole("button", { name: "Editar precio" }));
    const priceInput = screen.getByPlaceholderText("Precio");
    await user.clear(priceInput);
    await user.type(priceInput, "450{Enter}");
    expect(screen.queryByPlaceholderText("Precio")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    fireEvent.change(screen.getByPlaceholderText("Ingrese valor"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText("Selecciona frecuencia"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByPlaceholderText("Selecciona una fecha"), {
      target: { value: "2026-07-02" },
    });
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await user.click(screen.getByRole("button", { name: "Confirmar tanda" }));
    await user.click(screen.getByRole("button", { name: "Crear tanda" }));

    await waitFor(() => {
      expect(mockedCreateTandaGateway.create).toHaveBeenCalledWith({
        clientId: 1,
        firstPaymentDate: "2026-07-02",
        paymentCount: 2,
        paymentIntervalDays: 7,
        products: [{ code: "23092", price: 450, quantity: 1 }],
      });
    });
  });
});
