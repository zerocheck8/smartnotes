// 标记类型定义
// [开始位置, 结束位置, 类型, 提示信息?]
export type MarkupItem = [number, number, string, string?]
export type Markup = MarkupItem[]

// 合并多个标记
export function mergeMarkup(...markups: Markup[]): Markup {
  let result: Markup = []
  for (let markup of markups) {
    result.push(...markup)
  }
  return result
}

// 偏移标记位置
export function offsetMarkup(markup: Markup, offset: number): Markup {
  return markup.map(([start, end, type, tooltip]) => {
    return [start + offset, end + offset, type, tooltip]
  })
} 