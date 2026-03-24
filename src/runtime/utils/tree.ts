import type { TreeItem } from '@nuxt/ui'

export function treeifyModels<T>(
  data: T[],
  rowKey: keyof T,
  treeifyColName: keyof T,
  treeifyColValue = 0
): (T & { children: T[] })[] {
  return data
    .filter(row => row[treeifyColName] === treeifyColValue)
    .map(row => ({
      ...row,
      children: treeifyModels(data, rowKey, treeifyColName, row[rowKey] as number)
    }))
}

export function flattenTree<T extends { children?: T[] }>(tree: T[]): T[] {
  return tree.reduce((acc, item) => {
    acc.push(item)
    if (item.children) {
      acc.push(...flattenTree(item.children))
    }
    return acc
  }, [] as T[])
}

// created by github copilot
export function treeifyOptions<T>(
  data: T[],
  onSelect: (newVal: number) => void,
  labelField: string,
  valueField: string,
  parentValueField: string,
  excludedValue = 0,
  disabledIds = [] as number[],
  defaultExpanded = true,
  visited: Set<number> = new Set()
): TreeItem[] {
  // 所有 id
  const allIds = new Set<number>(data.map(item => item[valueField] as number))

  // 根节点筛选：parentId 不在所有 id 里，且自身不是 excludedValue
  const rootItems = data.filter(item =>
    (!allIds.has(item[parentValueField] as number) || item[parentValueField] === excludedValue)
    && item[valueField] !== excludedValue
  )

  // 构建树
  function buildNode(node: T, visited: Set<number>): TreeItem {
    const nodeId = node[valueField] as number
    if (visited.has(nodeId)) {
      // 防止环
      return {
        defaultExpanded,
        label: node[labelField] as string,
        value: nodeId,
        onSelect: (e) => {
          e.preventDefault() // 防止点击非checkbox的地方会选中
          onSelect(nodeId)
        },
        disabled: disabledIds.includes(nodeId)
      }
    }
    const newVisited = new Set(visited)
    newVisited.add(nodeId)

    const children = data
      .filter(item => item[parentValueField] === nodeId && item[valueField] !== excludedValue)
      .map(child => buildNode(child, newVisited))

    const treeItem: TreeItem = {
      defaultExpanded,
      label: node[labelField] as string,
      value: nodeId,
      onSelect: (e) => {
        e.preventDefault() // 防止点击非checkbox的地方会选中
        onSelect(nodeId)
      },
      disabled: disabledIds.includes(nodeId)
    }
    if (children.length) {
      treeItem.children = children
    }
    return treeItem
  }

  return rootItems.map(root => buildNode(root, visited))
}
