import { httpClient } from "@/shared/api/http-client";

export type ClientDto = {
  idClient: number;
  idBranch: number;
  name: string;
  statusSingular: string | null;
  statusGlobal: string | null;
};

export type TandaCatalogProductDto = {
  idProduct: number;
  idCategory: number;
  nameProducts: string;
  code: string;
  priceProduct: string | number | null;
};

export type CreateTandaProductInput = {
  code: string;
  quantity: number;
  price: number;
};

export type CreateTandaInput = {
  clientId: number;
  products: CreateTandaProductInput[];
  paymentCount: number;
  paymentIntervalDays: number;
  firstPaymentDate: string;
};

export type CreateTandaJobDto = {
  jobId: string;
  status: "queued";
};

export const createTandaGateway = {
  async listClients() {
    const response = await httpClient.get<ClientDto[]>("/clients");
    return response.data;
  },

  async createClient(name: string) {
    const response = await httpClient.post<ClientDto>("/clients", { name });
    return response.data;
  },

  async findProductByCode(code: string) {
    const response = await httpClient.get<TandaCatalogProductDto>(
      `/products/code/${encodeURIComponent(code)}`,
    );
    return response.data;
  },

  async create(input: CreateTandaInput) {
    const response = await httpClient.post<CreateTandaJobDto>("/tandas/build", input);
    return response.data;
  },
};
