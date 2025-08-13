import Product from "../models/product.model";
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
} from "../utils/handlerFactory";

export const createProduct = createOne(Product);

export const getProduct = findOne(Product);

export const getProducts = findAll(Product);
