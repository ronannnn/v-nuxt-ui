// 直接映射完整的类名字符串，包括响应式断点
const colSpanClassMap: Record<string, string> = {
  // 基础类名
  '1': 'col-span-1',
  '2': 'col-span-2',
  '3': 'col-span-3',
  '4': 'col-span-4',
  '5': 'col-span-5',
  '6': 'col-span-6',
  '7': 'col-span-7',
  '8': 'col-span-8',
  '9': 'col-span-9',
  '10': 'col-span-10',
  '11': 'col-span-11',
  '12': 'col-span-12',
  '13': 'col-span-13',
  '14': 'col-span-14',
  '15': 'col-span-15',
  '16': 'col-span-16',
  '17': 'col-span-17',
  '18': 'col-span-18',
  '19': 'col-span-19',
  '20': 'col-span-20',
  '21': 'col-span-21',
  '22': 'col-span-22',
  '23': 'col-span-23',
  '24': 'col-span-24',
  // sm 响应式
  'sm:1': 'sm:col-span-1',
  'sm:2': 'sm:col-span-2',
  'sm:3': 'sm:col-span-3',
  'sm:4': 'sm:col-span-4',
  'sm:5': 'sm:col-span-5',
  'sm:6': 'sm:col-span-6',
  'sm:7': 'sm:col-span-7',
  'sm:8': 'sm:col-span-8',
  'sm:9': 'sm:col-span-9',
  'sm:10': 'sm:col-span-10',
  'sm:11': 'sm:col-span-11',
  'sm:12': 'sm:col-span-12',
  'sm:13': 'sm:col-span-13',
  'sm:14': 'sm:col-span-14',
  'sm:15': 'sm:col-span-15',
  'sm:16': 'sm:col-span-16',
  'sm:17': 'sm:col-span-17',
  'sm:18': 'sm:col-span-18',
  'sm:19': 'sm:col-span-19',
  'sm:20': 'sm:col-span-20',
  'sm:21': 'sm:col-span-21',
  'sm:22': 'sm:col-span-22',
  'sm:23': 'sm:col-span-23',
  'sm:24': 'sm:col-span-24',
  // md 响应式
  'md:1': 'md:col-span-1',
  'md:2': 'md:col-span-2',
  'md:3': 'md:col-span-3',
  'md:4': 'md:col-span-4',
  'md:5': 'md:col-span-5',
  'md:6': 'md:col-span-6',
  'md:7': 'md:col-span-7',
  'md:8': 'md:col-span-8',
  'md:9': 'md:col-span-9',
  'md:10': 'md:col-span-10',
  'md:11': 'md:col-span-11',
  'md:12': 'md:col-span-12',
  'md:13': 'md:col-span-13',
  'md:14': 'md:col-span-14',
  'md:15': 'md:col-span-15',
  'md:16': 'md:col-span-16',
  'md:17': 'md:col-span-17',
  'md:18': 'md:col-span-18',
  'md:19': 'md:col-span-19',
  'md:20': 'md:col-span-20',
  'md:21': 'md:col-span-21',
  'md:22': 'md:col-span-22',
  'md:23': 'md:col-span-23',
  'md:24': 'md:col-span-24',
  // lg 响应式
  'lg:1': 'lg:col-span-1',
  'lg:2': 'lg:col-span-2',
  'lg:3': 'lg:col-span-3',
  'lg:4': 'lg:col-span-4',
  'lg:5': 'lg:col-span-5',
  'lg:6': 'lg:col-span-6',
  'lg:7': 'lg:col-span-7',
  'lg:8': 'lg:col-span-8',
  'lg:9': 'lg:col-span-9',
  'lg:10': 'lg:col-span-10',
  'lg:11': 'lg:col-span-11',
  'lg:12': 'lg:col-span-12',
  'lg:13': 'lg:col-span-13',
  'lg:14': 'lg:col-span-14',
  'lg:15': 'lg:col-span-15',
  'lg:16': 'lg:col-span-16',
  'lg:17': 'lg:col-span-17',
  'lg:18': 'lg:col-span-18',
  'lg:19': 'lg:col-span-19',
  'lg:20': 'lg:col-span-20',
  'lg:21': 'lg:col-span-21',
  'lg:22': 'lg:col-span-22',
  'lg:23': 'lg:col-span-23',
  'lg:24': 'lg:col-span-24',
  // xl 响应式
  'xl:1': 'xl:col-span-1',
  'xl:2': 'xl:col-span-2',
  'xl:3': 'xl:col-span-3',
  'xl:4': 'xl:col-span-4',
  'xl:5': 'xl:col-span-5',
  'xl:6': 'xl:col-span-6',
  'xl:7': 'xl:col-span-7',
  'xl:8': 'xl:col-span-8',
  'xl:9': 'xl:col-span-9',
  'xl:10': 'xl:col-span-10',
  'xl:11': 'xl:col-span-11',
  'xl:12': 'xl:col-span-12',
  'xl:13': 'xl:col-span-13',
  'xl:14': 'xl:col-span-14',
  'xl:15': 'xl:col-span-15',
  'xl:16': 'xl:col-span-16',
  'xl:17': 'xl:col-span-17',
  'xl:18': 'xl:col-span-18',
  'xl:19': 'xl:col-span-19',
  'xl:20': 'xl:col-span-20',
  'xl:21': 'xl:col-span-21',
  'xl:22': 'xl:col-span-22',
  'xl:23': 'xl:col-span-23',
  'xl:24': 'xl:col-span-24'
}

export const getColSpanClass = (colSpan?: number) => {
  return colSpanClassMap[String(colSpan)] ?? 'col-span-6'
}

// '3 sm:5 md:6' to 'col-span-3 sm:col-span-5 md:col-span-6'
export const getColSpanClassFromResponsive = (colSpan?: string) => {
  if (!colSpan) return ''

  const colSpanClasses = colSpan.split(' ').map((span) => {
    const className = colSpanClassMap[span]
    if (!className) {
      console.warn(`Invalid colSpan format: ${span}`)
      return ''
    }
    return className
  }).filter(Boolean)

  return colSpanClasses.join(' ')
}
