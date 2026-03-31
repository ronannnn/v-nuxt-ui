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
  { label: 'Male', value: Gender.MALE },
  { label: 'Female', value: Gender.FEMALE },
  { label: 'Unknown', value: Gender.UNKNOWN }
]
