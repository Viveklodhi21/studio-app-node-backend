import { Response } from "express";

const successResponse = (res: Response, msg: string, data: any) => {
  let resData = {
    status: true,
    message: msg,
    data: data,
  };
  return res.status(200).json(resData);
};

// const successResponseDataWithPagination = (res: Response, msg: string, total, data) => {
//   let resData = {
//     status: true,
//     message: msg,
//     totalUsers: total,
//     data: data,
//   };
//   return res.status(200).json(resData);
// };

const errorResponse = (res: Response, msg: string) => {
  var resData = {
    status: false,
    message: msg,
    data: null,
  };
  return res.status(500).json(resData);
};

const notFoundResponse = (res: Response, msg: string) => {
  var resData = {
    status: false,
    message: msg,
    data: null,
  };
  return res.status(404).json(resData);
};

const validationError = (res: Response, msg: string) => {
  var resData = {
    status: false,
    message: msg,
    // data: data,
  };
  return res.status(400).json(resData);
};

const unauthorizedResponse = (res: Response, msg: string) => {
  var resData = {
    status: false,
    message: msg,
    data: null,
  };
  return res.status(401).json(resData);
};

export {
  successResponse,
  // successResponseDataWithPagination,
  errorResponse,
  notFoundResponse,
  validationError,
  unauthorizedResponse,
};
