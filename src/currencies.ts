export type CurrencyCode = string & { kind: 'currency_code' }
export type CurrencyRates = { [currency: string]: number }

export type CurrencyInfo = {
  name: CurrencyCode
  dp: number
}

// 这些数据将从JSON文件加载，这里先定义空对象
export const currencies: { [id: string]: CurrencyInfo } = {}
export const cryptoCurrencies: { [id: string]: CurrencyInfo } = {}

export let currenciesList = new Set<string>()

export function updateCurrenciesList(keys: string[]) {
  keys.forEach(id => {
    if (id.toUpperCase() != id) {
      throw new Error(`货币代码 ${id} 必须是大写!`)
    }
  })
  currenciesList = new Set(keys)
}

export const currencySignsToCode = new Map<string, CurrencyCode>()
currencySignsToCode.set('¥', 'CNY' as CurrencyCode)
currencySignsToCode.set('￥', 'CNY' as CurrencyCode)
currencySignsToCode.set('$', 'USD' as CurrencyCode)
currencySignsToCode.set('＄', 'USD' as CurrencyCode)
currencySignsToCode.set('﹩', 'USD' as CurrencyCode)
currencySignsToCode.set('₽', 'RUB' as CurrencyCode)
currencySignsToCode.set('€', 'EUR' as CurrencyCode)
currencySignsToCode.set('£', 'GBP' as CurrencyCode)
currencySignsToCode.set('฿', 'THB' as CurrencyCode)
currencySignsToCode.set('円', 'JPY' as CurrencyCode)
currencySignsToCode.set('₣', 'CHF' as CurrencyCode)
currencySignsToCode.set('₩', 'KRW' as CurrencyCode)
export const currencySigns = new Set(currencySignsToCode.keys())

const currencyWordsToCode: [RegExp, CurrencyCode][] = [
  [/^人民币$/i, 'CNY' as CurrencyCode],
  [/^元$/i, 'CNY' as CurrencyCode],
  [/^块钱$/i, 'CNY' as CurrencyCode],
  [/^美元$/i, 'USD' as CurrencyCode],
  [/^美金$/i, 'USD' as CurrencyCode],
  [/^欧元$/i, 'EUR' as CurrencyCode],
  [/^英镑$/i, 'GBP' as CurrencyCode],
  [/^日元$/i, 'JPY' as CurrencyCode],
  [/^韩元$/i, 'KRW' as CurrencyCode],
  [/^卢布$/i, 'RUB' as CurrencyCode],
  [/^泰铢$/i, 'THB' as CurrencyCode],
  [/^瑞士法郎$/i, 'CHF' as CurrencyCode],
  [/^港币$/i, 'HKD' as CurrencyCode],
  [/^澳元$/i, 'AUD' as CurrencyCode],
  [/^加元$/i, 'CAD' as CurrencyCode],
  [/^新西兰元$/i, 'NZD' as CurrencyCode],
  [/^新加坡元$/i, 'SGD' as CurrencyCode],
  [/^比特币$/i, 'BTC' as CurrencyCode],
  [/^以太币$/i, 'ETH' as CurrencyCode],
  
  // 英文货币名称
  [/^dollars?$/i, 'USD' as CurrencyCode],
  [/^euros?$/i, 'EUR' as CurrencyCode],
  [/^pounds?$/i, 'GBP' as CurrencyCode],
  [/^ro?ubl(es?)?$/i, 'RUB' as CurrencyCode],
  [/^baht$/i, 'THB' as CurrencyCode],
  [/^bitcoins?$/i, 'BTC' as CurrencyCode],
]

function findCurrencyCodeByWord(word: string): CurrencyCode | undefined {
  for (let [r, code] of currencyWordsToCode) {
    if (r.test(word)) return code
  }
  return undefined
}

export function findCurrencyCode(word: string): CurrencyCode | undefined {
  let code = currencySignsToCode.get(word)
  if (code) return code

  code = findCurrencyCodeByWord(word)
  if (code) return code

  word = word.toUpperCase()
  if (currenciesList.has(word)) return word as CurrencyCode
  return undefined
}

export function findCurrencyInfo(code: CurrencyCode): CurrencyInfo | undefined {
  return currencies[code] || cryptoCurrencies[code] || undefined
} 