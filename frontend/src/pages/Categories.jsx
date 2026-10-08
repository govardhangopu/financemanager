import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import {
    addCategory,
    updateCategory,
    deleteCategory
} from "../api/categoriesApi";
import "../styles/Categories.css";

export default function Categories() {
    const {
        categories,
        categoriesLoading,
        refreshCategories
    } = useFinance();

    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [parentForNewCategory, setParentForNewCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [error, setError] = useState("");

    const incomeCategories = useMemo(
        () => categories.filter(category => category.type === "income"),
        [categories]
    );

    const expenseCategories = useMemo(
        () => categories.filter(category => category.type === "expense"),
        [categories]
    );

    const openCreate = (parent = null) => {
        setError("");
        setEditingCategory(null);
        setParentForNewCategory(parent);
        setShowForm(true);
    };

    const openEdit = (category) => {
        setError("");
        setParentForNewCategory(null);
        setEditingCategory(category);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setParentForNewCategory(null);
        setError("");
    };

    const handleSave = async (data) => {
        try {
            setError("");

            if (editingCategory) {
                await updateCategory({
                    categoryid: editingCategory.categoryid,
                    ...data
                });
            } else {
                await addCategory(data);
            }

            await refreshCategories();
            closeForm();
        } catch (err) {
            console.error("Error saving category:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to save category."
            );
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;

        try {
            setError("");

            await deleteCategory(deletingCategory.categoryid);
            await refreshCategories();

            setDeletingCategory(null);
        } catch (err) {
            console.error("Error deleting category:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete category."
            );

            setDeletingCategory(null);
        }
    };

    return (
        <main className="categories-page">
            <div className="categories-header">
                <div>
                    <h1>Categories</h1>
                    <p>
                        Organize your income and expenses into a structure that
                        works for you.
                    </p>
                </div>

                <button
                    className="categories-add-button"
                    onClick={() => openCreate()}
                >
                    + Add Category
                </button>
            </div>

            {error && (
                <div className="categories-error">
                    {error}
                </div>
            )}

            {categoriesLoading ? (
                <div className="categories-state">
                    Loading categories...
                </div>
            ) : categories.length === 0 ? (
                <div className="categories-empty">
                    <h2>No categories yet</h2>
                    <p>
                        Create your first category to start organizing your
                        transactions.
                    </p>

                    <button onClick={() => openCreate()}>
                        + Create Category
                    </button>
                </div>
            ) : (
                <div className="category-sections">
                    <CategorySection
                        title="Income"
                        type="income"
                        categories={incomeCategories}
                        allCategories={categories}
                        onAddChild={openCreate}
                        onEdit={openEdit}
                        onDelete={setDeletingCategory}
                    />

                    <CategorySection
                        title="Expenses"
                        type="expense"
                        categories={expenseCategories}
                        allCategories={categories}
                        onAddChild={openCreate}
                        onEdit={openEdit}
                        onDelete={setDeletingCategory}
                    />
                </div>
            )}

            {showForm && (
                <CategoryForm
                    category={editingCategory}
                    parentCategory={parentForNewCategory}
                    categories={categories}
                    onClose={closeForm}
                    onSave={handleSave}
                />
            )}

            {deletingCategory && (
                <DeleteCategoryModal
                    category={deletingCategory}
                    onCancel={() => setDeletingCategory(null)}
                    onConfirm={handleDelete}
                />
            )}
        </main>
    );
}


function CategorySection({
    title,
    type,
    categories,
    allCategories,
    onAddChild,
    onEdit,
    onDelete
}) {
    const rootCategories = categories.filter(
        category => category.parent_categoryid === null
    );

    return (
        <section className="category-section">
            <div className="category-section-header">
                <div>
                    <h2>{title}</h2>
                    <span>
                        {categories.length} categor
                        {categories.length === 1 ? "y" : "ies"}
                    </span>
                </div>

                <button
                    className="category-section-add"
                    onClick={() => onAddChild(null)}
                >
                    + Add
                </button>
            </div>

            {rootCategories.length === 0 ? (
                <div className="category-section-empty">
                    No {type} categories yet.
                </div>
            ) : (
                <div className="category-tree">
                    {rootCategories.map(category => (
                        <CategoryTreeItem
                            key={category.categoryid}
                            category={category}
                            allCategories={allCategories}
                            depth={0}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}


function CategoryTreeItem({
    category,
    allCategories,
    depth,
    onAddChild,
    onEdit,
    onDelete
}) {
    const children = allCategories.filter(
        child => child.parent_categoryid === category.categoryid
    );

    const isGlobal = category.userid === null;

    return (
        <div className="category-tree-item">
            <div
                className="category-row"
                style={{ "--category-depth": depth }}
            >
                <div className="category-name-wrapper">
                    {depth > 0 && (
                        <span className="category-branch">
                            ↳
                        </span>
                    )}

                    <span className="category-name">
                        {category.name}
                    </span>

                    {isGlobal && (
                        <span className="category-global-badge">
                            Default
                        </span>
                    )}

                    {Number(category.is_partial) === 1 && (
                        <span className="category-partial-badge">
                            Partial
                        </span>
                    )}
                </div>

                <div className="category-actions">
                    {isGlobal ? (
                        <span className="category-readonly">
                            Default category
                        </span>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => onAddChild(category)}
                            >
                                + Child
                            </button>

                            <button
                                type="button"
                                onClick={() => onEdit(category)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                className="category-delete"
                                onClick={() => onDelete(category)}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {children.length > 0 && (
                <div className="category-children">
                    {children.map(child => (
                        <CategoryTreeItem
                            key={child.categoryid}
                            category={child}
                            allCategories={allCategories}
                            depth={depth + 1}
                            onAddChild={onAddChild}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


function CategoryForm({
    category,
    parentCategory,
    categories,
    onClose,
    onSave
}) {
    const isEditing = Boolean(category);

    const [name, setName] = useState(category?.name || "");
    const [type, setType] = useState(
        category?.type ||
        parentCategory?.type ||
        ""
    );

    const [parentId, setParentId] = useState(
        category?.parent_categoryid ??
        parentCategory?.categoryid ??
        ""
    );

    const [isPartial, setIsPartial] = useState(
        Number(category?.is_partial || 0)
    );

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const selectedParent = categories.find(
        item => Number(item.categoryid) === Number(parentId)
    );

    const descendants = getDescendantIds(
        categories,
        category?.categoryid
    );

    const availableParents = categories.filter(item => {
        if (item.userid === null) return false;

        if (item.type !== type) return false;

        if (isEditing && Number(item.categoryid) === Number(category.categoryid)) {
            return false;
        }

        if (descendants.includes(Number(item.categoryid))) {
            return false;
        }

        return true;
    });

    const handleParentChange = (value) => {
        setParentId(value);

        if (!value) {
            if (!isEditing) {
                setType("");
            }

            return;
        }

        const parent = categories.find(
            item => Number(item.categoryid) === Number(value)
        );

        if (parent) {
            setType(parent.type);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        if (!type) {
            setError("Please select a category type.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            await onSave({
                name: name.trim(),
                type,
                parent_categoryid: parentId ? Number(parentId) : null,
                is_partial: Number(isPartial)
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="category-modal-backdrop">
            <div className="category-modal">
                <div className="category-modal-header">
                    <div>
                        <h2>
                            {isEditing
                                ? "Edit Category"
                                : parentCategory
                                    ? "Add Child Category"
                                    : "Add Category"}
                        </h2>

                        <p>
                            {isEditing
                                ? "Update this category's details."
                                : "Create a category for your financial activity."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="category-modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="category-form-field">
                        <label htmlFor="category-name">
                            Name
                        </label>

                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="e.g. Groceries"
                            autoFocus
                        />
                    </div>

                    <div className="category-form-field">
                        <label htmlFor="category-type">
                            Type
                        </label>

                        <select
                            id="category-type"
                            value={type}
                            disabled={Boolean(selectedParent || parentCategory)}
                            onChange={event => setType(event.target.value)}
                        >
                            <option value="">
                                Select type
                            </option>

                            <option value="income">
                                Income
                            </option>

                            <option value="expense">
                                Expense
                            </option>
                        </select>

                        {(selectedParent || parentCategory) && (
                            <small>
                                Child categories inherit their parent's type.
                            </small>
                        )}
                    </div>

                    <div className="category-form-field">
                        <label htmlFor="category-parent">
                            Parent Category
                        </label>

                        <select
                            id="category-parent"
                            value={parentId}
                            onChange={event =>
                                handleParentChange(event.target.value)
                            }
                        >
                            <option value="">
                                None — Top level
                            </option>

                            {availableParents.map(item => (
                                <option
                                    key={item.categoryid}
                                    value={item.categoryid}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="category-partial-toggle">
                        <input
                            type="checkbox"
                            checked={Number(isPartial) === 1}
                            onChange={event =>
                                setIsPartial(event.target.checked ? 1 : 0)
                            }
                        />

                        <span>
                            <strong>Partial category</strong>
                            <small>
                                Mark this category as partial when applicable.
                            </small>
                        </span>
                    </label>

                    {error && (
                        <div className="category-form-error">
                            {error}
                        </div>
                    )}

                    <div className="category-modal-actions">
                        <button
                            type="button"
                            className="category-cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="category-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditing
                                    ? "Save Changes"
                                    : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


function DeleteCategoryModal({
    category,
    onCancel,
    onConfirm
}) {
    const descendantsText = " and all of its subcategories";

    return (
        <div className="category-modal-backdrop">
            <div className="category-modal category-delete-modal">
                <div className="category-delete-icon">
                    !
                </div>

                <h2>Delete category?</h2>

                <p>
                    You're about to delete{" "}
                    <strong>{category.name}</strong>
                    {descendantsText}.
                </p>

                <p>
                    Existing transactions will remain, but transactions using
                    these categories will become uncategorized.
                </p>

                <div className="category-modal-actions">
                    <button
                        type="button"
                        className="category-cancel-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="category-danger-button"
                        onClick={onConfirm}
                    >
                        Delete Category
                    </button>
                </div>
            </div>
        </div>
    );
}


function getDescendantIds(categories, categoryId) {
    if (!categoryId) return [];

    const descendants = [];

    const collect = (parentId) => {
        categories
            .filter(category => Number(category.parent_categoryid) === Number(parentId))
            .forEach(category => {
                descendants.push(Number(category.categoryid));
                collect(category.categoryid);
            });
    };

    collect(categoryId);

    return descendants;
}