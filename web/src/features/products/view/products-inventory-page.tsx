import { useState, type ReactNode } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

type TableColumn = {
  key: string;
  label: string;
};

type TableRow = Record<string, string>;

const groups: TableRow[] = [
  { id: "GRP-001", name: "Electrónica" },
  { id: "GRP-002", name: "Hogar" },
  { id: "GRP-003", name: "Moda" },
  { id: "GRP-004", name: "Belleza" },
  { id: "GRP-005", name: "Deportes" },
  { id: "GRP-006", name: "Calzado" },
  { id: "GRP-007", name: "Bolsos" },
  { id: "GRP-008", name: "Accesorios" },
  { id: "GRP-009", name: "Infantil" },
  { id: "GRP-010", name: "Temporada" },
];

const categories: TableRow[] = [
  { id: "CAT-001", idGroup: "GRP-001", name: "Laptops" },
  { id: "CAT-002", idGroup: "GRP-001", name: "Celulares" },
  { id: "CAT-003", idGroup: "GRP-001", name: "Televisores" },
  { id: "CAT-004", idGroup: "GRP-002", name: "Muebles" },
  { id: "CAT-005", idGroup: "GRP-002", name: "Electrodomésticos" },
  { id: "CAT-006", idGroup: "GRP-003", name: "Pantalones" },
  { id: "CAT-007", idGroup: "GRP-003", name: "Blusas" },
  { id: "CAT-008", idGroup: "GRP-006", name: "Tenis" },
  { id: "CAT-009", idGroup: "GRP-007", name: "Bolsos de mano" },
  { id: "CAT-010", idGroup: "GRP-008", name: "Cinturones" },
];

const products: TableRow[] = [
  { id: "PROD-001", idCategory: "CAT-001", name: "MacBook Air", price: "$24,999.00" },
  { id: "PROD-002", idCategory: "CAT-002", name: "iPhone 15", price: "$19,999.00" },
  {
    id: "PROD-003",
    idCategory: "CAT-003",
    name: 'Samsung 55" 4K Smart TV',
    price: "$9,499.00",
  },
  {
    id: "PROD-004",
    idCategory: "CAT-004",
    name: "Sofá Modular 3 Plazas",
    price: "$7,899.00",
  },
  {
    id: "PROD-005",
    idCategory: "CAT-005",
    name: "Refrigerador Inverter 18 pies",
    price: "$12,499.00",
  },
];

const groupColumns = [
  { key: "id", label: t("inventory.groups.columns.id") },
  { key: "name", label: t("inventory.groups.columns.name") },
];

const categoryColumns = [
  { key: "id", label: t("inventory.categories.columns.id") },
  { key: "name", label: t("inventory.categories.columns.name") },
  { key: "idGroup", label: t("inventory.categories.columns.id_group") },
];

const productColumns = [
  { key: "id", label: t("inventory.products.columns.id") },
  { key: "name", label: t("inventory.products.columns.name") },
  { key: "idCategory", label: t("inventory.products.columns.id_category") },
  { key: "price", label: t("inventory.products.columns.price") },
];

const tablePageSize = 5;

export function ProductsInventoryPage() {
  return (
    <>
      <section className="mb-7">
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          {t("inventory.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
          {t("inventory.description")}
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <InventoryTableCard
          addButtonCompact
          actionLabel={t("inventory.groups.add")}
          columns={groupColumns}
          icon={<Boxes aria-hidden="true" className="size-5" />}
          minWidth="min-w-[25rem]"
          rows={groups}
          title={t("inventory.groups.title")}
        />
        <InventoryTableCard
          addButtonCompact
          actionLabel={t("inventory.categories.add")}
          columns={categoryColumns}
          icon={<Tags aria-hidden="true" className="size-5" />}
          minWidth="min-w-[34rem]"
          rows={categories}
          title={t("inventory.categories.title")}
        />
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
              <PackagePlus aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">{t("inventory.products.title")}</h2>
          </div>
          <div className="ml-auto flex shrink-0 flex-nowrap items-center justify-end gap-1.5">
            <SecondaryActionButton>
              <Pencil aria-hidden="true" className="size-3.5" />
              {t("inventory.actions.edit")}
            </SecondaryActionButton>
            <DangerActionButton>
              <Trash2 aria-hidden="true" className="size-3.5" />
              {t("inventory.actions.delete")}
            </DangerActionButton>
            <ActionButton>{t("inventory.products.add")}</ActionButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  {productColumns.map((column) => (
                    <th className="px-5 py-4 font-semibold" key={column.key}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {products.map((row) => (
                  <tr className="transition hover:bg-white/[0.035]" key={row.id}>
                    {productColumns.map((column) => (
                      <td className="px-5 py-4 text-neutral-300" key={column.key}>
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("inventory.products.showing")}</p>
          <div className="flex items-center gap-2">
            <button
              aria-label={t("inventory.products.pagination.previous")}
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <span className="rounded-full border border-violet-400/30 bg-gradient-to-r from-violet-500/30 to-indigo-500/20 px-4 py-2 text-white shadow-xl shadow-violet-950/30">
              1
            </span>
            <span className="rounded-full px-4 py-2 text-neutral-300">2</span>
            <span className="rounded-full px-4 py-2 text-neutral-300">3</span>
            <span className="rounded-full px-2 py-2 text-neutral-500">...</span>
            <span className="rounded-full px-4 py-2 text-neutral-300">6</span>
            <button
              aria-label={t("inventory.products.pagination.next")}
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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

function InventoryTableCard({
  addButtonCompact = false,
  actionLabel,
  columns,
  icon,
  minWidth,
  rows,
  title,
}: {
  addButtonCompact?: boolean;
  actionLabel: string;
  columns: TableColumn[];
  icon: ReactNode;
  minWidth: string;
  rows: TableRow[];
  title: string;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / tablePageSize));
  const start = (page - 1) * tablePageSize;
  const end = Math.min(start + tablePageSize, rows.length);
  const visibleRows = rows.slice(start, end);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
            {icon}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="ml-auto flex shrink-0 flex-nowrap items-center justify-end gap-1.5">
          <SecondaryActionButton>
            <Pencil aria-hidden="true" className="size-3.5" />
            {t("inventory.actions.edit")}
          </SecondaryActionButton>
          <DangerActionButton>
            <Trash2 aria-hidden="true" className="size-3.5" />
            {t("inventory.actions.delete")}
          </DangerActionButton>
          <ActionButton compact={addButtonCompact}>{actionLabel}</ActionButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className={`${minWidth} w-full border-collapse text-left text-sm`}>
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                {columns.map((column) => (
                  <th className="px-5 py-4 font-semibold" key={column.key}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visibleRows.map((row) => (
                <tr className="transition hover:bg-white/[0.035]" key={row.id}>
                  {columns.map((column) => (
                    <td className="px-5 py-4 text-neutral-300" key={column.key}>
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-neutral-400">
        <p>
          {t("inventory.pagination.range", {
            end,
            start: start + 1,
            total: rows.length,
          })}
        </p>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            aria-label={t("inventory.pagination.previous")}
            className="grid size-7 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-3.5" />
          </button>
          <span className="min-w-7 text-center font-semibold text-neutral-300">{page}</span>
          <button
            aria-label={t("inventory.pagination.next")}
            className="grid size-7 place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SecondaryActionButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-neutral-200 transition hover:bg-white/10"
      type="button"
    >
      {children}
    </button>
  );
}

function DangerActionButton({ children }: { children: ReactNode }) {
  return (
    <button
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/15"
      type="button"
    >
      {children}
    </button>
  );
}

function ActionButton({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500",
        compact ? "px-2.5" : "px-3",
      )}
      type="button"
    >
      <Plus aria-hidden="true" className="size-3.5" />
      {children}
    </button>
  );
}
