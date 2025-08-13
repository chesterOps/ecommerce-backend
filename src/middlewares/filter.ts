import { Request, Response, NextFunction } from "express";

export default function filter(...body: Array<string>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // New body
    const newBody: { [key: string]: any } = {};

    // Filter fields from request body
    Object.keys(req.body).forEach((el) => {
      if (body.includes(el)) newBody[el] = req.body[el];
    });

    // Update request body
    req.body = newBody;

    // Next middleware
    next();
  };
}
