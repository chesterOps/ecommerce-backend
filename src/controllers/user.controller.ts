import User from "../models/user.model";
import {
  deleteOne,
  findAll,
  findOne,
  updateOne,
} from "../utils/handlerFactory";

export const deleteUser = deleteOne(User);

export const getUser = findOne(User);

export const updateUser = updateOne(User);

export const getAllUsers = findAll(User);
