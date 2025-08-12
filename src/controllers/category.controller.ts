import Category from "../models/category.model";
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
  updateOne,
} from "../utils/handlerFactory";

export const createCategory = createOne(Category);

export const deleteCategory = deleteOne(Category);

export const updateCategory = updateOne(Category);

export const getCategory = findOne(Category);

export const getAllCatgeories = findAll(Category);
