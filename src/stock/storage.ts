import fs from 'fs';
import path from 'path';
import { StockInfo, StockHolding, StockTransaction } from './types';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data', 'stock');
const STOCK_INFO_FILE = path.join(DATA_DIR, 'stocks.json');
const HOLDINGS_FILE = path.join(DATA_DIR, 'holdings.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 股票数据存储类
 */
export class StockStorage {
  private stocks: Record<string, StockInfo> = {};
  private holdings: StockHolding[] = [];
  private transactions: StockTransaction[] = [];

  constructor() {
    this.loadData();
  }

  /**
   * 加载所有数据
   */
  private loadData(): void {
    this.loadStocks();
    this.loadHoldings();
    this.loadTransactions();
  }

  /**
   * 加载股票信息
   */
  private loadStocks(): void {
    try {
      if (fs.existsSync(STOCK_INFO_FILE)) {
        const data = fs.readFileSync(STOCK_INFO_FILE, 'utf8');
        this.stocks = JSON.parse(data);
      }
    } catch (error) {
      console.error('加载股票信息失败:', error);
      this.stocks = {};
    }
  }

  /**
   * 加载持仓信息
   */
  private loadHoldings(): void {
    try {
      if (fs.existsSync(HOLDINGS_FILE)) {
        const data = fs.readFileSync(HOLDINGS_FILE, 'utf8');
        this.holdings = JSON.parse(data);
      }
    } catch (error) {
      console.error('加载持仓信息失败:', error);
      this.holdings = [];
    }
  }

  /**
   * 加载交易记录
   */
  private loadTransactions(): void {
    try {
      if (fs.existsSync(TRANSACTIONS_FILE)) {
        const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
        this.transactions = JSON.parse(data);
      }
    } catch (error) {
      console.error('加载交易记录失败:', error);
      this.transactions = [];
    }
  }

  /**
   * 保存股票信息
   */
  private saveStocks(): void {
    try {
      fs.writeFileSync(STOCK_INFO_FILE, JSON.stringify(this.stocks, null, 2), 'utf8');
    } catch (error) {
      console.error('保存股票信息失败:', error);
    }
  }

  /**
   * 保存持仓信息
   */
  private saveHoldings(): void {
    try {
      fs.writeFileSync(HOLDINGS_FILE, JSON.stringify(this.holdings, null, 2), 'utf8');
    } catch (error) {
      console.error('保存持仓信息失败:', error);
    }
  }

  /**
   * 保存交易记录
   */
  private saveTransactions(): void {
    try {
      fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(this.transactions, null, 2), 'utf8');
    } catch (error) {
      console.error('保存交易记录失败:', error);
    }
  }

  /**
   * 添加或更新股票信息
   * @param stock 股票信息
   */
  addOrUpdateStock(stock: StockInfo): void {
    this.stocks[stock.symbol] = stock;
    this.saveStocks();
  }

  /**
   * 获取股票信息
   * @param symbol 股票代码
   */
  getStock(symbol: string): StockInfo | null {
    return this.stocks[symbol] || null;
  }

  /**
   * 获取所有股票信息
   */
  getAllStocks(): StockInfo[] {
    return Object.values(this.stocks);
  }

  /**
   * 添加或更新持仓信息
   * @param holding 持仓信息
   */
  addOrUpdateHolding(holding: StockHolding): void {
    const index = this.holdings.findIndex(h => h.symbol === holding.symbol);
    if (index >= 0) {
      this.holdings[index] = holding;
    } else {
      this.holdings.push(holding);
    }
    this.saveHoldings();
  }

  /**
   * 删除持仓信息
   * @param symbol 股票代码
   */
  removeHolding(symbol: string): void {
    this.holdings = this.holdings.filter(h => h.symbol !== symbol);
    this.saveHoldings();
  }

  /**
   * 获取持仓信息
   * @param symbol 股票代码
   */
  getHolding(symbol: string): StockHolding | null {
    return this.holdings.find(h => h.symbol === symbol) || null;
  }

  /**
   * 获取所有持仓信息
   */
  getAllHoldings(): StockHolding[] {
    return this.holdings;
  }

  /**
   * 添加交易记录
   * @param transaction 交易记录
   */
  addTransaction(transaction: StockTransaction): void {
    this.transactions.push(transaction);
    this.saveTransactions();
    
    // 更新持仓信息
    this.updateHoldingFromTransaction(transaction);
  }

  /**
   * 根据交易记录更新持仓信息
   * @param transaction 交易记录
   */
  private updateHoldingFromTransaction(transaction: StockTransaction): void {
    const { symbol, name, type, shares, price, total } = transaction;
    const holding = this.getHolding(symbol) || {
      symbol,
      name,
      shares: 0,
      costPrice: 0,
      currentPrice: price,
      value: 0,
      profit: 0,
      profitPercent: 0,
      lastUpdated: Date.now()
    };

    if (type === 'buy') {
      // 买入：更新持仓数量和成本价
      const oldValue = holding.shares * holding.costPrice;
      const newValue = total;
      const newShares = holding.shares + shares;
      
      holding.shares = newShares;
      holding.costPrice = newShares > 0 ? (oldValue + newValue) / newShares : 0;
    } else {
      // 卖出：减少持仓数量
      holding.shares -= shares;
    }

    // 更新市值和盈亏
    holding.currentPrice = price;
    holding.value = holding.shares * holding.currentPrice;
    holding.profit = holding.value - (holding.shares * holding.costPrice);
    holding.profitPercent = holding.costPrice > 0 ? (holding.profit / (holding.shares * holding.costPrice)) * 100 : 0;
    holding.lastUpdated = Date.now();

    if (holding.shares > 0) {
      this.addOrUpdateHolding(holding);
    } else {
      this.removeHolding(symbol);
    }
  }

  /**
   * 获取交易记录
   * @param symbol 股票代码（可选）
   */
  getTransactions(symbol?: string): StockTransaction[] {
    if (symbol) {
      return this.transactions.filter(t => t.symbol === symbol);
    }
    return this.transactions;
  }
}

// 导出单例实例
export const stockStorage = new StockStorage(); 