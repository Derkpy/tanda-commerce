import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { t } from "@/shared/lib/i18n";
import {
  createTandaGateway,
  type ClientDto,
  type CreateTandaInput,
} from "../data/create-tanda.gateway";

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export type TandaProductRow = {
  code: string;
  idProduct: number;
  name: string;
  price: string;
  quantity: number;
  requiresManualPrice: boolean;
};

const todayDateOnly = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function useCreateTandaController() {
  const [activeStep, setActiveStep] = useState<StepId | null>(1);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);
  const [isClientEditing, setIsClientEditing] = useState(true);
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState<TandaProductRow[]>([]);
  const [editingProductCode, setEditingProductCode] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [paymentCount, setPaymentCount] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClientCreateOpen, setIsClientCreateOpen] = useState(false);
  const [isClientCreating, setIsClientCreating] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [isProductLookupLoading, setIsProductLookupLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => client.name.toLowerCase().includes(query));
  }, [clientSearch, clients]);

  const productsReady =
    products.length > 0 &&
    products.every((product) => product.quantity > 0 && isValidMoney(product.price));
  const paymentCountReady = Number.isInteger(Number(paymentCount)) && Number(paymentCount) > 0;
  const paymentFrequencyReady =
    Number.isInteger(Number(paymentFrequency)) &&
    Number(paymentFrequency) >= 3 &&
    Number(paymentFrequency) <= 15;
  const firstPaymentDateReady =
    Boolean(firstPaymentDate) && firstPaymentDate >= todayDateOnly();

  const completedSteps = useMemo(() => {
    const next = new Set<StepId>();

    if (selectedClient) {
      next.add(1);
    }

    if (productsReady) {
      next.add(2);
    }

    if (paymentCountReady) {
      next.add(3);
    }

    if (paymentFrequencyReady) {
      next.add(4);
    }

    if (firstPaymentDateReady) {
      next.add(5);
    }

    return next;
  }, [
    firstPaymentDateReady,
    paymentCountReady,
    paymentFrequencyReady,
    productsReady,
    selectedClient,
  ]);

  const buildInput = useMemo<CreateTandaInput | null>(() => {
    if (
      !selectedClient ||
      !productsReady ||
      !paymentCountReady ||
      !paymentFrequencyReady ||
      !firstPaymentDateReady
    ) {
      return null;
    }

    return {
      clientId: selectedClient.idClient,
      firstPaymentDate,
      paymentCount: Number(paymentCount),
      paymentIntervalDays: Number(paymentFrequency),
      products: products.map((product) => ({
        code: product.code,
        price: Number(product.price),
        quantity: product.quantity,
      })),
    };
  }, [
    firstPaymentDate,
    firstPaymentDateReady,
    paymentCount,
    paymentCountReady,
    paymentFrequency,
    paymentFrequencyReady,
    products,
    productsReady,
    selectedClient,
  ]);

  const canSubmit = Boolean(buildInput) && !isSubmitting;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await createTandaGateway.listClients();

        if (!isMounted) {
          return;
        }

        setClients(data);
      } catch (requestError) {
        if (isMounted) {
          setError(getTandaErrorMessage(requestError, t("tanda_view.messages.load_error")));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const canOpenStep = (step: StepId) => {
    if (step === 1 || step === 6) {
      return true;
    }

    for (let currentStep = 1; currentStep < step; currentStep += 1) {
      if (!completedSteps.has(currentStep as StepId)) {
        return false;
      }
    }

    return true;
  };

  const handleStepClick = (step: StepId) => {
    if (!canOpenStep(step)) {
      setError(t("tanda_view.messages.step_locked"));
      return;
    }

    setError(null);
    setActiveStep((current) => (current === step ? null : step));
  };

  const handleClientSelect = (client: ClientDto) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setIsClientEditing(false);
    setError(null);
    setActiveStep(2);
  };

  const openClientCreate = () => {
    setNewClientName(clientSearch.trim());
    setIsClientCreateOpen(true);
    setError(null);
  };

  const closeClientCreate = () => {
    if (isClientCreating) {
      return;
    }

    setIsClientCreateOpen(false);
    setNewClientName("");
  };

  const handleClientCreate = async () => {
    const name = newClientName.trim();

    if (!name) {
      setError(t("tanda_view.messages.client_name_required"));
      return;
    }

    setIsClientCreating(true);
    setError(null);

    try {
      const client = await createTandaGateway.createClient(name);
      setClients((current) => [...current, client].sort((a, b) => a.name.localeCompare(b.name)));
      setClientSearch(client.name);
      setIsClientCreateOpen(false);
      setNewClientName("");
      setNotice(t("tanda_view.messages.client_create_success"));
    } catch (requestError) {
      setError(getTandaErrorMessage(requestError, t("tanda_view.messages.client_create_error")));
    } finally {
      setIsClientCreating(false);
    }
  };

  const handleProductAdd = async () => {
    const code = productInput.trim();

    if (!code) {
      return;
    }

    setProducts((current) => {
      const existingProduct = current.find((item) => item.code === code);

      if (existingProduct) {
        return current.map((item) =>
          item.code === code ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return current;
    });

    if (products.some((product) => product.code === code)) {
      setProductInput("");
      setError(null);
      return;
    }

    setIsProductLookupLoading(true);

    try {
      const product = await createTandaGateway.findProductByCode(code);
      const price = product.priceProduct === null ? "" : String(product.priceProduct);

      setProducts((current) => [
        ...current,
        {
          code: product.code,
          idProduct: product.idProduct,
          name: product.nameProducts,
          price,
          quantity: 1,
          requiresManualPrice: product.priceProduct === null,
        },
      ]);

      if (product.priceProduct === null) {
        setEditingProductCode(product.code);
        setEditingPrice("");
      }

      setProductInput("");
      setError(null);
    } catch (requestError) {
      setError(getTandaErrorMessage(requestError, t("tanda_view.messages.product_not_found", { code })));
    } finally {
      setIsProductLookupLoading(false);
    }
  };

  const handleProductSave = () => {
    if (!productsReady) {
      setError(t("tanda_view.messages.products_incomplete"));
      return;
    }

    setError(null);
    setActiveStep(3);
  };

  const handlePriceSave = (code: string, currentValue = editingPrice) => {
    const nextPrice = normalizeMoney(currentValue);

    if (!isValidMoney(nextPrice)) {
      setError(t("tanda_view.messages.invalid_price"));
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.code === code
          ? {
              ...product,
              price: nextPrice,
            }
          : product,
      ),
    );
    setEditingProductCode(null);
    setEditingPrice("");
    setError(null);
  };

  const handleQuantityChange = (code: string, quantity: string) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);

    setProducts((current) =>
      current.map((product) =>
        product.code === code ? { ...product, quantity: nextQuantity } : product,
      ),
    );
  };

  const handleProductDelete = (code: string) => {
    setProducts((current) => current.filter((product) => product.code !== code));
  };

  const handlePaymentCountChange = (value: string) => {
    setPaymentCount(value);

    if (Number(value) > 0) {
      setActiveStep(4);
    }
  };

  const handlePaymentFrequencyChange = (value: string) => {
    setPaymentFrequency(value);

    if (Number(value) >= 3 && Number(value) <= 15) {
      setActiveStep(5);
    }
  };

  const handleDateSave = () => {
    if (!firstPaymentDateReady) {
      setError(t("tanda_view.messages.invalid_first_payment_date"));
      return;
    }

    setError(null);
    setActiveStep(6);
  };

  const resetWizard = () => {
    setActiveStep(1);
    setClientSearch("");
    setSelectedClient(null);
    setIsClientEditing(true);
    setProductInput("");
    setProducts([]);
    setEditingProductCode(null);
    setEditingPrice("");
    setPaymentCount("");
    setPaymentFrequency("");
    setFirstPaymentDate("");
    setIsClientCreateOpen(false);
    setNewClientName("");
    setIsConfirmOpen(false);
    setError(null);
  };

  const openConfirm = () => {
    if (!canSubmit) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
  };

  const submitTanda = async () => {
    if (!buildInput) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTandaGateway.create(buildInput);
      setNotice(t("tanda_view.messages.create_success"));
      resetWizard();
    } catch (requestError) {
      setError(getTandaErrorMessage(requestError, t("tanda_view.messages.create_error")));
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  return {
    activeStep,
    canSubmit,
    clientSearch,
    clients,
    completedSteps,
    editingPrice,
    editingProductCode,
    error,
    filteredClients,
    firstPaymentDate,
    firstPaymentDateReady,
    handleClientSelect,
    handleClientCreate,
    handleDateSave,
    handlePaymentCountChange,
    handlePaymentFrequencyChange,
    handlePriceSave,
    handleProductAdd,
    handleProductDelete,
    handleProductSave,
    handleQuantityChange,
    handleStepClick,
    isClientEditing,
    isClientCreateOpen,
    isClientCreating,
    isConfirmOpen,
    isLoading,
    isProductLookupLoading,
    isSubmitting,
    notice,
    newClientName,
    openClientCreate,
    openConfirm,
    paymentCount,
    paymentFrequency,
    productInput,
    products,
    resetWizard,
    selectedClient,
    setClientSearch,
    setEditingPrice,
    setEditingProductCode,
    setFirstPaymentDate,
    setIsClientEditing,
    setNewClientName,
    setProductInput,
    closeConfirm,
    closeClientCreate,
    submitTanda,
    today: todayDateOnly(),
  };
}

const normalizeMoney = (value: string) => value.trim().replace("$", "");

const isValidMoney = (value: string) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0;

const getTandaErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
};
