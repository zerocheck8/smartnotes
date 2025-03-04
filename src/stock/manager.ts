import { v4 as uuidv4 } from 'uuid';
import { StockInfo, StockPrice, StockQuote, StockHolding, StockTransaction } from './types';
import { stockDataSource } from './service';
import { stockStorage } from './storage';
import schedule from 'node-schedule';

/**
 * 股票管理器类
 */
export class StockManager {
  private updateJob: schedule.Job | null = null;

  constructor() {
    // 初始化时不自动启动更新任务
  }

  /**
   * 启动自动更新任务
   * @param cronExpression cron表达式，默认为每个交易日（周一至周五）的9:30到15:30每5分钟更新一次
   */
  startAutoUpdate(cronExpression: string = '*/5 9-15 * * 1-5'): void {
    if (this.updateJob) {
      this.updateJob.cancel();
    }

    this.updateJob = schedule.scheduleJob(cronExpression, async () => {
      try {
        await this.updateAllHoldings();
        console.log(`[${new Date().toLocaleString()}] 自动更新持仓完成`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] 自动更新持仓失败:`, error);
      }
    });

    console.log(`自动更新任务已启动，调度表达式: ${cronExpression}`);
  }

  /**
   * 停止自动更新任务
   */
  stopAutoUpdate(): void {
    if (this.updateJob) {
      this.updateJob.cancel();
      this.updateJob = null;
      console.log('自动更新任务已停止');
    }
  }

  /**
   * 搜索股票
   * @param keyword 关键词
   */
  async searchStocks(keyword: string): Promise<StockInfo[]> {
    return await stockDataSource.searchStocks(keyword);
  }

  /**
   * 获取股票信息
   * @param symbol 股票代码
   * @param forceUpdate 是否强制从API更新
   */
  async getStockInfo(symbol: string, forceUpdate: boolean = false): Promise<StockInfo | null> {
    // 先从本地获取
    let stockInfo = stockStorage.getStock(symbol);
    
    // 如果本地没有或强制更新，则从API获取
    if (!stockInfo || forceUpdate) {
      try {
        stockInfo = await stockDataSource.getStockInfo(symbol);
        if (stockInfo) {
          stockStorage.addOrUpdateStock(stockInfo);
        }
      } catch (error) {
        console.error(`获取股票信息失败: ${symbol}`, error);
        return null;
      }
    }
    
    return stockInfo;
  }

  /**
   * 获取股票历史价格
   * @param symbol 股票代码
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async getStockPrices(symbol: string, startDate: string, endDate: string): Promise<StockPrice[]> {
    return await stockDataSource.getStockPrice(symbol, startDate, endDate);
  }

  /**
   * 获取股票实时行情
   * @param symbol 股票代码
   */
  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      return await stockDataSource.getStockQuote(symbol);
    } catch (error) {
      console.error(`获取股票实时行情失败: ${symbol}`, error);
      return null;
    }
  }

  /**
   * 添加交易记录
   * @param transaction 交易记录（不需要提供ID）
   */
  addTransaction(transaction: Omit<StockTransaction, 'id'>): StockTransaction {
    const newTransaction: StockTransaction = {
      ...transaction,
      id: uuidv4()
    };
    
    stockStorage.addTransaction(newTransaction);
    return newTransaction;
  }

  /**
   * 获取交易记录
   * @param symbol 股票代码（可选）
   */
  getTransactions(symbol?: string): StockTransaction[] {
    return stockStorage.getTransactions(symbol);
  }

  /**
   * 获取持仓信息
   * @param symbol 股票代码（可选）
   */
  getHoldings(symbol?: string): StockHolding[] {
    if (symbol) {
      const holding = stockStorage.getHolding(symbol);
      return holding ? [holding] : [];
    }
    return stockStorage.getAllHoldings();
  }

  /**
   * 更新所有持仓的当前价格和盈亏信息
   */
  async updateAllHoldings(): Promise<void> {
    const holdings = stockStorage.getAllHoldings();
    
    for (const holding of holdings) {
      await this.updateHolding(holding.symbol);
    }
  }

  /**
   * 更新单个持仓的当前价格和盈亏信息
   * @param symbol 股票代码
   */
  async updateHolding(symbol: string): Promise<StockHolding | null> {
    const holding = stockStorage.getHolding(symbol);
    if (!holding) {
      return null;
    }

    try {
      const quote = await this.getStockQuote(symbol);
      if (!quote) {
        return holding;
      }

      // 更新价格和盈亏信息
      holding.currentPrice = quote.price;
      holding.value = holding.shares * holding.currentPrice;
      holding.profit = holding.value - (holding.shares * holding.costPrice);
      holding.profitPercent = holding.costPrice > 0 ? (holding.profit / (holding.shares * holding.costPrice)) * 100 : 0;
      holding.lastUpdated = Date.now();

      stockStorage.addOrUpdateHolding(holding);
      return holding;
    } catch (error) {
      console.error(`更新持仓信息失败: ${symbol}`, error);
      return holding;
    }
  }

  /**
   * 计算投资组合总价值
   */
  getPortfolioValue(): { totalCost: number; totalValue: number; totalProfit: number; totalProfitPercent: number } {
    const holdings = stockStorage.getAllHoldings();
    
    let totalCost = 0;
    let totalValue = 0;
    
    for (const holding of holdings) {
      totalCost += holding.shares * holding.costPrice;
      totalValue += holding.value;
    }
    
    const totalProfit = totalValue - totalCost;
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    
    return {
      totalCost,
      totalValue,
      totalProfit,
      totalProfitPercent
    };
  }
}

// 导出单例实例
export const stockManager = new StockManager(); 