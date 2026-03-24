// 比较原始类型数组（如 string[], number[] 等）
function comparePrimitiveArrays(arr1: any, arr2: any): boolean {
  if (!arr1 || !arr2)
    return arr1 === arr2
  if (!Array.isArray(arr1) || !Array.isArray(arr2))
    return false
  if (arr1.length !== arr2.length)
    return false
  return arr1.every((item, index) => item === arr2[index])
}

// prev and cur should be the same type
// return object keys of fields that have changed
function getChangedFields(prev: any, cur: any): string[] {
  const fields = noDupPrimitiveArray([...Object.keys(prev), ...Object.keys(cur)])
  const changedFields: string[] = []
  for (const field of fields) {
    if ((prev[field] === null || prev[field] === undefined) && (cur[field] === null || cur[field] === undefined)) {
      continue
    }

    // 跳过数组类型，由外部参数处理
    if (Array.isArray(prev[field]) || Array.isArray(cur[field])) {
      continue
    }

    // skip compare if it is not primitive type
    if (Object(prev[field]) !== prev[field] && prev[field] !== cur[field]) {
      changedFields.push(field)
    }
  }
  return changedFields
}

// return true is there is no difference
export function compareObjArrays(arr1: any, arr2: any): boolean {
  if (!arr1 || !arr2)
    return arr1 === arr2
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false
  }

  if (arr1.length !== arr2.length) {
    return false
  }

  return arr1.every((item1, index) => {
    const item2 = arr2[index]
    const keys = Object.keys(item1)
    return keys.every((key) => {
      if (Array.isArray(item1[key]) && Array.isArray(item2[key])) {
        return compareObjArrays(item1[key], item2[key])
      } else if (isObject(item1[key]) && isObject(item2[key])) {
        return getChangedFields(item1[key], item2[key]).length === 0
      }

      if ((item1[key] === null || item1[key] === undefined) && (item2[key] === null || item2[key] === undefined)) {
        return true
      }

      return item1[key] === item2[key]
    })
  })
}

// return an object with init data and all changed fields
// return a flag to show if there is any change
export function getObjWithModifiedFields<T>(
  initData: T,
  oldData: T,
  newData: T,
  arrayKeys: (keyof T)[] = []
): [T, boolean] {
  const changedFields = getChangedFields(oldData, newData) as (keyof T)[]

  // 比较数组字段，自动检测是原始类型数组还是对象数组
  const arrayChangedList: boolean[] = arrayKeys.map((key) => {
    const oldArr = oldData[key]
    const newArr = newData[key]

    // 检查是否为数组
    if (!Array.isArray(oldArr) && !Array.isArray(newArr)) {
      return false
    }

    // 检测数组类型：如果数组为空或第一个元素是原始类型，则使用原始类型数组比较
    const hasItems = (Array.isArray(oldArr) && oldArr.length > 0) || (Array.isArray(newArr) && newArr.length > 0)
    const firstItem = Array.isArray(oldArr) && oldArr.length > 0 ? oldArr[0] : (Array.isArray(newArr) && newArr.length > 0 ? newArr[0] : null)
    const isPrimitiveArray = !hasItems || (firstItem !== null && firstItem !== undefined && Object(firstItem) !== firstItem)

    if (isPrimitiveArray) {
      return !comparePrimitiveArrays(oldArr, newArr)
    } else {
      return !compareObjArrays(oldArr, newArr)
    }
  })

  if (changedFields.length === 0 && !arrayChangedList.some(changed => changed)) {
    return [initData, false]
  }

  // 应用原始字段变化
  for (const field of changedFields) {
    initData[field] = newData[field]
  }

  // 应用数组变化
  arrayKeys.forEach((key, index) => {
    if (arrayChangedList[index])
      initData[key] = newData[key]
  })

  return [initData, true]
}
