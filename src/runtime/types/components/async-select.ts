export type AsyncSelectValue = string[] | number[] | string | number | undefined
export type AsyncSelectCombinedValue = {
  values: AsyncSelectValue
  extraModels?: any[]
}
