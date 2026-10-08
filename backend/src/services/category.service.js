import * as repo from "../repositories/category.repo.js";

const VALID_TYPES = ["income", "expense"];
const VALID_PARTIAL_VALUES = [0, 1];

const validateName = (name) => {
    if (!name?.trim()) {
        throw new Error("Category name is required.");
    }
};

const validateType = (type) => {
    if (!VALID_TYPES.includes(type)) {
        throw new Error("Category type must be income or expense.");
    }
};

const validateIsPartial = (is_partial) => {
    if (!VALID_PARTIAL_VALUES.includes(Number(is_partial))) {
        throw new Error("Invalid partial category value.");
    }
};

const findDuplicateCategory = async (userid, name, is_partial, excludeCategoryId = null) => {
    const categories = await repo.getCategories(userid, is_partial);

    return categories.find(cat =>
        cat.name.toLowerCase() === name.trim().toLowerCase() &&
        Number(cat.categoryid) !== Number(excludeCategoryId)
    );
};

const validateParent = async (userid, categoryid, parent_categoryid, type) => {
    if (!parent_categoryid) return;

    if (Number(categoryid) === Number(parent_categoryid)) {
        throw new Error("A category cannot be its own parent.");
    }

    const parent = await repo.fetchById(userid, parent_categoryid);

    if (parent.length === 0) {
        throw new Error("Parent category not found.");
    }

    if (parent[0].type !== type) {
        throw new Error("Category type must match the parent category type.");
    }
};

export const createCategory = async (userid, name, type, parent_categoryid, is_partial) => {
    validateName(name);
    validateType(type);
    validateIsPartial(is_partial);

    const duplicate = await findDuplicateCategory(userid, name, is_partial);

    if (duplicate) {
        throw new Error(`Category with the name '${name}' already exists.`);
    }

    await validateParent(userid, null, parent_categoryid, type);

    const created = await repo.addCategory(userid, name.trim(), type, parent_categoryid || null, Number(is_partial));
    return created;
};

export const fetchCategories = async (userid, is_partial) => {
    if (
        is_partial !== undefined &&
        is_partial !== null &&
        !VALID_PARTIAL_VALUES.includes(Number(is_partial))
    ) {
        throw new Error("Invalid partial category value.");
    }

    return await repo.getCategories(userid, is_partial);
};

export const getCategorySubtree = async (userid, categoryid) => {
    if (!categoryid) {
        throw new Error("Category ID is required.");
    }

    const categories = await repo.fetchDescendants(userid, categoryid);

    if (categories.length === 0) {
        throw new Error("Category not found.");
    }

    return categories;
};

export const editCategory = async (userid, categoryid, name, parent_categoryid, is_partial) => {
    if (!categoryid) {
        throw new Error("Category ID is required.");
    }

    if (name === undefined && parent_categoryid === undefined && is_partial === undefined) {
        throw new Error("No data to update.");
    }

    const existing = await repo.fetchById(userid, categoryid);

    if (existing.length === 0) {
        throw new Error("Category not found.");
    }

    const currentCategory = existing[0];

    const newName = name !== undefined
        ? name.trim()
        : currentCategory.name;

    const newParentId = parent_categoryid !== undefined
        ? parent_categoryid
        : currentCategory.parent_categoryid;

    const newIsPartial = is_partial !== undefined
        ? Number(is_partial)
        : Number(currentCategory.is_partial);

    validateName(newName);
    validateIsPartial(newIsPartial);

    const duplicate = await findDuplicateCategory(userid, newName, newIsPartial, categoryid);

    if (duplicate) {
        throw new Error(`Category with the name '${newName}' already exists.`);
    }

    await validateParent(userid, categoryid, newParentId, currentCategory.type);

    if (newParentId) {
        const descendants = await repo.fetchDescendants(userid, categoryid);

        if (
            descendants.some(
                category =>
                    Number(category.categoryid) === Number(newParentId)
            )
        ) {
            throw new Error(
                "A category cannot be moved under one of its descendants."
            );
        }
    }

    const updated = await repo.updateCategory(
        userid,
        categoryid,
        name !== undefined ? newName : undefined,
        parent_categoryid !== undefined ? newParentId : undefined,
        is_partial !== undefined ? newIsPartial : undefined
    );
    return updated;
};

export const dropCategory = async (userid, categoryid) => {
    if (!categoryid) {
        throw new Error("Category ID is required.");
    }

    const existing = await repo.fetchById(userid, categoryid);

    if (existing.length === 0) {
        throw new Error("Category not found.");
    }

    return await repo.deleteCategory(userid, categoryid);
};