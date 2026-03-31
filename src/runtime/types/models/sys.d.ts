declare namespace Model {
  type Menu = {
    isAdmin?: boolean
    type?: string
    parentId?: number
    parent?: Menu
    name?: string
    i18nKey?: string
    staticRouteKeys?: string[]
    permission?: string
    order?: string
    disabled?: boolean
  } & BaseModel

  type Role = {
    isAdmin?: boolean
    name?: string
    permission?: string
    disabled?: boolean
    remark?: string
    menus?: Menu[]
  } & BaseModel

  type Company = {
    fullname?: string
    nickname?: string
  } & BaseModel

  type Department = {
    name?: string
    companyId?: number
    company?: Company
    leaderId?: number
    leader?: User
    parentId?: number
    parent?: Department
  } & BaseModel

  type JobTitle = {
    name?: string
    description?: string
    disabled?: boolean
    remark?: string
  } & BaseModel

  type JobGrade = {
    name?: string
    description?: string
    disabled?: boolean
    remark?: string
  } & BaseModel

  type User = {
    id: number
    createdAt?: string
    updatedAt?: string
    version?: number
    // opr
    userCreatedBy?: number
    creator?: User
    userUpdatedBy?: number
    updater?: User

    // user info
    nickname?: string // 昵称
    jobTitleId?: number
    jobTitle?: JobTitle // 职位
    jobGradeId?: number
    jobGrade?: JobGrade // 职级
    departmentId?: number
    department?: Department // 部门
    supervisorId?: number // 直接上级
    supervisor?: User // 直接上级
    entryDate?: string // 入职时间
    resignDate?: string // 离职时间
    gender?: number // 性别 0:未知 1:男 2:女

    // login info
    username?: string // 用户名
    email?: string // 邮箱
    telNo?: string // 手机号

    // 登陆方式
    loginType?: string // 比如2代WMS登录，账户密码登录，手机验证码登录等，由逗号分隔

    roles?: Role[] // 角色
    menus?: Menu[] // 菜单权限

    needChangePwd?: boolean // 是否需要修改密码

    needFillWh?: boolean // 是否需要填写工时

    isAdmin?: boolean
  }

  type RowRecord = {
    rowId?: number
    rowVersion?: number
    key?: string
    oldValue?: string
    newValue?: string
  } & BaseModel

  type UniqueKey = {
    key?: string
  }
}
