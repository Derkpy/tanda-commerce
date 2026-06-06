import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  UsersRound,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

const clients = [
  { name: "María González", status: t("clients_view.status.good") },
  { name: "José Ramírez", status: t("clients_view.status.good") },
  { name: "Ana López", status: t("clients_view.status.regular") },
  { name: "Carlos Hernández", status: t("clients_view.status.bad") },
  { name: "Luisa Martínez", status: t("clients_view.status.good") },
  { name: "Fernanda Ruiz", status: t("clients_view.status.good") },
  { name: "Miguel Torres", status: t("clients_view.status.regular") },
  { name: "Sofía Castillo", status: t("clients_view.status.good") },
  { name: "Daniela Pérez", status: t("clients_view.status.regular") },
  { name: "Brenda Silva", status: t("clients_view.status.bad") },
  { name: "Roberto Díaz", status: t("clients_view.status.good") },
  { name: "Itzel Moreno", status: t("clients_view.status.regular") },
  { name: "Paola Vargas", status: t("clients_view.status.good") },
  { name: "Hugo Méndez", status: t("clients_view.status.bad") },
  { name: "Natalia Flores", status: t("clients_view.status.good") },
];

const clientPageSize = 10;
const purchasePageSize = 5;

const paymentGroups = [
  {
    items: [
      { delayDays: 0, mustPay: 1000, paid: 1000, payment: t("clients_view.payments.payment_1") },
      { delayDays: 3, mustPay: 1200, paid: 1000, payment: t("clients_view.payments.payment_2") },
      { delayDays: 0, mustPay: 900, paid: 900, payment: t("clients_view.payments.payment_3") },
      { delayDays: 7, mustPay: 1500, paid: 1500, payment: t("clients_view.payments.payment_4") },
      { delayDays: 10, mustPay: 1100, paid: 800, payment: t("clients_view.payments.payment_5") },
      { delayDays: 1, mustPay: 1300, paid: 1300, payment: t("clients_view.payments.payment_6") },
    ],
    label: t("clients_view.payment_groups.tanda_1"),
    periodEnd: "30/05/2026",
    periodStart: "01/05/2026",
  },
  {
    items: [
      { delayDays: 0, mustPay: 850, paid: 850, payment: t("clients_view.payments.payment_1") },
      { delayDays: 2, mustPay: 950, paid: 850, payment: t("clients_view.payments.payment_2") },
      { delayDays: 0, mustPay: 1100, paid: 1100, payment: t("clients_view.payments.payment_3") },
      { delayDays: 5, mustPay: 1250, paid: 1000, payment: t("clients_view.payments.payment_4") },
      { delayDays: 0, mustPay: 980, paid: 980, payment: t("clients_view.payments.payment_5") },
    ],
    label: t("clients_view.payment_groups.tanda_2"),
    periodEnd: "30/06/2026",
    periodStart: "01/06/2026",
  },
  {
    items: [
      { delayDays: 4, mustPay: 700, paid: 700, payment: t("clients_view.payments.payment_1") },
      { delayDays: 0, mustPay: 760, paid: 760, payment: t("clients_view.payments.payment_2") },
      { delayDays: 8, mustPay: 820, paid: 600, payment: t("clients_view.payments.payment_3") },
      { delayDays: 1, mustPay: 900, paid: 900, payment: t("clients_view.payments.payment_4") },
      { delayDays: 0, mustPay: 950, paid: 950, payment: t("clients_view.payments.payment_5") },
    ],
    label: t("clients_view.payment_groups.tanda_3"),
    periodEnd: "30/07/2026",
    periodStart: "01/07/2026",
  },
  {
    items: [
      { delayDays: 0, mustPay: 1150, paid: 1150, payment: t("clients_view.payments.payment_1") },
      { delayDays: 0, mustPay: 990, paid: 990, payment: t("clients_view.payments.payment_2") },
      { delayDays: 6, mustPay: 1400, paid: 1200, payment: t("clients_view.payments.payment_3") },
      { delayDays: 0, mustPay: 880, paid: 880, payment: t("clients_view.payments.payment_4") },
      { delayDays: 3, mustPay: 1020, paid: 1020, payment: t("clients_view.payments.payment_5") },
    ],
    label: t("clients_view.payment_groups.purchase_1"),
    periodEnd: "15/05/2026",
    periodStart: "01/05/2026",
  },
  {
    items: [
      { delayDays: 2, mustPay: 760, paid: 760, payment: t("clients_view.payments.payment_1") },
      { delayDays: 0, mustPay: 1320, paid: 1320, payment: t("clients_view.payments.payment_2") },
      { delayDays: 0, mustPay: 640, paid: 640, payment: t("clients_view.payments.payment_3") },
      { delayDays: 9, mustPay: 1500, paid: 1300, payment: t("clients_view.payments.payment_4") },
      { delayDays: 0, mustPay: 1180, paid: 1180, payment: t("clients_view.payments.payment_5") },
    ],
    label: t("clients_view.payment_groups.purchase_2"),
    periodEnd: "31/05/2026",
    periodStart: "16/05/2026",
  },
];

const purchaseVolume = [
  { pieces: 3, purchase: t("clients_view.purchases.purchase_1"), total: 850 },
  { pieces: 5, purchase: t("clients_view.purchases.purchase_2"), total: 1400 },
  { pieces: 2, purchase: t("clients_view.purchases.purchase_3"), total: 620 },
  { pieces: 8, purchase: t("clients_view.purchases.purchase_4"), total: 2250 },
  { pieces: 6, purchase: t("clients_view.purchases.purchase_5"), total: 1780 },
  { pieces: 4, purchase: t("clients_view.purchases.purchase_6"), total: 960 },
  { pieces: 7, purchase: t("clients_view.purchases.purchase_7"), total: 2100 },
  { pieces: 3, purchase: t("clients_view.purchases.purchase_8"), total: 790 },
  { pieces: 9, purchase: t("clients_view.purchases.purchase_9"), total: 2680 },
  { pieces: 5, purchase: t("clients_view.purchases.purchase_10"), total: 1560 },
  { pieces: 2, purchase: t("clients_view.purchases.purchase_11"), total: 540 },
  { pieces: 6, purchase: t("clients_view.purchases.purchase_12"), total: 1880 },
  { pieces: 4, purchase: t("clients_view.purchases.purchase_13"), total: 1120 },
  { pieces: 8, purchase: t("clients_view.purchases.purchase_14"), total: 2340 },
  { pieces: 5, purchase: t("clients_view.purchases.purchase_15"), total: 1640 },
  { pieces: 3, purchase: t("clients_view.purchases.purchase_16"), total: 870 },
  { pieces: 7, purchase: t("clients_view.purchases.purchase_17"), total: 2050 },
  { pieces: 4, purchase: t("clients_view.purchases.purchase_18"), total: 1180 },
  { pieces: 6, purchase: t("clients_view.purchases.purchase_19"), total: 1760 },
  { pieces: 5, purchase: t("clients_view.purchases.purchase_20"), total: 1490 },
];

const categoryPreference = [
  { color: "#6366f1", name: t("clients_view.categories.electronics"), value: 115200 },
  { color: "#ec4899", name: t("clients_view.categories.home"), value: 72400 },
  { color: "#f59e0b", name: t("clients_view.categories.fashion"), value: 51340 },
  { color: "#38bdf8", name: t("clients_view.categories.beauty"), value: 30780 },
  { color: "#8b5cf6", name: t("clients_view.categories.sports"), value: 17730 },
];

const moneyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  maximumFractionDigits: 0,
  style: "currency",
});

const compactMoneyFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const totalCategoryPreference = categoryPreference.reduce(
  (total, item) => total + item.value,
  0,
);

export function ClientsPage() {
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [clientPage, setClientPage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);
  const [selectedPaymentGroup, setSelectedPaymentGroup] = useState(paymentGroups[0].label);

  const selectedClient = useMemo(
    () => clients.find((client) => client.name === selectedClientName) ?? null,
    [selectedClientName],
  );
  const title = selectedClient
    ? t("clients_view.title_selected", { name: selectedClient.name })
    : t("clients_view.title_default");
  const status = selectedClient?.status ?? t("clients_view.status.good");
  const statusStyles = getStatusStyles(status);
  const clientPageCount = Math.max(1, Math.ceil(clients.length / clientPageSize));
  const visibleClients = useMemo(() => {
    const start = (clientPage - 1) * clientPageSize;
    return clients.slice(start, start + clientPageSize);
  }, [clientPage]);
  const paymentGroup =
    paymentGroups.find((group) => group.label === selectedPaymentGroup) ?? paymentGroups[0];
  const visiblePaymentCompliance = paymentGroup.items.slice(0, 5);
  const purchasePageCount = Math.max(1, Math.ceil(purchaseVolume.length / purchasePageSize));
  const purchaseStart = (purchasePage - 1) * purchasePageSize;
  const purchaseEnd = Math.min(purchaseStart + purchasePageSize, purchaseVolume.length);
  const visiblePurchaseVolume = purchaseVolume.slice(purchaseStart, purchaseEnd);

  return (
    <>
      <section className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">{title}</h1>
        </div>

        <article
          className={cn(
            "w-full rounded-3xl border p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:w-64",
            statusStyles.card,
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("grid size-11 place-items-center rounded-2xl", statusStyles.icon)}>
              <CheckCircle2 aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">
                {t("clients_view.status_label")}
              </p>
              <p className={cn("text-xl font-semibold", statusStyles.text)}>{status}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <article className="rounded-3xl border border-white/10 bg-white/4.5 p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                <UsersRound aria-hidden="true" className="size-5" />
              </div>
              <h2 className="text-xl font-semibold">{t("clients_view.clients_table.title")}</h2>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/4.5 p-1">
              <button
                aria-label={t("clients_view.clients_table.pagination.previous")}
                className="grid size-5 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={clientPage === 1}
                onClick={() => setClientPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <span className="min-w-8 text-center text-xs font-semibold text-neutral-300">
                {clientPage}
              </span>
              <button
                aria-label={t("clients_view.clients_table.pagination.next")}
                className="grid size-5 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={clientPage === clientPageCount}
                onClick={() => setClientPage((current) => Math.min(clientPageCount, current + 1))}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-[15rem] w-full border-collapse text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-4 font-semibold">
                      {t("clients_view.clients_table.columns.name")}
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      {t("clients_view.clients_table.columns.purchase_status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {visibleClients.map((client) => {
                    const isSelected = selectedClientName === client.name;

                    return (
                      <tr
                        className={cn(
                          "cursor-pointer transition hover:bg-white/[0.035]",
                          isSelected && "bg-violet-500/10",
                        )}
                        key={client.name}
                        onClick={() => setSelectedClientName(client.name)}
                      >
                        <td className="px-4 py-4 font-medium text-neutral-100">
                          {client.name}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={client.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <div className="grid min-w-0 gap-5">
          <ChartCard
            action={
              <select
                className="h-10 rounded-2xl border border-white/10 bg-neutral-950/80 px-3 text-sm font-medium text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
                onChange={(event) => setSelectedPaymentGroup(event.target.value)}
                value={selectedPaymentGroup}
              >
                {paymentGroups.map((group) => (
                  <option key={group.label} value={group.label}>
                    {group.label}
                  </option>
                ))}
              </select>
            }
            icon={ClipboardList}
            title={t("clients_view.charts.payment_compliance")}
          >
            <div className="h-[20rem] min-h-[20rem]">
              <ResponsiveContainer height="100%" width="100%">
                <ComposedChart
                  data={visiblePaymentCompliance}
                  margin={{ bottom: 8, left: 0, right: 0, top: 12 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis
                    axisLine={false}
                    dataKey="payment"
                    tick={{ fill: "#a3a3a3", fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "#a3a3a3", fontSize: 12 }}
                    tickFormatter={(value) =>
                      `$${compactMoneyFormatter.format(Number(value) / 1000)}k`
                    }
                    tickLine={false}
                    width={48}
                    yAxisId="money"
                  />
                  <YAxis
                    axisLine={false}
                    orientation="right"
                    tick={{ fill: "#fb923c", fontSize: 12 }}
                    tickLine={false}
                    width={34}
                    yAxisId="delay"
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ color: "#d4d4d4", fontSize: 12 }} />
                  <Bar
                    dataKey="mustPay"
                    fill="#6366f1"
                    name={t("clients_view.charts.must_pay")}
                    radius={[8, 8, 3, 3]}
                    yAxisId="money"
                  />
                  <Bar
                    dataKey="paid"
                    fill="#34d399"
                    name={t("clients_view.charts.paid")}
                    radius={[8, 8, 3, 3]}
                    yAxisId="money"
                  />
                  <Line
                    dataKey="delayDays"
                    name={t("clients_view.charts.delay_days")}
                    stroke="#fb923c"
                    strokeWidth={2.5}
                    type="monotone"
                    yAxisId="delay"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <ChartCard
              action={
                <ChartPagination
                  end={purchaseEnd}
                  nextLabel={t("clients_view.charts.purchase_pagination.next")}
                  onNext={() =>
                    setPurchasePage((current) => Math.min(purchasePageCount, current + 1))
                  }
                  onPrevious={() => setPurchasePage((current) => Math.max(1, current - 1))}
                  previousLabel={t("clients_view.charts.purchase_pagination.previous")}
                  start={purchaseStart + 1}
                  total={purchaseVolume.length}
                />
              }
              icon={ClipboardList}
              title={t("clients_view.charts.purchase_volume")}
            >
              <div className="h-72 min-h-72">
                <ResponsiveContainer height="100%" width="100%">
                  <ComposedChart
                    data={visiblePurchaseVolume}
                    margin={{ bottom: 8, left: 0, right: 0, top: 12 }}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                    <XAxis
                      axisLine={false}
                      dataKey="purchase"
                      tick={{ fill: "#a3a3a3", fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tick={{ fill: "#a3a3a3", fontSize: 12 }}
                      tickLine={false}
                      width={34}
                      yAxisId="pieces"
                    />
                    <YAxis
                      axisLine={false}
                      orientation="right"
                      tick={{ fill: "#fb923c", fontSize: 12 }}
                      tickFormatter={(value) =>
                        `$${compactMoneyFormatter.format(Number(value) / 1000)}k`
                      }
                      tickLine={false}
                      width={44}
                      yAxisId="total"
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ color: "#d4d4d4", fontSize: 12 }} />
                    <Bar
                      dataKey="pieces"
                      fill="#6366f1"
                      name={t("clients_view.charts.pieces")}
                      radius={[8, 8, 3, 3]}
                      yAxisId="pieces"
                    />
                    <Line
                      dataKey="total"
                      name={t("clients_view.charts.purchase_total")}
                      stroke="#fb923c"
                      strokeWidth={2.5}
                      type="monotone"
                      yAxisId="total"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-neutral-400">
                {t("clients_view.charts.period_text", {
                  end: paymentGroup.periodEnd,
                  start: paymentGroup.periodStart,
                })}
              </p>
            </ChartCard>

            <ChartCard title={t("clients_view.charts.category_preference")}>
              <div className="grid gap-5 md:grid-cols-[minmax(12rem,0.95fr)_minmax(12rem,1fr)] lg:grid-cols-1 2xl:grid-cols-[minmax(12rem,0.95fr)_minmax(12rem,1fr)]">
                <div className="relative mx-auto h-60 min-h-60 w-full max-w-[17rem]">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart margin={{ bottom: 8, left: 8, right: 8, top: 8 }}>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={categoryPreference}
                        dataKey="value"
                        innerRadius="48%"
                        outerRadius="72%"
                        paddingAngle={3}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={2}
                      >
                        {categoryPreference.map((entry) => (
                          <Cell fill={entry.color} key={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <p className="text-xs text-neutral-500">
                        {t("clients_view.charts.category_total")}
                      </p>
                      <p className="text-sm font-semibold">
                        {moneyFormatter.format(totalCategoryPreference)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 self-center">
                  {categoryPreference.map((item) => (
                    <div
                      className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm"
                      key={item.name}
                    >
                      <div className="flex items-center gap-2 text-neutral-300">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                      <p className="text-right font-medium">
                        {moneyFormatter.format(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </section>
    </>
  );
}

function ChartCard({
  action,
  children,
  icon: Icon,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  icon?: typeof ClipboardList;
  title: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
              <Icon aria-hidden="true" className="size-5" />
            </div>
          ) : null}
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}

function ChartPagination({
  end,
  nextLabel,
  onNext,
  onPrevious,
  previousLabel,
  start,
  total,
}: {
  end: number;
  nextLabel: string;
  onNext: () => void;
  onPrevious: () => void;
  previousLabel: string;
  start: number;
  total: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1">
      <span className="px-2 text-xs font-semibold text-neutral-300">
        {t("clients_view.charts.purchase_pagination.range", {
          end,
          start,
          total,
        })}
      </span>
      <button
        aria-label={previousLabel}
        className="grid size-7 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={start <= 1}
        onClick={onPrevious}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-3.5" />
      </button>
      <button
        aria-label={nextLabel}
        className="grid size-7 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={end >= total}
        onClick={onNext}
        type="button"
      >
        <ChevronRight aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ name?: string; value?: number }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/95 px-4 py-3 text-sm shadow-2xl shadow-black/30">
      {label ? <p className="mb-2 font-medium text-white">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <p className="text-neutral-300" key={`${item.name}-${item.value}`}>
            <span className="text-violet-200">{item.name}: </span>
            {formatTooltipValue(item.name, Number(item.value ?? 0))}
          </p>
        ))}
      </div>
    </div>
  );
}

function formatTooltipValue(name: string | undefined, value: number) {
  if (
    name === t("clients_view.charts.delay_days") ||
    name === t("clients_view.charts.pieces")
  ) {
    return compactMoneyFormatter.format(value);
  }

  return moneyFormatter.format(value);
}

function StatusBadge({ status }: { status: string }) {
  const styles = getStatusStyles(status);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles.badge,
      )}
    >
      {status}
    </span>
  );
}

function getStatusStyles(status: string) {
  const styles: Record<
    string,
    {
      badge: string;
      card: string;
      icon: string;
      text: string;
    }
  > = {
    [t("clients_view.status.bad")]: {
      badge: "border-rose-400/25 bg-rose-500/10 text-rose-200",
      card: "border-rose-400/20 bg-rose-500/[0.055]",
      icon: "bg-rose-500/15 text-rose-200",
      text: "text-rose-200",
    },
    [t("clients_view.status.good")]: {
      badge: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
      card: "border-emerald-400/20 bg-emerald-500/[0.055]",
      icon: "bg-emerald-500/15 text-emerald-200",
      text: "text-emerald-200",
    },
    [t("clients_view.status.regular")]: {
      badge: "border-amber-400/25 bg-amber-500/10 text-amber-200",
      card: "border-amber-400/20 bg-amber-500/[0.055]",
      icon: "bg-amber-500/15 text-amber-200",
      text: "text-amber-200",
    },
  };

  return (
    styles[status] ?? {
      badge: "border-white/10 bg-white/5 text-neutral-300",
      card: "border-white/10 bg-white/[0.045]",
      icon: "bg-white/10 text-neutral-200",
      text: "text-neutral-200",
    }
  );
}
