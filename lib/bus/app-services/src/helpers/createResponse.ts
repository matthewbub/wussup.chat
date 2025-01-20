import { StatusCode } from "hono/utils/http-status";

interface ResponseData {
  success: boolean;
  message: string;
  code: string;
  data?: any;
  status?: StatusCode;
}

export const createResponse = (
  successOrObj: boolean | ResponseData,
  message = "",
  code = "",
  data: any = null,
  status: StatusCode = 200
) => {
  if (typeof successOrObj === "object") {
    const { success, message, code, data, status } = successOrObj;
    return {
      success,
      message,
      code,
      data,
      status: status ?? 200,
    };
  }

  return {
    success: successOrObj,
    message,
    code,
    data,
    status,
  };
};

export const respondWith = (
  successOrObj: boolean | ResponseData,
  status: StatusCode
) => {
  return createResponse(successOrObj, "", "", null, status);
};
