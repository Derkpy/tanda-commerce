import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  Clock3,
  UsersRound,
} from "lucide-react";
import { useAuthStore } from "../model/auth.store";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

const chartRanges = [
  t("dashboard.charts.ranges.this_month"),
  t("dashboard.charts.ranges.quarter"),
  t("dashboard.charts.ranges.this_year"),
] as const;
const pageSizeOptions = [5, 10, 15, 25, 50] as const;

const categorySales = [
  { name: "Ropa", value: 48200, color: "#8b5cf6" },
  { name: "Calzado", value: 31800, color: "#6366f1" },
  { name: "Bolsos", value: 18450, color: "#ec4899" },
  { name: "Accesorios", value: 11900, color: "#38bdf8" },
  { name: "Otros", value: 7250, color: "#f59e0b" },
];

const monthlySales = [
  { month: t("dashboard.charts.months.jan"), sales: 14500 },
  { month: t("dashboard.charts.months.feb"), sales: 18900 },
  { month: t("dashboard.charts.months.mar"), sales: 24400 },
  { month: t("dashboard.charts.months.apr"), sales: 28600 },
  { month: t("dashboard.charts.months.may"), sales: 31200 },
  { month: t("dashboard.charts.months.jun"), sales: 26800 },
  { month: t("dashboard.charts.months.jul"), sales: 33700 },
  { month: t("dashboard.charts.months.aug"), sales: 35800 },
  { month: t("dashboard.charts.months.sep"), sales: 30900 },
  { month: t("dashboard.charts.months.oct"), sales: 38200 },
  { month: t("dashboard.charts.months.nov"), sales: 42100 },
  { month: t("dashboard.charts.months.dec"), sales: 39800 },
];

const topClients = [
  { name: "Maria Gonzalez", total: 42850, activeTandas: 3, status: "Excelente" },
  { name: "Jose Ramirez", total: 39240, activeTandas: 2, status: "Buena" },
  { name: "Ana Lopez", total: 35670, activeTandas: 4, status: "Excelente" },
  { name: "Carlos Hernandez", total: 31990, activeTandas: 1, status: "Regular" },
  { name: "Luisa Martinez", total: 29780, activeTandas: 2, status: "Buena" },
  { name: "Fernanda Ruiz", total: 27150, activeTandas: 3, status: "Excelente" },
  { name: "Miguel Torres", total: 24890, activeTandas: 1, status: "Regular" },
  { name: "Sofia Castillo", total: 22410, activeTandas: 2, status: "Buena" },
  { name: "Daniela Perez", total: 20730, activeTandas: 1, status: "Regular" },
  { name: "Brenda Silva", total: 19650, activeTandas: 0, status: "Mala" },
  { name: "Roberto Diaz", total: 18300, activeTandas: 2, status: "Buena" },
  { name: "Itzel Moreno", total: 17280, activeTandas: 1, status: "Regular" },
];

const moneyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  maximumFractionDigits: 0,
  style: "currency",
});

const compactMoneyFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const totalCategorySales = categorySales.reduce((total, item) => total + item.value, 0);

export function ProtectedAppPage() {
  const user = useAuthStore((state) => state.user);
  const [categoryRange, setCategoryRange] = useState<(typeof chartRanges)[number]>(
    chartRanges[0],
  );
  const [monthlyRange, setMonthlyRange] = useState<(typeof chartRanges)[number]>(
    chartRanges[2],
  );
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(5);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(topClients.length / pageSize));
  const visibleClients = useMemo(() => {
    const start = (page - 1) * pageSize;
    return topClients.slice(start, start + pageSize);
  }, [page, pageSize]);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value) as (typeof pageSizeOptions)[number]);
    setPage(1);
  };

  return (
    <>
      <section className="mb-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
              {t("dashboard.summary_badge")}
            </p>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              {t("dashboard.branch_name")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
              {t("dashboard.summary_text", {
                name: user?.name ?? t("auth.fallback_user"),
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <ChartCard
          icon={BadgeDollarSign}
          onRangeChange={setCategoryRange}
          range={categoryRange}
          title={t("dashboard.charts.category_sales")}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(13rem,0.95fr)_minmax(13rem,1fr)] xl:grid-cols-[0.95fr_1fr]">
            <div className="relative mx-auto h-64 min-h-64 w-full max-w-[18rem] sm:h-72 sm:min-h-72 sm:max-w-[20rem]">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={categorySales}
                    dataKey="value"
                    innerRadius="42%"
                    outerRadius="68%"
                    paddingAngle={3}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={2}
                  >
                    {categorySales.map((entry) => (
                      <Cell fill={entry.color} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-xs text-neutral-500">{t("dashboard.charts.total")}</p>
                  <p className="text-lg font-semibold">
                    {moneyFormatter.format(totalCategorySales)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 self-center">
              {categorySales.map((item) => (
                <div
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
                  key={item.name}
                >
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <p className="font-medium">{moneyFormatter.format(item.value)}</p>
                  <p className="w-12 text-right text-neutral-500">
                    {((item.value / totalCategorySales) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          icon={Clock3}
          onRangeChange={setMonthlyRange}
          range={monthlyRange}
          title={t("dashboard.charts.monthly_sales")}
        >
          <div className="h-64 min-h-64 sm:h-72 sm:min-h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={monthlySales} margin={{ bottom: 0, left: 0, right: 8, top: 18 }}>
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#a3a3a3", fontSize: 12 }}
                  tickFormatter={(value) => `$${compactMoneyFormatter.format(Number(value) / 1000)}k`}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="sales" radius={[10, 10, 4, 4]}>
                  {monthlySales.map((item, index) => (
                    <Cell fill={index % 2 === 0 ? "#8b5cf6" : "#6366f1"} key={item.month} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                <UsersRound aria-hidden="true" className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t("dashboard.clients.title")}</h2>
                <p className="text-sm text-neutral-500">
                  {t("dashboard.clients.description")}
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-neutral-400">
            {t("dashboard.clients.show_label")}
            <select
              className="h-10 rounded-2xl border border-white/10 bg-neutral-950/80 px-3 text-sm font-medium text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
              onChange={(event) => handlePageSizeChange(event.target.value)}
              value={pageSize}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {t("dashboard.clients.clients_suffix")}
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm sm:min-w-[760px]">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    {t("dashboard.clients.columns.name")}
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    {t("dashboard.clients.columns.total")}
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    {t("dashboard.clients.columns.active_tandas")}
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    {t("dashboard.clients.columns.client_status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleClients.map((client) => (
                  <tr className="transition hover:bg-white/[0.035]" key={client.name}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-2xl bg-white/10 text-sm font-semibold">
                          {client.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <span className="font-medium text-neutral-100">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-violet-200">
                      {moneyFormatter.format(client.total)}
                    </td>
                    <td className="px-5 py-4 text-neutral-300">{client.activeTandas}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={client.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t("dashboard.clients.showing", {
              start: (page - 1) * pageSize + 1,
              end: Math.min(page * pageSize, topClients.length),
              total: topClients.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label={t("dashboard.clients.pagination.previous")}
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white">
              {page} / {pageCount}
            </span>
            <button
              aria-label={t("dashboard.clients.pagination.next")}
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function ChartCard({
  children,
  icon: Icon,
  onRangeChange,
  range,
  title,
}: {
  children: React.ReactNode;
  icon: typeof BadgeDollarSign;
  onRangeChange: (range: (typeof chartRanges)[number]) => void;
  range: (typeof chartRanges)[number];
  title: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-md transition duration-200 hover:border-violet-400/20 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <select
          className="h-10 rounded-2xl border border-white/10 bg-neutral-950/80 px-3 text-sm font-medium text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20"
          onChange={(event) => onRangeChange(event.target.value as (typeof chartRanges)[number])}
          value={range}
        >
          {chartRanges.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {children}
    </article>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; payload?: { name?: string; month?: string }; value?: number }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const label =
    item.payload?.name ?? item.payload?.month ?? item.name ?? t("dashboard.charts.sales_fallback");

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/95 px-4 py-3 text-sm shadow-2xl shadow-black/30">
      <p className="font-medium text-white">{label}</p>
      <p className="mt-1 text-violet-200">{moneyFormatter.format(Number(item.value ?? 0))}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Buena: "border-sky-400/25 bg-sky-500/10 text-sky-200",
    Excelente: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
    Mala: "border-rose-400/25 bg-rose-500/10 text-rose-200",
    Regular: "border-amber-400/25 bg-amber-500/10 text-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status] ?? "border-white/10 bg-white/5 text-neutral-300",
      )}
    >
      {status}
    </span>
  );
}
