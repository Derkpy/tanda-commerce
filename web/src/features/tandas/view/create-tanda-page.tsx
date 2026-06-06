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
import type { ReactNode } from "react";
import type { ClientDto } from "../data/create-tanda.gateway";
import {
  type StepId,
  type TandaProductRow,
  useCreateTandaController,
} from "../controller/use-create-tanda-controller";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

const stepTitles: Record<StepId, string> = {
  1: t("tanda_view.steps.client"),
  2: t("tanda_view.steps.product"),
  3: t("tanda_view.steps.payment_count"),
  4: t("tanda_view.steps.payment_frequency"),
  5: t("tanda_view.steps.first_payment_date"),
  6: t("tanda_view.steps.summary"),
};

export function CreateTandaPage() {
  const controller = useCreateTandaController();

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

      {controller.error ? (
        <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {controller.error}
        </div>
      ) : null}

      {controller.notice ? (
        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {controller.notice}
        </div>
      ) : null}

      <section className="max-w-5xl">
        <div className="space-y-4">
          {([1, 2, 3, 4, 5, 6] as StepId[]).map((step) => (
            <StepperItem
              isCompleted={controller.completedSteps.has(step)}
              isExpanded={controller.activeStep === step}
              isLocked={!canOpenStep(step, controller.completedSteps)}
              key={step}
              number={step}
              onClick={() => controller.handleStepClick(step)}
              title={stepTitles[step]}
            >
              {step === 1 ? (
                <ClientStep
                  clientSearch={controller.clientSearch}
                  filteredClients={controller.filteredClients}
                  isClientEditing={controller.isClientEditing}
                  isLoading={controller.isLoading}
                  onClientCreate={controller.openClientCreate}
                  onClientEdit={() => controller.setIsClientEditing(true)}
                  onClientSearchChange={controller.setClientSearch}
                  onClientSelect={controller.handleClientSelect}
                  selectedClient={controller.selectedClient}
                />
              ) : null}
              {step === 2 ? (
                <ProductStep
                  editingPrice={controller.editingPrice}
                  editingProductCode={controller.editingProductCode}
                  isLookupLoading={controller.isProductLookupLoading}
                  onAdd={controller.handleProductAdd}
                  onDelete={controller.handleProductDelete}
                  onEdit={(product) => {
                    controller.setEditingProductCode(product.code);
                    controller.setEditingPrice(product.price);
                  }}
                  onInputChange={controller.setProductInput}
                  onPriceChange={controller.setEditingPrice}
                  onPriceSave={controller.handlePriceSave}
                  onQuantityChange={controller.handleQuantityChange}
                  onSave={controller.handleProductSave}
                  productInput={controller.productInput}
                  products={controller.products}
                />
              ) : null}
              {step === 3 ? (
                <PaymentCountStep
                  onChange={controller.handlePaymentCountChange}
                  paymentCount={controller.paymentCount}
                />
              ) : null}
              {step === 4 ? (
                <PaymentFrequencyStep
                  onChange={controller.handlePaymentFrequencyChange}
                  paymentFrequency={controller.paymentFrequency}
                />
              ) : null}
              {step === 5 ? (
                <FirstPaymentDateStep
                  firstPaymentDate={controller.firstPaymentDate}
                  minDate={controller.today}
                  onChange={controller.setFirstPaymentDate}
                  onSave={controller.handleDateSave}
                />
              ) : null}
              {step === 6 ? (
                <SummaryStep
                  canSubmit={controller.canSubmit}
                  firstPaymentDate={controller.firstPaymentDate}
                  isSubmitting={controller.isSubmitting}
                  onCancel={controller.resetWizard}
                  onConfirm={controller.openConfirm}
                  paymentCount={controller.paymentCount}
                  paymentFrequency={controller.paymentFrequency}
                  products={controller.products}
                  selectedClient={controller.selectedClient}
                />
              ) : null}
            </StepperItem>
          ))}
        </div>
      </section>

      {controller.isConfirmOpen ? (
        <ConfirmCreateTandaDialog
          isSubmitting={controller.isSubmitting}
          onCancel={controller.closeConfirm}
          onConfirm={() => void controller.submitTanda()}
          selectedClient={controller.selectedClient}
        />
      ) : null}

      {controller.isClientCreateOpen ? (
        <CreateClientDialog
          isSubmitting={controller.isClientCreating}
          name={controller.newClientName}
          onCancel={controller.closeClientCreate}
          onConfirm={() => void controller.handleClientCreate()}
          onNameChange={controller.setNewClientName}
        />
      ) : null}
    </>
  );
}

function StepperItem({
  children,
  isCompleted,
  isExpanded,
  isLocked,
  number,
  onClick,
  title,
}: {
  children: ReactNode;
  isCompleted: boolean;
  isExpanded: boolean;
  isLocked: boolean;
  number: StepId;
  onClick: () => void;
  title: string;
}) {
  return (
    <article className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4">
      {number < 6 ? (
        <div className="absolute bottom-[-1rem] left-[1.62rem] top-12 w-px bg-violet-400/30" />
      ) : null}
      <div
        className={cn(
          "relative z-10 grid size-11 place-items-center rounded-full border border-violet-300/40 bg-violet-500/20 text-sm font-semibold text-white shadow-lg shadow-violet-500/30",
          isLocked && "border-white/10 bg-white/[0.04] text-neutral-500 shadow-none",
        )}
      >
        {number}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-px min-w-4 flex-1 bg-gradient-to-r from-violet-400/35 to-white/10" />
          <button
            className={cn(
              "min-w-0 max-w-[78%] shrink-0 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-black/20 transition hover:border-violet-400/30 hover:bg-white/[0.075] sm:px-5",
              isExpanded && "border-violet-400/40 bg-violet-500/10",
              isLocked && "cursor-not-allowed opacity-50 hover:border-white/10 hover:bg-white/[0.055]",
            )}
            disabled={isLocked}
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
  isLoading,
  onClientCreate,
  onClientEdit,
  onClientSearchChange,
  onClientSelect,
  selectedClient,
}: {
  clientSearch: string;
  filteredClients: ClientDto[];
  isClientEditing: boolean;
  isLoading: boolean;
  onClientCreate: () => void;
  onClientEdit: () => void;
  onClientSearchChange: (value: string) => void;
  onClientSelect: (client: ClientDto) => void;
  selectedClient: ClientDto | null;
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
          {selectedClient.name}
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
            {isLoading ? (
              <p className="px-4 py-2 text-sm text-neutral-400">
                {t("tanda_view.client.loading")}
              </p>
            ) : null}
            {!isLoading && filteredClients.length === 0 ? (
              <p className="px-4 py-2 text-sm text-neutral-400">
                {t("tanda_view.client.no_results")}
              </p>
            ) : null}
            {filteredClients.map((client) => (
              <button
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-200 transition hover:bg-white/[0.045]"
                key={client.idClient}
                onClick={() => onClientSelect(client)}
                type="button"
              >
                <UserRound aria-hidden="true" className="size-4 text-neutral-400" />
                {client.name}
              </button>
            ))}
            <button
              className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left text-sm font-semibold text-violet-100 transition hover:bg-violet-500/10"
              onClick={onClientCreate}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              {t("tanda_view.client.add_new")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductStep({
  editingPrice,
  editingProductCode,
  isLookupLoading,
  onAdd,
  onDelete,
  onEdit,
  onInputChange,
  onPriceChange,
  onPriceSave,
  onQuantityChange,
  onSave,
  productInput,
  products,
}: {
  editingPrice: string;
  editingProductCode: string | null;
  isLookupLoading: boolean;
  onAdd: () => void;
  onDelete: (code: string) => void;
  onEdit: (product: TandaProductRow) => void;
  onInputChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onPriceSave: (code: string, currentValue?: string) => void;
  onQuantityChange: (code: string, quantity: string) => void;
  onSave: () => void;
  productInput: string;
  products: TandaProductRow[];
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
          disabled={isLookupLoading}
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
          <table className="min-w-[46rem] w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-4 font-semibold">{t("tanda_view.product.columns.id")}</th>
                <th className="px-4 py-4 font-semibold">{t("tanda_view.product.columns.name")}</th>
                <th className="px-4 py-4 font-semibold">
                  {t("tanda_view.product.columns.quantity")}
                </th>
                <th className="px-4 py-4 font-semibold">
                  {t("tanda_view.product.columns.price")}
                </th>
                <th className="px-4 py-4 font-semibold">
                  {t("tanda_view.product.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-neutral-400" colSpan={5}>
                    {t("tanda_view.product.empty")}
                  </td>
                </tr>
              ) : null}
              {products.map((product) => {
                const isPriceEditing =
                  editingProductCode === product.code ||
                  (product.requiresManualPrice && !product.price);

                return (
                  <tr className="transition hover:bg-white/[0.035]" key={product.code}>
                    <td className="px-4 py-4 text-neutral-300">{product.code}</td>
                    <td className="px-4 py-4 font-medium text-neutral-100">{product.name}</td>
                    <td className="px-4 py-4 text-neutral-300">
                      <input
                        className="h-9 w-20 rounded-xl border border-white/10 bg-neutral-950/60 px-3 text-sm text-white outline-none focus:border-violet-400/60"
                        min={1}
                        onChange={(event) => onQuantityChange(product.code, event.target.value)}
                        type="number"
                        value={product.quantity}
                      />
                    </td>
                    <td className="px-4 py-4 text-neutral-300">
                      {isPriceEditing ? (
                        <input
                          className="h-9 w-28 rounded-xl border border-violet-400/40 bg-neutral-950/60 px-3 text-sm text-white outline-none"
                          onBlur={(event) => onPriceSave(product.code, event.currentTarget.value)}
                          onChange={(event) => onPriceChange(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              onPriceSave(product.code, event.currentTarget.value);
                            }
                          }}
                          placeholder={t("tanda_view.product.price_placeholder")}
                          value={editingPrice}
                        />
                      ) : (
                        formatMoney(product.price)
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
                          onClick={() => onDelete(product.code)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
      <input
        className="h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
        min={1}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("tanda_view.payment_count.placeholder")}
        type="number"
        value={paymentCount}
      />
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
      <input
        className="h-11 w-full rounded-xl border border-violet-400/40 bg-neutral-950/60 px-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
        max={15}
        min={3}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("tanda_view.payment_frequency.placeholder")}
        type="number"
        value={paymentFrequency}
      />
      <p className="text-xs text-neutral-500">{t("tanda_view.payment_frequency.help")}</p>
    </div>
  );
}

function FirstPaymentDateStep({
  firstPaymentDate,
  minDate,
  onChange,
  onSave,
}: {
  firstPaymentDate: string;
  minDate: string;
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
            min={minDate}
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
  canSubmit,
  firstPaymentDate,
  isSubmitting,
  onCancel,
  onConfirm,
  paymentCount,
  paymentFrequency,
  products,
  selectedClient,
}: {
  canSubmit: boolean;
  firstPaymentDate: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  paymentCount: string;
  paymentFrequency: string;
  products: TandaProductRow[];
  selectedClient: ClientDto | null;
}) {
  const formattedDate = firstPaymentDate
    ? formatDate(firstPaymentDate)
    : t("tanda_view.summary.pending");
  const count = paymentCount || t("tanda_view.summary.pending");
  const days = paymentFrequency
    ? t("tanda_view.summary.days_suffix", { days: paymentFrequency })
    : t("tanda_view.summary.pending");
  const total = products.reduce((currentTotal, product) => {
    const price = Number(product.price);

    return Number.isFinite(price) ? currentTotal + price * product.quantity : currentTotal;
  }, 0);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-semibold text-white">{t("tanda_view.summary.client_title")}</p>
        <p className="mt-2 text-sm text-neutral-300">
          {t("tanda_view.summary.client_label")}:{" "}
          <span className="font-medium text-violet-100">
            {selectedClient?.name ?? t("tanda_view.summary.pending")}
          </span>
        </p>
      </section>

      <section>
        <p className="mb-3 text-sm font-semibold text-white">
          {t("tanda_view.summary.products_title")}
        </p>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[36rem] w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-4 font-semibold">{t("tanda_view.product.columns.id")}</th>
                  <th className="px-4 py-4 font-semibold">
                    {t("tanda_view.product.columns.name")}
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    {t("tanda_view.product.columns.quantity")}
                  </th>
                  <th className="px-4 py-4 font-semibold">
                    {t("tanda_view.product.columns.price")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-neutral-400" colSpan={4}>
                      {t("tanda_view.product.empty")}
                    </td>
                  </tr>
                ) : null}
                {products.map((product) => (
                  <tr key={product.code}>
                    <td className="px-4 py-4 text-neutral-300">{product.code}</td>
                    <td className="px-4 py-4 font-medium text-neutral-100">{product.name}</td>
                    <td className="px-4 py-4 text-neutral-300">{product.quantity}</td>
                    <td className="px-4 py-4 text-neutral-300">{formatMoney(product.price)}</td>
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
        <p className="mt-3 text-sm font-semibold text-violet-100">
          {t("tanda_view.summary.total")}:{" "}
          {products.length > 0 ? formatMoney(total) : t("tanda_view.summary.pending")}
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="mb-3 text-sm font-semibold text-white">
          {t("tanda_view.summary.payments_title")}
        </p>
        <p className="text-sm text-neutral-400">
          {t("tanda_view.summary.backend_pending")}
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/15"
          onClick={onCancel}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
          {t("tanda_view.summary.cancel")}
        </button>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit || isSubmitting}
          onClick={onConfirm}
          type="button"
        >
          <Check aria-hidden="true" className="size-4" />
          {isSubmitting ? t("tanda_view.summary.submitting") : t("tanda_view.summary.confirm")}
        </button>
      </div>
    </div>
  );
}

function ConfirmCreateTandaDialog({
  isSubmitting,
  onCancel,
  onConfirm,
  selectedClient,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  selectedClient: ClientDto | null;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090c19]/95 p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{t("tanda_view.confirm.title")}</h2>
          <button
            aria-label={t("tanda_view.confirm.cancel")}
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/10 hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <p className="text-sm leading-6 text-neutral-300">
          {t("tanda_view.confirm.text", {
            client: selectedClient?.name ?? t("tanda_view.summary.pending"),
          })}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-neutral-200 transition hover:bg-white/10"
            onClick={onCancel}
            type="button"
          >
            {t("tanda_view.confirm.cancel")}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onConfirm}
            type="button"
          >
            {isSubmitting ? t("tanda_view.summary.submitting") : t("tanda_view.confirm.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateClientDialog({
  isSubmitting,
  name,
  onCancel,
  onConfirm,
  onNameChange,
}: {
  isSubmitting: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  onNameChange: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090c19]/95 p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{t("tanda_view.client_dialog.title")}</h2>
          <button
            aria-label={t("tanda_view.client_dialog.cancel")}
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/10 hover:text-white"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <label className="block text-sm font-medium text-neutral-300" htmlFor="new-client-name">
          {t("tanda_view.client_dialog.name_label")}
        </label>
        <input
          autoFocus
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
          disabled={isSubmitting}
          id="new-client-name"
          maxLength={120}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim()) {
              onConfirm();
            }
          }}
          placeholder={t("tanda_view.client_dialog.name_placeholder")}
          value={name}
        />

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            {t("tanda_view.client_dialog.cancel")}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !name.trim()}
            onClick={onConfirm}
            type="button"
          >
            <Plus aria-hidden="true" className="size-4" />
            {isSubmitting
              ? t("tanda_view.client_dialog.submitting")
              : t("tanda_view.client_dialog.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

const canOpenStep = (step: StepId, completedSteps: Set<StepId>) => {
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

function formatDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatMoney(value: number | string) {
  if (!value) {
    return t("tanda_view.summary.pending");
  }

  return new Intl.NumberFormat("es-MX", {
    currency: "MXN",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(Number(value));
}
