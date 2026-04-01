import type { User } from '../models'

export type UsernamePasswordLoginPayload = {
  username?: string
  password?: string
}

export type RefreshTokensPayload = {
  refreshToken: string
}

export type ChangeUserPwdCmd = {
  userId: number
  oldPwd: string
  newPwd: string
}

export type LoginResult = {
  refreshToken?: string
  accessToken?: string
  dupLogin?: boolean
  user?: User
}
