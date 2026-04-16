import { ZodTypeAny } from "zod";
import { NextFunction, Request, Response } from "express";

const validateRequest =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      Object.assign(req, parsed);

      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;