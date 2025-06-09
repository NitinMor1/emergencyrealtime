import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const formatZodError = (error: any) => {
    return error.errors.reduce((acc: Record<string, string>, curr: any) => {
        const path = curr.path.join('.');
        acc[path] = curr.message;
        return acc;
    }, {});
};

export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.body);
            req.body = parsed;
            next();
        } catch (err: any) {
            console.error('Zod Body Validation Error:', err);
            return res.status(400).json({
                success: false,
                message: 'Invalid request body',
                errors: err.errors ? formatZodError(err) : err.message,
            });
        }
    };
};
/*validating the query param*/

export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            //validates the data against the schema
            const parsed = await schema.parseAsync(req.query);
            req.query = parsed;
            next();
        } catch (err: any) {
            console.error('Zod Query Validation Error:', err);
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: err.errors ? formatZodError(err) : err.message,
            });
        }
    };
};
/*Validating the url param*/

export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync(req.params);
            req.params = parsed;
            next();
        } catch (err: any) {
            console.error('Zod Params Validation Error:', err);
            return res.status(400).json({
                success: false,
                message: 'Invalid route parameters',
                errors: err.errors ? formatZodError(err) : err.message,
            });
        }
    };
};