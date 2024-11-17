export enum ErrorKey {
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_NO_PERMISSION = 'AUTH_NO_PERMISSION',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',
  VALIDATION_ERROR_JSON_BODY = 'VALIDATION_ERROR_JSON_BODY',
  VALIDATION_ERROR_PATH_PARAMS = 'VALIDATION_ERROR_PATH_PARAMS',
  VALIDATION_ERROR_QUERY_STRING = 'VALIDATION_ERROR_QUERY_STRING',
  MISSING_ENTITIES = 'MISSING_ENTITIES',
  DUPLICATED_ENTRY = 'DUPLICATED_ENTRY',
}

export const ErrorMsg = {
  AUTH_INVALID_TOKEN: 'Invalid or expired jwt token provided',
  AUTH_NO_PERMISSION: 'The user has no permission to access this resource',
  AUTH_INVALID_CREDENTIALS: 'The credentials provided are incorrect',
  UNEXPECTED_ERROR: 'An unexpected error ocurred',
  SCHEMA_VALIDATION_ERROR: "Data doesn't match the validation schema",
  VALIDATION_ERROR_JSON_BODY: "Request body doesn't match the validation schema",
  VALIDATION_ERROR_PATH_PARAMS: "Request path parameters don't match the validation schema",
  VALIDATION_ERROR_QUERY_STRING: "Request query-strings don't match the validation schema",
  MISSING_ENTITIES: 'Some entities were not found in the database',
  DUPLICATED_ENTRY: 'Duplicated value in the database',
}