// User model for playground demo
declare namespace Model {
  interface BaseModel {
    id: number
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
    version?: number
  }

  interface User extends BaseModel {
    nickname: string
    username: string
    email: string
    gender: string
    departmentId: number
    department?: { id: number, name: string }
    isAdmin: boolean
    status: string
    entryDate: string
    resignDate?: string
    telNo?: string
  }

  interface Department extends BaseModel {
    name: string
    parentId?: number
  }
}
