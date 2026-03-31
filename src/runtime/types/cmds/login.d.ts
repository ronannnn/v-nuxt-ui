declare namespace Cmd {
  type UsernamePasswordLoginPayload = {
    username?: string
    password?: string
  }

  type RefreshTokensPayload = {
    refreshToken: string
  }

  type ChangeUserPwdCmd = {
    userId: number
    oldPwd: string
    newPwd: string
  }

  type LoginResult = {
    refreshToken?: string
    accessToken?: string
    dupLogin?: boolean
    user?: Model.User
  }
}
