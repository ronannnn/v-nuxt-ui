import type { SelectOption } from '#v/types'

export const booleanOptions: SelectOption[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

export enum Gender {
  MALE = 1,
  FEMALE = 2,
  UNKNOWN = 0
}

export const genderOptions: SelectOption[] = [
  { label: '男', value: Gender.MALE },
  { label: '女', value: Gender.FEMALE }
]
