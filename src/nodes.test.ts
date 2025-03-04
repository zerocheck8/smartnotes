import test from 'ava'
import Big from 'big.js'
import { Binary, Currency, Value } from './nodes'
import { Numbr } from './results'

test('Value 节点应该正确处理中文数字单位', t => {
  const token = { type: 'number', value: '1万', start: 0, end: 2 }
  const value = new Value(token)
  const result = value.evaluate({ rates: {}, answers: [], line: 0, variables: new Map() })
  
  t.true(result instanceof Numbr)
  if (result instanceof Numbr) {
    t.is(result.value.toString(), '10000')
  }
})

test('Value 节点应该正确处理带货币的数字', t => {
  const currencyToken = { type: 'currency', value: '¥', start: 1, end: 2 }
  const currency = new Currency(currencyToken)
  const valueToken = { type: 'number', value: '100', start: 0, end: 1 }
  const value = new Value(valueToken, currency)
  const result = value.evaluate({ rates: {}, answers: [], line: 0, variables: new Map() })
  
  t.true(result instanceof Numbr)
  if (result instanceof Numbr) {
    t.is(result.value.toString(), '100')
    t.is(result.currency, 'CNY')
  }
})

test('Binary 节点应该正确处理加法', t => {
  const leftToken = { type: 'number', value: '100', start: 0, end: 3 }
  const left = new Value(leftToken)
  
  const opToken = { type: 'operator', value: '+', start: 4, end: 5 }
  
  const rightToken = { type: 'number', value: '200', start: 6, end: 9 }
  const right = new Value(rightToken)
  
  const binary = new Binary(opToken, left, right)
  const result = binary.evaluate({ rates: {}, answers: [], line: 0, variables: new Map() })
  
  t.true(result instanceof Numbr)
  if (result instanceof Numbr) {
    t.is(result.value.toString(), '300')
  }
})

test('Binary 节点应该正确处理中文运算符', t => {
  const leftToken = { type: 'number', value: '100', start: 0, end: 3 }
  const left = new Value(leftToken)
  
  const opToken = { type: 'operator', value: '加', start: 4, end: 5 }
  
  const rightToken = { type: 'number', value: '200', start: 6, end: 9 }
  const right = new Value(rightToken)
  
  const binary = new Binary(opToken, left, right)
  const result = binary.evaluate({ rates: {}, answers: [], line: 0, variables: new Map() })
  
  t.true(result instanceof Numbr)
  if (result instanceof Numbr) {
    t.is(result.value.toString(), '300')
  }
}) 