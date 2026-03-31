<script setup lang="ts">
import { onMounted, watch, onUnmounted } from 'vue'
import { format } from 'sql-formatter'
import { useColorMode } from '@vueuse/core'

interface Props {
  tables?: string[] // 表名列表
  columns?: Record<string, string[]> // 表对应的字段列表 { tableName: [column1, column2, ...] }
}
const value = defineModel<string | null | undefined>('modelValue', { required: true })

const props = withDefaults(defineProps<Props>(), {
  tables: () => [],
  columns: () => ({})
})

const colorMode = useColorMode()

let editor: any = null
let monaco: any = null
let completionProvider: any = null

const getTheme = () => {
  return colorMode.value === 'dark' ? 'vs-dark' : 'vs'
}

// 格式化 SQL
const formatSQL = () => {
  if (editor) {
    const currentValue = editor.getValue()
    const formatted = format(currentValue, { language: 'postgresql' })
    editor.setValue(formatted)
  }
}

// 获取 SQL 内容
const getValue = () => {
  return editor?.getValue() || ''
}

// 设置 SQL 内容
const setValue = (newValue: string) => {
  if (editor) {
    editor.setValue(newValue)
  }
}

onMounted(async () => {
  // 动态导入 monaco-editor，确保只在客户端加载
  monaco = await import('monaco-editor')

  // 注册自定义的 SQL 自动完成提示
  completionProvider = monaco.languages.registerCompletionItemProvider('sql', {
    triggerCharacters: [' ', ',', '.', '(', '\n'],
    provideCompletionItems: (model: any, position: any) => {
      const suggestions: any[] = []

      // 获取当前输入的词
      const wordInfo = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endColumn: wordInfo.endColumn
      }

      // 获取当前位置之前的文本，用于判断上下文
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      const textBeforeCursorUpper = textBeforeCursor.toUpperCase()

      // 获取当前行的文本
      const currentLine = model.getLineContent(position.lineNumber).toUpperCase()

      // 判断当前光标所在的 SQL 上下文
      const isAfterFrom = /\bFROM\s+\w*$/i.test(textBeforeCursorUpper) || /\bJOIN\s+\w*$/i.test(textBeforeCursorUpper)
      const isAfterSelect = /\bSELECT\s+(?:\w+\s*,\s*)*\w*$/i.test(textBeforeCursorUpper) || /,\s*\w*$/i.test(currentLine)
      const isAfterWhere = /\bWHERE\s+(?:.*?\s+)?(?:AND|OR)?\s*\w*$/i.test(textBeforeCursorUpper)

      // 提取 SQL 中已经声明的表名（FROM 和 JOIN 后面的表）
      const declaredTables: string[] = []
      const fromMatches = textBeforeCursor.matchAll(/\b(?:FROM|JOIN)\s+(\w+)/gi)
      for (const match of fromMatches) {
        const tableName = match[1]
        // 在 props.tables 中查找匹配的表名（忽略大小写）
        const foundTable = props.tables.find(t => t.toLowerCase() === tableName.toLowerCase())
        if (foundTable) {
          declaredTables.push(foundTable)
        }
      }

      // SQL 关键字
      const commonKeywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
        'AND', 'OR', 'ORDER BY', 'GROUP BY', 'LIMIT', 'AS', 'ON'
      ]

      const otherKeywords = [
        'FULL JOIN', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
        'HAVING', 'ASC', 'DESC', 'OFFSET', 'DISTINCT',
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
        'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE',
        'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
        'UNION', 'UNION ALL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
      ]

      // FROM 后面：只显示表名，高优先级
      if (isAfterFrom) {
        props.tables.forEach((table) => {
          suggestions.push({
            label: table,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table,
            detail: '表名',
            sortText: '0_' + table, // 使用 0_ 前缀确保排在最前
            range
          })
        })
      } else if (isAfterSelect || isAfterWhere) { // SELECT 或 WHERE 后面：只显示字段，高优先级
        // 如果已经声明了表，只显示这些表的字段
        if (declaredTables.length > 0) {
          declaredTables.forEach((tableName) => {
            const fields = props.columns[tableName] || []
            fields.forEach((field) => {
              suggestions.push({
                label: field,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: field,
                detail: `${tableName} 字段`,
                sortText: '0_' + field,
                range
              })
            })
          })
        } else { // 否则显示所有字段
          Object.entries(props.columns).forEach(([tableName, fields]) => {
            fields.forEach((field) => {
              suggestions.push({
                label: field,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: field,
                detail: `${tableName} 字段`,
                sortText: '0_' + field,
                range
              })
            })
          })
        }
      } else { // 其他位置：显示所有提示
        // 添加常用关键字提示（高优先级）
        commonKeywords.forEach((keyword) => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            detail: 'SQL 关键字',
            sortText: '1_' + keyword,
            range
          })
        })

        // 添加其他关键字提示（较低优先级）
        otherKeywords.forEach((keyword) => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            detail: 'SQL 关键字',
            sortText: '2_' + keyword,
            range
          })
        })

        // 添加表名提示
        props.tables.forEach((table) => {
          suggestions.push({
            label: table,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table,
            detail: '表名',
            sortText: '3_' + table,
            range
          })
        })

        // 添加字段提示
        Object.entries(props.columns).forEach(([tableName, fields]) => {
          fields.forEach((field) => {
            suggestions.push({
              label: field,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: field,
              detail: `${tableName} 字段`,
              sortText: '4_' + field,
              range
            })
          })
        })
      }

      return { suggestions }
    }
  })

  const container = document.getElementById('editor')
  if (container) {
    editor = monaco.editor.create(container, {
      value: value.value,
      language: 'sql',
      theme: getTheme(),
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: false,
      lineNumbersMinChars: 3,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        horizontal: 'auto',
        vertical: 'auto'
      },
      autoClosingBrackets: 'always',
      autoClosingOvertype: 'always',
      autoClosingQuotes: 'always'
    })

    // 监听编辑器内容变化
    editor.onDidChangeModelContent(() => {
      if (editor) {
        value.value = editor.getValue()
      }
    })
  }
})

// 监听 colorMode 变化，动态更新主题
watch(() => colorMode.value, () => {
  if (editor) {
    monaco.editor.setTheme(getTheme())
  }
})

onUnmounted(() => {
  editor?.dispose()
  completionProvider?.dispose()
})

// 暴露方法给父组件
defineExpose({
  formatSQL,
  getValue,
  setValue
})
</script>

<template>
  <div id="editor" class="h-100" />
</template>
