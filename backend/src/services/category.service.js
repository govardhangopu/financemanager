import * as repo from "../repositories/category.repo.js";

export const createCategory = async (userid, name, type, parent_categoryid, is_partial) => {
    const existingCategories = await repo.getCategories(userid, is_partial);
    if (existingCategories.find(cat => cat.name == name))
        throw new Error(`Category with the name '${name}' already exists.`);

    const created = await repo.addCategory(userid, name, type, parent_categoryid || null, is_partial);
    return created;
}

export const fetchCategories = async (userid, is_partial) => {
    const fetchedCategories = await repo.getCategories(userid, is_partial);
    return fetchedCategories;
}

export const editCategory = async (userid, categoryid, name, parent_categoryid, is_partial) => {
    if (!(categoryid && (name || parent_categoryid || is_partial))) throw new Error('No data to update.');
    const updated = await repo.updateCategory(
        userid,
        categoryid,
        name,
        parent_categoryid,
        is_partial
    );
    return updated;
}

export const dropCategory = async (userid, categoryid) => {
    const dropped = await repo.deleteCategory(userid, categoryid);
    return dropped;
}