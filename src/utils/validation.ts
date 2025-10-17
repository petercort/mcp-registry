import type { ValidateFunction } from "ajv";
import type { ErrorObject } from "ajv";
import { ValidationError } from "./errors";

export const formatAjvErrors = (errors: ErrorObject[] | null | undefined): Array<Record<string, unknown>> =>
  (errors ?? []).map((error) => ({
    instancePath: error.instancePath,
    message: error.message,
    keyword: error.keyword,
    params: error.params,
  }));

export const validateWithSchema = <T>(
  validator: ValidateFunction<unknown>,
  candidate: unknown,
  message: string,
): T => {
  const typedValidator = validator as ValidateFunction<T>;
  if (!typedValidator(candidate)) {
    throw new ValidationError(message, typedValidator.errors ?? []);
  }
  return candidate as T;
};

