export enum ErrorKey {
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',
  VALIDATION_ERROR_JSON_BODY = 'VALIDATION_ERROR_JSON_BODY',
  VALIDATION_ERROR_PATH_PARAMS = 'VALIDATION_ERROR_PATH_PARAMS',
  VALIDATION_ERROR_QUERY_STRING = 'VALIDATION_ERROR_QUERY_STRING',
  MISSING_ENTITIES = 'MISSING_ENTITIES',
  DUPLICATED_ENTRY = 'DUPLICATED_ENTRY',
}

export const ErrorMsg = {
  UNEXPECTED_ERROR: 'An unexpected error ocurred',
  SCHEMA_VALIDATION_ERROR: "Data doesn't match the validation schema",
  VALIDATION_ERROR_JSON_BODY: "Request body doesn't match the validation schema",
  VALIDATION_ERROR_PATH_PARAMS: "Request path parameters don't match the validation schema",
  VALIDATION_ERROR_QUERY_STRING: "Request query-strings don't match the validation schema",
  MISSING_ENTITIES: 'Some entities were not found in the database',
  DUPLICATED_ENTRY: 'Duplicated value in the database',
}
