// 股票基本信息类型
export interface StockInfo {
  symbol: string;       // 股票代码
  name: string;         // 股票名称
  exchange: string;     // 交易所
  industry: string;     // 行业
  listDate?: string;    // 上市日期
  isIndex?: boolean;    // 是否为指数
}

// 股票价格数据类型
export interface StockPrice {
  symbol: string;       // 股票代码
  date: string;         // 日期
  open: number;         // 开盘价
  high: number;         // 最高价
  low: number;          // 最低价
  close: number;        // 收盘价
  volume: number;       // 成交量
  change?: number;      // 涨跌额
  changePercent?: number; // 涨跌幅
}

// 股票实时行情类型
export interface StockQuote {
  symbol: string;       // 股票代码
  name: string;         // 股票名称
  price: number;        // 当前价格
  change: number;       // 涨跌额
  changePercent: number; // 涨跌幅
  open: number;         // 开盘价
  high: number;         // 最高价
  low: number;          // 最低价
  volume: number;       // 成交量
  marketCap?: number;   // 市值
  timestamp: number;    // 时间戳
}

// 用户持仓记录类型
export interface StockHolding {
  symbol: string;       // 股票代码
  name: string;         // 股票名称
  shares: number;       // 持有股数
  costPrice: number;    // 成本价
  currentPrice: number; // 当前价格
  value: number;        // 市值
  profit: number;       // 盈亏
  profitPercent: number; // 盈亏百分比
  lastUpdated: number;  // 最后更新时间
}

// 交易记录类型
export interface StockTransaction {
  id: string;           // 交易ID
  date: string;         // 交易日期
  symbol: string;       // 股票代码
  name: string;         // 股票名称
  type: 'buy' | 'sell'; // 交易类型：买入或卖出
  shares: number;       // 交易股数
  price: number;        // 交易价格
  fee: number;          // 手续费
  total: number;        // 交易总额
  notes?: string;       // 备注
}

// 股票数据源接口
export interface StockDataSource {
  name: string;                 // 数据源名称
  getStockInfo(symbol: string): Promise<StockInfo>;  // 获取股票信息
  getStockPrice(symbol: string, startDate: string, endDate: string): Promise<StockPrice[]>;  // 获取历史价格
  getStockQuote(symbol: string): Promise<StockQuote>;  // 获取实时行情
  searchStocks(keyword: string): Promise<StockInfo[]>;  // 搜索股票
} 