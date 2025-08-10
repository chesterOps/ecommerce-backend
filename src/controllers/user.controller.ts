import User from "../models/user.model";
import catchAsync from "../utils/catchAsync";
import { deleteOne, findOne, updateOne } from "../utils/handlerFactory";

export const deleteUser = deleteOne(User);

export const getUser = findOne(User);

export const updateUser = updateOne(User);
