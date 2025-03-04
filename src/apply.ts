import Big from 'big.js'
import { Numbr, Percent } from './results'

// 应用操作符到数值
export function apply(op: string, left: Big, right: Big): Big {
  switch (op) {
    case '+':
      return left.plus(right)
    case '-':
      return left.minus(right)
    case '*':
    case '×':
    case 'x':
      return left.mul(right)
    case '/':
      return left.div(right)
    case '%':
      return left.mod(right)
    case '^':
      return left.pow(Number(right))
    default:
      throw new Error(`未知操作符: ${op}`)
  }
} 