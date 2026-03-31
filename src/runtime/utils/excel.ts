import type { VColumn } from '#v/types'
import { triggerFileDownload } from './download/tagA'

export async function genTableExcel(columns: VColumn<any>[], data: any[], filenamePrefix: string) {
  // Dynamic import to avoid SSR crash
  const ExcelJs = (await import('exceljs')).default
  // create sheet
  const wb = new ExcelJs.Workbook()
  const ws = wb.addWorksheet('Sheet1')

  const titleRow = columns.map(col => col.header)
  const rows: any[] = [titleRow]
  data.forEach((item) => {
    const row: any[] = []
    columns.forEach((col) => {
      if (!(col as any)['accessorKey'] && !col.cell && !col.exportCell) {
        throw new Error('Column must have accessorKey or cell or exportCell for excel export')
      }
      if (col.exportCell) {
        row.push(col.exportCell(item))
      } else if (typeof col.cell === 'function') {
        // 为 cell 提供一个最小的 CellContext（尽量兼容 tanstack 的签名）
        try {
          const ctx: any = {
            row: { original: item },
            getValue: () => ((col as any)['accessorKey'] ? item[(col as any)['accessorKey']] : undefined),
            column: col
            // 其他字段按需补充
          }
          const v = col.cell(ctx)
          // 如果是 ReactNode/对象，尽量转为字符串作为导出（用户应优先使用 exportCell）
          row.push(v == null ? '' : String(v))
          return
        } catch (e) {
          // 如果调用失败，继续回退到 accessorKey
          console.warn('col.cell 调用失败，回退到 accessorKey', e)
        }
      } else {
        row.push(item[(col as any)['accessorKey']])
      }
    })
    rows.push(row)
  })

  ws.addRows(rows)
  // 设置列宽和字体
  for (let colIdx = 1; colIdx <= titleRow.length; colIdx++) {
    let cellWidth = 10
    rows.forEach((_, rowIdx) => {
      cellWidth = Math.max(cellWidth, getVisualWidth(String(ws.getCell(rowIdx + 1, colIdx).value)))
    })
    ws.getColumn(colIdx).width = cellWidth
    ws.getColumn(colIdx).font = { name: '微软雅黑' }
  }

  // save file
  const buffer = await wb.xlsx.writeBuffer()
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const blob = new Blob([buffer], { type: fileType })
  triggerFileDownload(blob, `${filenamePrefix}.xlsx`)
}

// 计算单元格的宽度，中文字符算两个宽度
export function getVisualWidth(cellValue: string | string[] | undefined) {
  if (!cellValue || Array.isArray(cellValue))
    return 0

  let width = 0
  for (let i = 0; i < cellValue.length; i += 1) {
    const charCode = cellValue.charCodeAt(i)
    if (charCode >= 0 && charCode <= 128) {
      // 英文字符
      width += 1.5
    } else {
      // 中文字符
      width += 2.6
    }
  }
  return Math.round(width)
}
