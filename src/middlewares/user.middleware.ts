import { Request, Response, NextFunction } from "express";

// Set user ID
export const setUserID = (req: Request, res: Response, next: NextFunction) => {
  // Set user id
  req.params.id = res.locals.user._id;

  // Next middleware
  next();
};
