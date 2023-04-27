// @ts-nocheck
import { successResponse, validationError } from "../helpers/api-response.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response,Request} from "express";
import User from "../models/user.js";

export const addSuperAdmin = async (req: Request, res: Response) => {
  const { name, email, password, address, phone, role } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  const SuperUser = new User({
    name,
    email,
    password: encryptedPassword,
    address,
    phone,
    role,
  });
  try {
    const savedUser = await SuperUser.save();
    const jwtPayload = SuperUser;
    let token = jwt.sign(jwtPayload.toJSON(), 'secret key');
    SuperUser.password = undefined;
    SuperUser.__v = undefined;
    const response = { ...SuperUser._doc, token };
    return successResponse(res, 'User added successfully', response);
  } catch (error: any) {
    console.log("errorrr", error);
    return validationError(res, error.message);
  }
};
