import Big from 'big.js'
import { CurrencyCode } from './currencies'

export interface Result {
  toString(): string
}

export class Nothing implements Result {
  toString() {
    return ''
  }
}

export class Header implements Result {
  constructor(
    public text: string,
  ) {
  }

  toString() {
    return this.text
  }
}

export class Numbr implements Result {
  constructor(
    public value: Big,
    public currency?: CurrencyCode,
  ) {
  }

  toString() {
    let s = this.value.toString()
    if (this.currency) {
      return `${s} ${this.currency}`
    }
    return s
  }
}

export class Percent implements Result {
  constructor(
    public value: Big,
  ) {
  }

  toString() {
    return `${this.value.toString()}%`
  }
} 