import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

type StepId = 1 | 2 | 3 | 4 | 5 | 6;

type ProductRow = {
  id: string;
  name: string;
  price: string;
};

const clients = ["María González", "Mariana López", "Marco Pérez"];

const initialProducts: ProductRow[] = [
  { id: "192012", name: "Pantalón", price: "$120" },
  { id: "089102", name: "Falda", price: "$60" },
  { id: "891289", name: "Blusa", price: "$0" },
];

const productCatalog: Record<string, ProductRow> = {
  "089102": { id: "089102", name: "Falda", price: "$60" },
  "192012": { id: "192012", name: "Pantalón", price: "$120" },
  "334421": { id: "334421", name: "Bolso", price: "$240" },
  "891289": { id: "891289", name: "Blusa", price: "$0" },
};

const frequencyOptions = [
  t("tanda_view.payment_frequency.seven_days"),
  t("tanda_view.payment_frequency.fifteen_days"),
  t("tanda_view.payment_frequency.thirty_days"),
];

const stepTitles: Record<StepId, string> = {
  1: t("tanda_view.steps.client"),
  2: t("tanda_view.steps.product"),
  3: t("tanda_view.steps.payment_count"),
  4: t("tanda_view.steps.payment_frequency"),
  5: t("tanda_view.steps.first_payment_date"),
  6: t("tanda_view.steps.summary"),
};

export function CreateTandaPage() {
  const [activeStep, setActiveStep] = useState<StepId | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [clientSearch, setClientSearch] = useState("mar");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isClientEditing, setIsClientEditing] = useState(true);
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [paymentCount, setPaymentCount] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => client.toLowerCase().includes(query));
  }, [clientSearch]);

  const completeStep = (step: StepId) => {
    setCompletedSteps((current) => {
      const next = new Set(current);
      next.add(step);
      return next;
    });
  };

  const handleStepClick = (step: StepId) => {
    setActiveStep((current) => (current === step ? null : step));
  };

  const handleClientSelect = (client: string) => {
    setSelectedClient(client);
    setClientSearch(client);
    setIsClientEditing(false);
    completeStep(1);
    setActiveStep(null);
  };

  const handleProductAdd = () => {
    const productId = productInput.trim();

    if (!productId) {
      return;
    }

    const product = productCatalog[productId] ?? {
      id: productId,
      name: "Producto temporal",
      price: "$0",
    };

    setProducts((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current;
      }

      return [...current, product];
    });
    setProductInput("");
  };

  const handleProductSave = () => {
    completeStep(2);
    setActiveStep(null);
  };

  const handlePriceSave = (id: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              price: editingPrice || product.price,
            }
          : product,
      ),
    );
    setEditingProductId(null);
    setEditingPrice("");
  };

  const handleProductDelete = (id: string) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const handlePaymentCountChange = (value: string) => {
    setPaymentCount(value);

    if (value) {
      completeStep(3);
      setActiveStep(4);
    }
  };

  const handlePaymentFrequencyChange = (value: string) => {
    setPaymentFrequency(value);

    if (value) {
      completeStep(4);
      setActiveStep(5);
    }
  };

  const handleDateSave = () => {
    if (!firstPaymentDate) {
      return;
    }

    completeStep(5);
    setActiveStep(null);
  };

  return (
    <>
      <section className="mb-7">
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          {t("tanda_view.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
          {t("tanda_view.description")}
        </p>
      </section>

      <section className="max-w-5xl">
        <div className="space-y-4">
          {([1, 2, 3, 4, 5, 6] as StepId[]).map((step) => (
            <StepperItem
              isCompleted={completedSteps.has(step)}
              isExpanded={activeStep === step}
              key={step}
              number={step}
              onClick={() => handleStepClick(step)}
              title={stepTitles[step]}
            >
              {step === 1 ? (
                <ClientStep
                  clientSearch={clientSearch}
                  filteredClients={filteredClients}
                  isClientEditing={isClientEditing}
                  onClientEdit={() => setIsClientEditing(true)}
                  onClientSearchChange={setClientSearch}
                  onClientSelect={handleClientSelect}
                  selectedClient={selectedClient}
                />
              ) : null}
              {step === 2 ? (
                <ProductStep
                  editingPrice={editingPrice}
                  editingProductId={editingProductId}
                  onAdd={handleProductAdd}
                  onDelete={handleProductDelete}
                  onEdit={(product) => {
                    setEditingProductId(product.id);
                    setEditingPrice(product.price);
                  }}
                  onInputChange={setProductInput}
                  onPriceChange={setEditingPrice}
                  onPriceSave={handlePriceSave}
                  onSave={handleProductSave}
                  productInput={productInput}
                  products={products}
                />
              ) : null}
              {step === 3 ? (
                <PaymentCountStep
                  onChange={handlePaymentCountChange}
                  paymentCount={paymentCount}
                />
              ) : null}
              {step === 4 ? (
                <PaymentFrequencyStep
                  onChange={handlePaymentFrequencyChange}
                  paymentFrequency={paymentFrequency}
                />
              ) : null}
              {step === 5 ? (
                <FirstPaymentDateStep
                  firstPaymentDate={firstPaymentDate}
                  onChange={setFirstPaymentDate}
                  onSave={handleDateSave}
                />
              ) : null}
              {step === 6 ? (
                <SummaryStep
                  firstPaymentDate={firstPaymentDate}
                  paymentCount={paymentCount}
                  paymentFrequency={paymentFrequency}
                  products={products}
                  selectedClient={selectedClient}
                />
              ) : null}
            </StepperItem>
          ))}
        </div>
      </section>
    </>
  );
}

function StepperItem({
  children,
  isCompleted,
  isExpanded,
  number,
  onClick,
  title,
}: {
  children: React.ReactNode;
  isCompleted: boolean;
  isExpanded: boolean;
  number: StepId;
  onClick: () => void;
  title: string;
}) {
  return (
    <article className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4">
      {number < 6 ? (
        <div className="absolute bottom-[-1rem] left-[1.62rem] top-12 w-px bg-violet-400/30" />
      ) : null}
      <div className="relative z-10 grid size-11 place-items-center rounded-full border border-violet-300/40 bg-violet-500/20 text-sm font-semibold text-white shadow-lg shadow-violet-500/30">
        {number}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-px min-w-4 flex-1 bg-gradient-to-r from-violet-400/35 to-white/10" />
          <button
            className={cn(
              "min-w-0 max-w-[78%] shrink-0 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-black/20 transition hover:border-violet-400/30 hover:bg-white/[0.075] sm:px-5",
              isExpanded && "border-violet-400/40 bg-violet-500/10",
            )}
            onClick={onClick}
            type="button"
          >
            {title}
          </button>
          <div className="h-px min-w-4 flex-1 bg-gradient-to-r from-white/10 to-violet-400/35" />
          {isCompleted ? (
            <span
              aria-label={t("tanda_view.completed")}
              className="grid size-7 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
              title={t("tanda_view.completed")}
            >
              <Check aria-hidden="true" className="size-4" />
            </span>
          ) : null}
        </div>
        {isExpanded ? (
          <div className="mt-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
            {children}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ClientStep({
  clientSearch,
  filteredClients,
  isClientEditing,
  onClientEdit,
  onClientSearchChange,
  onClientSelect,
  selectedClient,
}: {
  clientSearch: string;
  filteredClients: string[];
  isClientEditing: boolean;
  onClientEdit: () => void;
  onClientSearchChange: (value: string) => void;
  onClientSelect: (client: string) => void;
  selectedClient: string | null;
}) {
  return (
    <div className="max-w-xl">
      {selectedClient ? (
        <button
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/15"
          onClick={onClientEdit}
          type="button"
        >
          <UserRound aria-hidden="true" className="size-4" />
          {selectedClient}
        </button>
      ) : null}

      {isClientEditing ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/50">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
            />
            <input
              className="h-12 w-full border-b border-violet-400/30 bg-transparent px-10 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-violet-400/60"
              onChange={(event) => onClientSearchChange(event.target.value)}
              placeholder={t("tanda_view.client.search_placeholder")}
              value={clientSearch}
            />
          </div>
          <div className="py-2">
            {filteredClients.map((client) => (
              <button
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-200 transition hover:bg-white/[0.045]"
                key={client}
                onClick={() => onClientSelect(client)}
                type="button"
              >
                <UserRound aria-hidden="true" className="size-4 text-neutral-400" />
                {client}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductStep({
  editingPrice,
  editingProductId,
  onAdd,
  onDelete,
  onEdit,
  onInputChange,
  onPriceChange,
  onPriceSave,
  onSave,
  productInput,
  products,
}: {
  editingPrice: string;
  editingProductId: string | null;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (product: ProductRow) => void;
  onInputChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onPriceSave: (id: string) => void;
  onSave: () => void;
  productInput: string;
  products: ProductRow[];
}) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-neutral-950/50 px-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={t("tanda_view.product.input_placeholder")}
          value={productInput}
        />
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/15 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500/20"
          onClick={onAdd}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("tanda_view.product.add")}
        </button>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500"
          onClick={onSave}
          type="button"
        >
          <Save aria-hidden="true" className="size-4" />
          {t("tanda_view.product.save")}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-[42rem] w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-4 font-semibold">{t("tanda_view.product.columns.id")}</th>
                <th className="px-4 py-4 font-semibold">{t("tanda_view.product.columns.name")}</th>
                <th className="px-4 py-4 font-semibold">
                  {t("tanda_view.product.columns.price")}
                </th>
                <th className="px-4 py-4 font-semibold">
                  {t("tanda_view.product.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr className="transition hover:bg-white/[0.035]" key={product.id}>
                  <td className="px-4 py-4 text-neutral-300">{product.id}</td>
                  <td className="px-4 py-4 font-medium text-neutral-100">{product.name}</td>
                  <td className="px-4 py-4 text-neutral-300">
                    {editingProductId === product.id ? (
                      <input
                        className="h-9 w-28 rounded-xl border border-violet-400/40 bg-neutral-950/60 px-3 text-sm text-white outline-none"
                        onBlur={() => onPriceSave(product.id)}
                        onChange={(event) => onPriceChange(event.target.value)}
                        placeholder={t("tanda_view.product.price_placeholder")}
                        value={editingPrice}
                      />
                    ) : (
                      product.price
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label={t("tanda_view.product.edit_price")}
                        className="text-neutral-300 transition hover:text-violet-200"
                        onClick={() => onEdit(product)}
                        type="button"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        aria-label={t("tanda_view.product.delete")}
                        className="text-rose-400 transition hover:text-rose-200"
                        onClick={() => onDelete(product.id)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentCountStep({
  onChange,
  paymentCount,
}: {
  onChange: (value: string) => void;
  paymentCount: string;
}) {
  return (
    <div className="max-w-md space-y-3">
      <p className="text-sm text-neutral-300">{t("tanda_view.payment_count.question")}</p>
      <select
        className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
        onChange={(event) => onChange(event.target.value)}
        value={paymentCount}
      >
        <option value="">{t("tanda_view.payment_count.placeholder")}</option>
        {Array.from({ length: 9 }, (_, index) => String(index + 2)).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}

function PaymentFrequencyStep({
  onChange,
  paymentFrequency,
}: {
  onChange: (value: string) => void;
  paymentFrequency: string;
}) {
  return (
    <div className="max-w-md space-y-3">
      <p className="text-sm text-neutral-300">{t("tanda_view.payment_frequency.question")}</p>
      <select
        className="h-11 w-full rounded-xl border border-violet-400/40 bg-neutral-950/60 px-4 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
        onChange={(event) => onChange(event.target.value)}
        value={paymentFrequency}
      >
        <option value="">{t("tanda_view.payment_frequency.placeholder")}</option>
        {frequencyOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FirstPaymentDateStep({
  firstPaymentDate,
  onChange,
  onSave,
}: {
  firstPaymentDate: string;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm text-neutral-300">{t("tanda_view.first_payment_date.question")}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <CalendarDays
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
          />
          <input
            className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-10 text-sm text-white outline-none transition [color-scheme:dark] placeholder:text-neutral-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
            onChange={(event) => onChange(event.target.value)}
            placeholder={t("tanda_view.first_payment_date.placeholder")}
            type="date"
            value={firstPaymentDate}
          />
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!firstPaymentDate}
          onClick={onSave}
          type="button"
        >
          <Save aria-hidden="true" className="size-4" />
          {t("tanda_view.first_payment_date.save")}
        </button>
      </div>
    </div>
  );
}

function SummaryStep({
  firstPaymentDate,
  paymentCount,
  paymentFrequency,
  products,
  selectedClient,
}: {
  firstPaymentDate: string;
  paymentCount: string;
  paymentFrequency: string;
  products: ProductRow[];
  selectedClient: string | null;
}) {
  const formattedDate = firstPaymentDate ? formatDate(firstPaymentDate) : t("tanda_view.summary.pending");
  const count = paymentCount || t("tanda_view.summary.pending");
  const days = paymentFrequency || t("tanda_view.summary.pending");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-semibold text-white">{t("tanda_view.summary.client_title")}</p>
        <p className="mt-2 text-sm text-neutral-300">
          {t("tanda_view.summary.client_label")}:{" "}
          <span className="font-medium text-violet-100">
            {selectedClient ?? t("tanda_view.summary.pending")}
          </span>
        </p>
      </section>

      <section>
        <p className="mb-3 text-sm font-semibold text-white">
          {t("tanda_view.summary.products_title")}
        </p>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[32rem] w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-4 font-semibold">{t("tanda_view.product.columns.id")}</th>
                  <th className="px-4 py-4 font-semibold">
                    {t("tanda_view.product.columns.name")}
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    {t("tanda_view.product.columns.price")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4 text-neutral-300">{product.id}</td>
                    <td className="px-4 py-4 font-medium text-neutral-100">{product.name}</td>
                    <td className="px-4 py-4 text-neutral-300">{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-semibold text-white">
          {t("tanda_view.summary.conditions_title")}
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-300">
          {t("tanda_view.summary.conditions_text", {
            count,
            date: formattedDate,
            days,
          })}
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/15"
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
          {t("tanda_view.summary.cancel")}
        </button>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500"
          type="button"
        >
          <Check aria-hidden="true" className="size-4" />
          {t("tanda_view.summary.confirm")}
        </button>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}
