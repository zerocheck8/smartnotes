import Big from 'big.js'
import { apply } from './apply'
import {
  CurrencyCode,
  CurrencyRates,
  findCurrencyCode,
  findCurrencyInfo,
} from './currencies'
import { Markup } from './markup'
import { chineseOperators } from './operators'
import { Header, Nothing, Numbr, Percent, Result } from './results'

// 词法分析器的Token类型
export type Token = {
  type: string
  value: string
  start: number
  end: number
}

export type Context = {
  rates: CurrencyRates
  answers: any[]
  line: number
  variables: Map<string, Result>
}

export interface Node {
  evaluate(ctx: Context): Result
  highlight(): Markup
  toString(): string
}

export class Currency implements Node {
  kind: 'currency' = 'currency'

  constructor(
    public token: Token,
  ) {
  }

  evaluate(ctx: Context): Result {
    return new Nothing()
  }

  toCurrencyCode(): CurrencyCode | undefined {
    return findCurrencyCode(this.token.value)
  }

  highlight() {
    let name: string | undefined
    let code = this.toCurrencyCode()
    if (code) {
      name = findCurrencyInfo(code)?.name
    }
    let markup: Markup = []
    markup.push([this.token.start, this.token.end, 'currency', name])
    return markup
  }

  toString() {
    return this.toCurrencyCode() || '???'
  }
}

export class Nil implements Node {
  kind: 'nil' = 'nil'

  evaluate(ctx: Context): Result {
    return new Nothing()
  }

  highlight() {
    return []
  }

  toString() {
    return 'nil'
  }
}

export class Value implements Node {
  kind: 'value' = 'value'

  constructor(
    public value: Token,
    public currency?: Currency,
  ) {
  }

  evaluate(ctx: Context): Result {
    let s = this.value.value
    let multiplier = 1

    // 处理中文数字单位
    if (/千$/.test(s)) multiplier = 1e3
    if (/万$/.test(s)) multiplier = 1e4
    if (/亿$/.test(s)) multiplier = 1e8
    
    // 处理英文数字单位
    if (/k$/i.test(s)) multiplier = 1e3
    if (/M$/i.test(s)) multiplier = 1e6
    if (s == '💯') s = '100'

    s = s.replace(/[\s,'_]/g, '')
      .replace(/千$/, '')
      .replace(/万$/, '')
      .replace(/亿$/, '')
      .replace(/k$/i, '')
      .replace(/M$/i, '')
    
    return new Numbr(Big(s).mul(multiplier), this.currency?.toCurrencyCode())
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.value.start, this.value.end, 'number'])
    if (this.currency) {
      markup.push(...this.currency.highlight())
    }
    return markup
  }

  toString() {
    let s = this.value.value
    if (this.currency) {
      return `${s} ${this.currency.toString()}`
    }
    return s
  }
}

export class Percentage implements Node {
  kind: 'percentage' = 'percentage'

  constructor(
    public value: Token,
  ) {
  }

  evaluate(ctx: Context): Result {
    let s = this.value.value.replace('%', '')
    return new Percent(Big(s))
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.value.start, this.value.end, 'percentage'])
    return markup
  }

  toString() {
    return this.value.value
  }
}

export class Sum implements Node {
  kind: 'sum' = 'sum'

  constructor(
    public token: Token,
  ) {
  }

  evaluate(ctx: Context): Result {
    let sum = Big(0)
    let currency: CurrencyCode | undefined
    
    // 查找最近的标题之前的所有结果
    let i = ctx.answers.length - 1
    while (i >= 0) {
      let answer = ctx.answers[i]
      if (answer instanceof Header) {
        break
      }
      if (answer instanceof Numbr) {
        if (!currency) {
          currency = answer.currency
        }
        if (currency === answer.currency) {
          sum = sum.plus(answer.value)
        }
      }
      i--
    }
    
    return new Numbr(sum, currency)
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.token.start, this.token.end, 'sum'])
    return markup
  }

  toString() {
    return this.token.value
  }
}

export class Unary implements Node {
  kind: 'unary' = 'unary'

  constructor(
    public op: Token,
    public node: Node,
  ) {
  }

  evaluate(ctx: Context): Result {
    let result = this.node.evaluate(ctx)
    if (result instanceof Numbr) {
      if (this.op.value === '-') {
        return new Numbr(result.value.mul(-1), result.currency)
      }
    }
    return result
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.op.start, this.op.end, 'operator'])
    markup.push(...this.node.highlight())
    return markup
  }

  toString() {
    return `${this.op.value}${this.node.toString()}`
  }
}

export class Binary implements Node {
  kind: 'binary' = 'binary'

  constructor(
    public op: Token,
    public left: Node,
    public right: Node,
  ) {
  }

  evaluate(ctx: Context): Result {
    // 处理中文运算符
    let opValue = this.op.value
    if (chineseOperators.has(opValue)) {
      opValue = chineseOperators.get(opValue) || opValue
    }
    
    let left = this.left.evaluate(ctx)
    let right = this.right.evaluate(ctx)

    if (left instanceof Numbr && right instanceof Numbr) {
      // 处理货币转换
      if (opValue === 'in' || opValue === 'to') {
        if (left.currency && right.currency && left.currency !== right.currency) {
          let rate = ctx.rates[right.currency] / ctx.rates[left.currency]
          return new Numbr(left.value.mul(rate), right.currency)
        }
        return left
      }

      // 处理百分比
      if (right instanceof Percent) {
        if (opValue === '+') {
          return new Numbr(left.value.plus(left.value.mul(right.value).div(100)), left.currency)
        }
        if (opValue === '-') {
          return new Numbr(left.value.minus(left.value.mul(right.value).div(100)), left.currency)
        }
        if (opValue === '*' || opValue === '×' || opValue === 'x') {
          return new Numbr(left.value.mul(right.value).div(100), left.currency)
        }
      }

      // 处理普通运算
      if (left.currency === right.currency || !right.currency) {
        return new Numbr(apply(opValue, left.value, right.value), left.currency)
      }
      if (!left.currency && right.currency) {
        return new Numbr(apply(opValue, left.value, right.value), right.currency)
      }
      
      // 处理不同货币
      if (left.currency && right.currency && left.currency !== right.currency) {
        let rightInLeft = right.value.mul(ctx.rates[right.currency]).div(ctx.rates[left.currency])
        return new Numbr(apply(opValue, left.value, rightInLeft), left.currency)
      }
    }

    return new Nothing()
  }

  highlight() {
    let markup: Markup = []
    markup.push(...this.left.highlight())
    markup.push([this.op.start, this.op.end, 'operator'])
    markup.push(...this.right.highlight())
    return markup
  }

  toString() {
    return `${this.left.toString()} ${this.op.value} ${this.right.toString()}`
  }
}

export class Conversion implements Node {
  kind: 'conversion' = 'conversion'

  constructor(
    public op: Token | undefined,
    public node: Node,
    public currency: Currency,
  ) {
  }

  evaluate(ctx: Context): Result {
    let result = this.node.evaluate(ctx)
    if (result instanceof Numbr) {
      let targetCurrency = this.currency.toCurrencyCode()
      if (targetCurrency && result.currency && targetCurrency !== result.currency) {
        let rate = ctx.rates[targetCurrency] / ctx.rates[result.currency]
        return new Numbr(result.value.mul(rate), targetCurrency)
      }
      if (targetCurrency && !result.currency) {
        return new Numbr(result.value, targetCurrency)
      }
    }
    return result
  }

  highlight() {
    let markup: Markup = []
    markup.push(...this.node.highlight())
    if (this.op) {
      markup.push([this.op.start, this.op.end, 'operator'])
    }
    markup.push(...this.currency.highlight())
    return markup
  }

  toString() {
    if (this.op) {
      return `${this.node.toString()} ${this.op.value} ${this.currency.toString()}`
    }
    return `${this.node.toString()} ${this.currency.toString()}`
  }
}

export class Assignment implements Node {
  kind: 'assignment' = 'assignment'

  constructor(
    public op: Token,
    public variable: Token,
    public node: Node,
  ) {
  }

  evaluate(ctx: Context): Result {
    let result = this.node.evaluate(ctx)
    let name = this.variable.value.toLowerCase()
    ctx.variables.set(name, result)
    return result
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.variable.start, this.variable.end, 'variable'])
    markup.push([this.op.start, this.op.end, 'operator'])
    markup.push(...this.node.highlight())
    return markup
  }

  toString() {
    return `${this.variable.value} ${this.op.value} ${this.node.toString()}`
  }
}

export class Variable implements Node {
  kind: 'variable' = 'variable'

  constructor(
    public token: Token,
  ) {
  }

  evaluate(ctx: Context): Result {
    let name = this.token.value.toLowerCase()
    return ctx.variables.get(name) || new Nothing()
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.token.start, this.token.end, 'variable'])
    return markup
  }

  toString() {
    return this.token.value
  }
}

export class Reference implements Node {
  kind: 'reference' = 'reference'

  constructor(
    public token: Token,
  ) {
  }

  evaluate(ctx: Context): Result {
    let index = parseInt(this.token.value.replace(/[()]/g, '')) - 1
    if (index >= 0 && index < ctx.answers.length) {
      return ctx.answers[index]
    }
    return new Nothing()
  }

  highlight() {
    let markup: Markup = []
    markup.push([this.token.start, this.token.end, 'reference'])
    return markup
  }

  toString() {
    return this.token.value
  }
} 