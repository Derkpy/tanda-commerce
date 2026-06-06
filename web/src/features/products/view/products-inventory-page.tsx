import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { isAxiosError } from "axios";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  Pencil,
  Plus,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import {
  inventoryApi,
  type CategoryDto,
  type ProductDto,
  type ProductGroupDto,
} from "@/features/products/api/inventory.api";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

type TableColumn = {
  key: string;
  label: string;
};

type TableRow = {
  id: number;
  values: Record<string, string>;
};

type DialogState =
  | { entity: "group"; mode: "create" | "edit" }
  | { entity: "category"; mode: "create" | "edit" }
  | { entity: "product"; mode: "create" | "edit" }
  | null;

type InventoryEntity = "group" | "category" | "product";

type DeleteDialogState = {
  entity: InventoryEntity;
  step: "warning" | "confirm";
} | null;

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
const productPageSize = 10;
const moneyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

export function ProductsInventoryPage() {
  const [groups, setGroups] = useState<ProductGroupDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [formName, setFormName] = useState("");
  const [formGroupId, setFormGroupId] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedGroup = groups.find((group) => group.idGroup === selectedGroupId) ?? null;
  const selectedCategory =
    categories.find((category) => category.idCategory === selectedCategoryId) ?? null;
  const selectedProduct =
    products.find((product) => product.idProduct === selectedProductId) ?? null;
  const categoriesBySelectedGroup = categories.filter(
    (category) => String(category.idGroup) === formGroupId,
  );

  const groupRows = useMemo<TableRow[]>(
    () =>
      groups.map((group) => ({
        id: group.idGroup,
        values: {
          id: formatGroupId(group.idGroup),
          name: group.groupName,
        },
      })),
    [groups],
  );
  const categoryRows = useMemo<TableRow[]>(
    () =>
      categories.map((category) => ({
        id: category.idCategory,
        values: {
          id: formatCategoryId(category.idCategory),
          idGroup: formatGroupId(category.idGroup),
          name: category.categoryName,
        },
      })),
    [categories],
  );
  const productRows = useMemo<TableRow[]>(
    () =>
      products.map((product) => ({
        id: product.idProduct,
        values: {
          id: product.code,
          idCategory: formatCategoryId(product.idCategory),
          name: product.nameProducts,
          price: formatProductPrice(product.priceProduct),
        },
      })),
    [products],
  );

  const loadInventory = async () => {
    setError(null);
    setIsLoading(true);

    const [nextGroupsResult, nextCategoriesResult, nextProductsResult] = await Promise.allSettled([
      inventoryApi.listGroups(),
      inventoryApi.listCategories(),
      inventoryApi.listProducts(),
    ]);

    if (nextGroupsResult.status === "fulfilled") {
      const nextGroups = nextGroupsResult.value;

      setGroups(nextGroups);
      setSelectedGroupId((current) =>
        current && nextGroups.some((group) => group.idGroup === current) ? current : null,
      );
    }

    if (nextCategoriesResult.status === "fulfilled") {
      const nextCategories = nextCategoriesResult.value;

      setCategories(nextCategories);
      setSelectedCategoryId((current) =>
        current && nextCategories.some((category) => category.idCategory === current)
          ? current
          : null,
      );
    }

    if (nextProductsResult.status === "fulfilled") {
      const nextProducts = nextProductsResult.value;

      setProducts(nextProducts);
      setSelectedProductId((current) =>
        current && nextProducts.some((product) => product.idProduct === current) ? current : null,
      );
    }

    const failedResult = [nextGroupsResult, nextCategoriesResult, nextProductsResult].find(
      (result) => result.status === "rejected",
    );

    if (failedResult?.status === "rejected") {
      setError(getInventoryErrorMessage(failedResult.reason));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const openCreateDialog = (entity: Exclude<DialogState, null>["entity"]) => {
    const defaultCategory = categories[0];
    const defaultGroup =
      entity === "product" && defaultCategory
        ? groups.find((group) => group.idGroup === defaultCategory.idGroup) ?? groups[0]
        : groups[0];

    setDialog({ entity, mode: "create" });
    setFormName("");
    setFormGroupId(defaultGroup ? String(defaultGroup.idGroup) : "");
    setFormCategoryId(defaultCategory ? String(defaultCategory.idCategory) : "");
    setFormPrice("");
    setError(null);
  };

  const openEditDialog = (entity: Exclude<DialogState, null>["entity"]) => {
    if (entity === "group" && selectedGroup) {
      setDialog({ entity, mode: "edit" });
      setFormName(selectedGroup.groupName);
      setError(null);
    }

    if (entity === "category" && selectedCategory) {
      setDialog({ entity, mode: "edit" });
      setFormName(selectedCategory.categoryName);
      setError(null);
    }

    if (entity === "product" && selectedProduct) {
      setDialog({ entity, mode: "edit" });
      setFormName(selectedProduct.nameProducts);
      setFormPrice(selectedProduct.priceProduct === null ? "" : String(selectedProduct.priceProduct));
      setError(null);
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setIsSaving(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dialog) {
      return;
    }

    if (!formName.trim()) {
      setError(t("inventory.messages.name_required"));
      return;
    }

    if (dialog.entity === "category" && dialog.mode === "create" && !formGroupId) {
      setError(t("inventory.messages.group_required"));
      return;
    }

    if (dialog.entity === "product" && dialog.mode === "create" && !formCategoryId) {
      setError(t("inventory.messages.category_required"));
      return;
    }

    if (formPrice.trim() && !/^\d+(\.\d{1,2})?$/.test(formPrice.trim())) {
      setError(t("inventory.messages.invalid_price"));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (dialog.entity === "group") {
        if (dialog.mode === "create") {
          await inventoryApi.createGroup({ groupName: formName.trim() });
        } else if (selectedGroup) {
          await inventoryApi.updateGroup(selectedGroup.idGroup, { groupName: formName.trim() });
        }
      }

      if (dialog.entity === "category") {
        if (dialog.mode === "create") {
          await inventoryApi.createCategory({
            idGroup: Number(formGroupId),
            categoryName: formName.trim(),
          });
        } else if (selectedCategory) {
          await inventoryApi.updateCategory(selectedCategory.idCategory, {
            categoryName: formName.trim(),
          });
        }
      }

      if (dialog.entity === "product") {
        const priceProduct = formPrice.trim() ? formPrice.trim() : null;

        if (dialog.mode === "create") {
          await inventoryApi.createProduct({
            idCategory: Number(formCategoryId),
            nameProducts: formName.trim(),
            priceProduct,
          });
        } else if (selectedProduct) {
          await inventoryApi.updateProduct(selectedProduct.idProduct, {
            nameProducts: formName.trim(),
            priceProduct,
          });
        }
      }

      closeDialog();
      await loadInventory();
    } catch (requestError) {
      setError(getInventoryErrorMessage(requestError));
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (entity: InventoryEntity) => {
    if (!getDeleteTarget(entity, selectedGroup, selectedCategory, selectedProduct)) {
      return;
    }

    setDeleteConfirmationName("");
    setDeleteDialog({
      entity,
      step: entity === "product" ? "confirm" : "warning",
    });
    setError(null);
  };

  const closeDeleteDialog = () => {
    setDeleteDialog(null);
    setDeleteConfirmationName("");
    setIsDeleting(false);
  };

  const continueDeleteDialog = () => {
    if (!deleteDialog) {
      return;
    }

    setDeleteDialog({ ...deleteDialog, step: "confirm" });
  };

  const handleDelete = async () => {
    if (!deleteDialog) {
      return;
    }

    const target = getDeleteTarget(deleteDialog.entity, selectedGroup, selectedCategory, selectedProduct);

    if (!target) {
      closeDeleteDialog();
      return;
    }

    if (
      deleteDialog.entity === "group" &&
      deleteConfirmationName.trim() !== target.name
    ) {
      setError(t("inventory.messages.delete_name_mismatch"));
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      if (deleteDialog.entity === "group" && selectedGroup) {
        await inventoryApi.deleteGroup(selectedGroup.idGroup);
      }

      if (deleteDialog.entity === "category" && selectedCategory) {
        await inventoryApi.deleteCategory(selectedCategory.idCategory);
      }

      if (deleteDialog.entity === "product" && selectedProduct) {
        await inventoryApi.deleteProduct(selectedProduct.idProduct);
      }

      closeDeleteDialog();
      await loadInventory();
    } catch (requestError) {
      setError(getInventoryErrorMessage(requestError));
      setIsDeleting(false);
    }
  };

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

      {error ? (
        <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <InventoryTableCard
          addButtonCompact
          actionLabel={t("inventory.groups.add")}
          columns={groupColumns}
          icon={<Boxes aria-hidden="true" className="size-5" />}
          isLoading={isLoading}
          minWidth="min-w-[25rem]"
          onAdd={() => openCreateDialog("group")}
          onDelete={() => openDeleteDialog("group")}
          onEdit={() => openEditDialog("group")}
          onSelect={setSelectedGroupId}
          rows={groupRows}
          selectedId={selectedGroupId}
          title={t("inventory.groups.title")}
        />
        <InventoryTableCard
          addButtonCompact
          actionLabel={t("inventory.categories.add")}
          canAdd={groups.length > 0}
          columns={categoryColumns}
          icon={<Tags aria-hidden="true" className="size-5" />}
          isLoading={isLoading}
          minWidth="min-w-[34rem]"
          onAdd={() => openCreateDialog("category")}
          onDelete={() => openDeleteDialog("category")}
          onEdit={() => openEditDialog("category")}
          onSelect={setSelectedCategoryId}
          rows={categoryRows}
          selectedId={selectedCategoryId}
          title={t("inventory.categories.title")}
        />
      </section>

      <InventoryTableCard
        actionLabel={t("inventory.products.add")}
        canAdd={groups.length > 0 && categories.length > 0}
        className="mt-5"
        columns={productColumns}
        icon={<PackagePlus aria-hidden="true" className="size-5" />}
        isLoading={isLoading}
        minWidth="min-w-[760px]"
        onAdd={() => openCreateDialog("product")}
        onDelete={() => openDeleteDialog("product")}
        onEdit={() => openEditDialog("product")}
        onSelect={setSelectedProductId}
        pageSize={productPageSize}
        rows={productRows}
        selectedId={selectedProductId}
        title={t("inventory.products.title")}
      />

      {dialog ? (
        <InventoryDialog
          dialog={dialog}
          formCategoryId={formCategoryId}
          formGroupId={formGroupId}
          formName={formName}
          formPrice={formPrice}
          groups={groups}
          isSaving={isSaving}
          onCategoryChange={setFormCategoryId}
          onClose={closeDialog}
          onGroupChange={(nextGroupId) => {
            const nextCategory = categories.find(
              (category) => String(category.idGroup) === nextGroupId,
            );

            setFormGroupId(nextGroupId);
            setFormCategoryId(nextCategory ? String(nextCategory.idCategory) : "");
          }}
          onNameChange={setFormName}
          onPriceChange={setFormPrice}
          onSubmit={handleSubmit}
          selectedGroupCategories={categoriesBySelectedGroup}
        />
      ) : null}

      {deleteDialog ? (
        <DeleteInventoryDialog
          confirmationName={deleteConfirmationName}
          dialog={deleteDialog}
          isDeleting={isDeleting}
          onCancel={closeDeleteDialog}
          onConfirm={() => void handleDelete()}
          onContinue={continueDeleteDialog}
          onConfirmationNameChange={setDeleteConfirmationName}
          target={getDeleteTarget(
            deleteDialog.entity,
            selectedGroup,
            selectedCategory,
            selectedProduct,
          )}
        />
      ) : null}
    </>
  );
}

function InventoryTableCard({
  actionLabel,
  addButtonCompact = false,
  canAdd = true,
  className,
  columns,
  icon,
  isLoading,
  minWidth,
  onAdd,
  onDelete,
  onEdit,
  onSelect,
  pageSize = tablePageSize,
  rows,
  selectedId,
  title,
}: {
  actionLabel: string;
  addButtonCompact?: boolean;
  canAdd?: boolean;
  className?: string;
  columns: TableColumn[];
  icon: ReactNode;
  isLoading: boolean;
  minWidth: string;
  onAdd: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: (id: number) => void;
  pageSize?: number;
  rows: TableRow[];
  selectedId: number | null;
  title: string;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = rows.length === 0 ? 0 : (page - 1) * pageSize;
  const end = Math.min(start + pageSize, rows.length);
  const visibleRows = rows.slice(start, end);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <article
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
            {icon}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="ml-auto flex shrink-0 flex-nowrap items-center justify-end gap-1.5">
          <SecondaryActionButton ariaLabel={`${t("inventory.actions.edit")} ${title}`} disabled={!selectedId} onClick={onEdit}>
            <Pencil aria-hidden="true" className="size-3.5" />
            {t("inventory.actions.edit")}
          </SecondaryActionButton>
          <DangerActionButton ariaLabel={`${t("inventory.actions.delete")} ${title}`} disabled={!selectedId} onClick={onDelete}>
            <Trash2 aria-hidden="true" className="size-3.5" />
            {t("inventory.actions.delete")}
          </DangerActionButton>
          <ActionButton
            ariaLabel={`${actionLabel} ${title}`}
            compact={addButtonCompact}
            disabled={!canAdd}
            onClick={onAdd}
          >
            {actionLabel}
          </ActionButton>
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
              {isLoading ? (
                <tr>
                  <td className="px-5 py-5 text-neutral-400" colSpan={columns.length}>
                    {t("inventory.messages.loading")}
                  </td>
                </tr>
              ) : null}
              {!isLoading && visibleRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-5 text-neutral-400" colSpan={columns.length}>
                    {t("inventory.messages.empty")}
                  </td>
                </tr>
              ) : null}
              {!isLoading
                ? visibleRows.map((row) => (
                    <tr
                      className={cn(
                        "cursor-pointer transition hover:bg-white/[0.035]",
                        selectedId === row.id && "bg-violet-500/10",
                      )}
                      key={row.id}
                      onClick={() => onSelect(row.id)}
                    >
                      {columns.map((column) => (
                        <td className="px-5 py-4 text-neutral-300" key={column.key}>
                          {row.values[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-neutral-400">
        <p>
          {t("inventory.pagination.range", {
            end,
            start: rows.length === 0 ? 0 : start + 1,
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

function InventoryDialog({
  dialog,
  formCategoryId,
  formGroupId,
  formName,
  formPrice,
  groups,
  isSaving,
  onCategoryChange,
  onClose,
  onGroupChange,
  onNameChange,
  onPriceChange,
  onSubmit,
  selectedGroupCategories,
}: {
  dialog: Exclude<DialogState, null>;
  formCategoryId: string;
  formGroupId: string;
  formName: string;
  formPrice: string;
  groups: ProductGroupDto[];
  isSaving: boolean;
  onCategoryChange: (value: string) => void;
  onClose: () => void;
  onGroupChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  selectedGroupCategories: CategoryDto[];
}) {
  const isCreate = dialog.mode === "create";
  const titleKey = `inventory.dialog.${dialog.entity}.${dialog.mode}_title`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <form
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#090c19]/95 p-5 shadow-2xl shadow-black/40"
        onSubmit={onSubmit}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{t(titleKey)}</h2>
          <button
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          {dialog.entity === "category" && isCreate ? (
            <Field label={t("inventory.dialog.group_label")}>
              <select
                className={inputClassName}
                onChange={(event) => onGroupChange(event.target.value)}
                value={formGroupId}
              >
                {groups.map((group) => (
                  <option key={group.idGroup} value={group.idGroup}>
                    {group.groupName}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          {dialog.entity === "product" && isCreate ? (
            <>
              <Field label={t("inventory.dialog.group_label")}>
                <select
                  className={inputClassName}
                  onChange={(event) => onGroupChange(event.target.value)}
                  value={formGroupId}
                >
                  {groups.map((group) => (
                    <option key={group.idGroup} value={group.idGroup}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("inventory.dialog.category_label")}>
                <select
                  className={inputClassName}
                  onChange={(event) => onCategoryChange(event.target.value)}
                  value={formCategoryId}
                >
                  {selectedGroupCategories.map((category) => (
                    <option key={category.idCategory} value={category.idCategory}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}

          <Field label={t("inventory.dialog.name_label")}>
            <input
              className={inputClassName}
              onChange={(event) => onNameChange(event.target.value)}
              value={formName}
            />
          </Field>

          {dialog.entity === "product" ? (
            <Field label={t("inventory.dialog.price_label")}>
              <input
                className={inputClassName}
                inputMode="decimal"
                onChange={(event) => onPriceChange(event.target.value)}
                placeholder={t("inventory.dialog.price_placeholder")}
                value={formPrice}
              />
            </Field>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-neutral-200 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            {t("inventory.dialog.cancel")}
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? t("inventory.dialog.saving") : t("inventory.dialog.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteInventoryDialog({
  confirmationName,
  dialog,
  isDeleting,
  onCancel,
  onConfirm,
  onConfirmationNameChange,
  onContinue,
  target,
}: {
  confirmationName: string;
  dialog: Exclude<DeleteDialogState, null>;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onConfirmationNameChange: (value: string) => void;
  onContinue: () => void;
  target: DeleteTarget | null;
}) {
  if (!target) {
    return null;
  }

  const tableName = getDeleteTableName(dialog.entity);
  const isGroupConfirmationValid =
    dialog.entity !== "group" || confirmationName.trim() === target.name;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090c19]/95 p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">
            {dialog.step === "warning"
              ? t("inventory.delete.warning_title")
              : t("inventory.delete.confirm_title")}
          </h2>
          <button
            aria-label={t("inventory.delete.cancel")}
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/10 hover:text-white"
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        {dialog.step === "warning" ? (
          <p className="text-sm leading-6 text-neutral-300">
            {t("inventory.delete.warning_text", {
              rowName: target.name,
              tableName,
            })}
          </p>
        ) : null}

        {dialog.step === "confirm" && dialog.entity === "group" ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-neutral-300">
              {t("inventory.delete.group_confirm_text", {
                rowName: target.name,
              })}
            </p>
            <Field label={t("inventory.delete.group_confirm_label")}>
              <input
                className={inputClassName}
                onChange={(event) => onConfirmationNameChange(event.target.value)}
                placeholder={target.name}
                value={confirmationName}
              />
            </Field>
          </div>
        ) : null}

        {dialog.step === "confirm" && dialog.entity === "category" ? (
          <p className="text-sm leading-6 text-neutral-300">
            {t("inventory.delete.category_confirm_prefix")}{" "}
            <span className="font-semibold text-rose-300">{target.name}</span>{" "}
            {t("inventory.delete.category_confirm_suffix")}
          </p>
        ) : null}

        {dialog.step === "confirm" && dialog.entity === "product" ? (
          <p className="text-sm leading-6 text-neutral-300">
            {t("inventory.delete.product_confirm_text", {
              rowName: target.name,
            })}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-neutral-200 transition hover:bg-white/10"
            onClick={onCancel}
            type="button"
          >
            {t("inventory.delete.cancel")}
          </button>
          {dialog.step === "warning" ? (
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500"
              onClick={onContinue}
              type="button"
            >
              {t("inventory.delete.continue")}
            </button>
          ) : (
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isGroupConfirmationValid || isDeleting}
              onClick={onConfirm}
              type="button"
            >
              {isDeleting ? t("inventory.delete.deleting") : t("inventory.delete.delete")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-neutral-300">{label}</span>
      {children}
    </label>
  );
}

function SecondaryActionButton({
  ariaLabel,
  children,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-neutral-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function DangerActionButton({
  ariaLabel,
  children,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ActionButton({
  ariaLabel,
  children,
  compact = false,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  compact?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40",
        compact ? "px-2.5" : "px-3",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Plus aria-hidden="true" className="size-3.5" />
      {children}
    </button>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-neutral-950/60 px-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20";

const formatGroupId = (id: number) => `GRP-${String(id).padStart(3, "0")}`;
const formatCategoryId = (id: number) => `CAT-${String(id).padStart(3, "0")}`;
const formatProductPrice = (value: string | number | null) => {
  if (value === null) {
    return t("inventory.products.no_price");
  }

  return moneyFormatter.format(Number(value));
};

type DeleteTarget = {
  name: string;
};

const getDeleteTarget = (
  entity: InventoryEntity,
  selectedGroup: ProductGroupDto | null,
  selectedCategory: CategoryDto | null,
  selectedProduct: ProductDto | null,
): DeleteTarget | null => {
  if (entity === "group" && selectedGroup) {
    return { name: selectedGroup.groupName };
  }

  if (entity === "category" && selectedCategory) {
    return { name: selectedCategory.categoryName };
  }

  if (entity === "product" && selectedProduct) {
    return { name: selectedProduct.nameProducts };
  }

  return null;
};

const getDeleteTableName = (entity: InventoryEntity) => {
  if (entity === "group") {
    return t("inventory.groups.title");
  }

  if (entity === "category") {
    return t("inventory.categories.title");
  }

  return t("inventory.products.title");
};

function getInventoryErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const message = error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }
  }

  return t("inventory.messages.generic_error");
}
