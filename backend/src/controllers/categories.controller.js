import * as categoryService from "../services/category.service.js";

export const addCategory = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { name, type, parent_categoryid, is_partial } = req.body;
        const response = await categoryService.createCategory(userid, name, type, parent_categoryid, is_partial)
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.fetchCategories(req.user.id, req.body.is_partial);
        res.json(categories);
    } catch (err) {
        next(err);
    }
}

export const updateCategory = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const { categoryid, name, parent_categoryid, is_partial } = req.body;
        const response = await categoryService.editCategory(userid, categoryid, name, parent_categoryid, is_partial);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

export const deleteCategory = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const response = await categoryService.dropCategory(userid, req.params.id);
        res.json(response);
    } catch (err) {
        next(err);
    }
}