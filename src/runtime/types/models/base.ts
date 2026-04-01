export interface BaseModel {
  id: number
  createdAt?: string
  updatedAt?: string
  version?: number
  createdBy?: number
  creator?: any
  updatedBy?: number
  updater?: any
}

export type UniqueKey = {
  key?: string
}
