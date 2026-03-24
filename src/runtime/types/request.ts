export enum ShowType {
  Silent = 0,
  SuccessMessage = 1,
  InfoMessage = 2,
  WarnMessage = 3,
  ErrorMessage = 4,
  SuccessNotification = 11,
  InfoNotification = 12,
  WarnNotification = 13,
  ErrorNotification = 14
}

export enum ErrorCode {
  FIELD_VALIDATION_ERROR_CODE = 2,
  ACCESS_TOKEN_ERROR_CODE = 10,
  REFRESH_TOKEN_ERROR_CODE = 11
}
export const noErrorMsgCodes = [
  ErrorCode.ACCESS_TOKEN_ERROR_CODE,
  ErrorCode.REFRESH_TOKEN_ERROR_CODE
]

export type FormErrorField = {
  errorField: string
  errorFieldWithNamespace: string
  errorMsg: string
}

/** Custom request success result */
export interface SuccessResult<T> {
  error: null
  data: T
}
/** Custom request failed result */
export interface FailedResult {
  error: Error
  data: null
}
/** Custom request result */
export type RequestResult<T> = SuccessResult<T> | FailedResult

/** Custom request stats item */
export interface StatsItem {
  field: string
  result: any
  rmk?: string
}
/** Custom paginated result */
export interface PageResult<T = any> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  stats?: StatsItem[][]
}

/** Batch operation command */
export interface BatchOprCommand {
  ids: number[]
}

export interface BatchSaveCommand<T> {
  items?: T[]
}
