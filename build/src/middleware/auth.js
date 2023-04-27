import jwt from "jsonwebtoken";
import { unauthorizedResponse } from '../helpers/api-response.js';
export const auth = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return unauthorizedResponse(res, 'Unauthorised request');
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, "secret key");
        next();
    }
    catch (error) {
        unauthorizedResponse(res, error.message);
    }
};
