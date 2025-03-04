import axios from 'axios';
import { StockInfo, StockPrice, StockQuote, StockDataSource } from './types';

/**
 * Yahoo Finance股票数据源实现
 */
export class YahooFinanceDataSource implements StockDataSource {
  name = 'Yahoo Finance';
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance';
  private maxRetries = 3;  // 最大重试次数

  /**
   * 获取股票基本信息
   * @param symbol 股票代码
   */
  async getStockInfo(symbol: string): Promise<StockInfo> {
    // 转换中国股票代码格式
    const formattedSymbol = this.formatChineseSymbol(symbol);
    
    try {
      // 添加重试逻辑
      let retries = 0;
      let error: any;
      
      while (retries < this.maxRetries) {
        try {
          const response = await axios.get(`${this.baseUrl}/quoteSummary/${formattedSymbol}`, {
            params: {
              modules: 'assetProfile,summaryDetail',
              formatted: 'false'
            },
            timeout: 5000  // 设置超时时间
          });

          const data = response.data.quoteSummary.result[0];
          const profile = data.assetProfile || {};
          const summary = data.summaryDetail || {};
          
          return {
            symbol,
            name: profile.shortName || profile.longName || symbol,
            exchange: profile.exchange || '',
            industry: profile.industry || '',
            listDate: '',
            isIndex: symbol.startsWith('^')
          };
        } catch (err) {
          error = err;
          retries++;
          // 等待一段时间再重试
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      throw error;
    } catch (error) {
      console.error(`获取股票信息失败: ${symbol}`, error);
      // 返回基本信息，避免程序崩溃
      return {
        symbol,
        name: symbol,
        exchange: '',
        industry: '',
        isIndex: symbol.startsWith('^')
      };
    }
  }

  /**
   * 获取股票历史价格数据
   * @param symbol 股票代码
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   */
  async getStockPrice(symbol: string, startDate: string, endDate: string): Promise<StockPrice[]> {
    // 转换中国股票代码格式
    const formattedSymbol = this.formatChineseSymbol(symbol);
    
    try {
      // 转换日期为Unix时间戳（毫秒）
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      
      // 添加重试逻辑
      let retries = 0;
      let error: any;
      
      while (retries < this.maxRetries) {
        try {
          const response = await axios.get(`${this.baseUrl}/chart/${formattedSymbol}`, {
            params: {
              period1: startTimestamp,
              period2: endTimestamp,
              interval: '1d',
              includePrePost: false,
              events: 'div,split'
            },
            timeout: 5000  // 设置超时时间
          });

          const result = response.data.chart.result[0];
          if (!result) {
            return [];
          }

          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];
          const prices: StockPrice[] = [];
          
          for (let i = 0; i < timestamps.length; i++) {
            // 跳过无效数据
            if (quotes.open[i] === null || quotes.close[i] === null) {
              continue;
            }
            
            const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
            const open = quotes.open[i];
            const close = quotes.close[i];
            const change = close - open;
            const changePercent = (change / open) * 100;
            
            prices.push({
              symbol,
              date,
              open,
              high: quotes.high[i],
              low: quotes.low[i],
              close,
              volume: quotes.volume[i],
              change,
              changePercent
            });
          }
          
          // 按日期排序（从新到旧）
          return prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (err) {
          error = err;
          retries++;
          // 等待一段时间再重试
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      throw error;
    } catch (error) {
      console.error(`获取股票价格数据失败: ${symbol}`, error);
      return [];
    }
  }

  /**
   * 获取股票实时行情
   * @param symbol 股票代码
   */
  async getStockQuote(symbol: string): Promise<StockQuote> {
    // 转换中国股票代码格式
    const formattedSymbol = this.formatChineseSymbol(symbol);
    
    try {
      // 添加重试逻辑
      let retries = 0;
      let error: any;
      
      while (retries < this.maxRetries) {
        try {
          const response = await axios.get(`${this.baseUrl}/quote`, {
            params: {
              symbols: formattedSymbol
            },
            timeout: 5000  // 设置超时时间
          });

          const quoteData = response.data.quoteResponse.result[0];
          if (!quoteData) {
            throw new Error('无法获取股票行情数据');
          }

          const price = quoteData.regularMarketPrice;
          const prevClose = quoteData.regularMarketPreviousClose;
          const change = quoteData.regularMarketChange;
          const changePercent = quoteData.regularMarketChangePercent;

          return {
            symbol,
            name: quoteData.shortName || quoteData.longName || symbol,
            price,
            change,
            changePercent,
            open: quoteData.regularMarketOpen,
            high: quoteData.regularMarketDayHigh,
            low: quoteData.regularMarketDayLow,
            volume: quoteData.regularMarketVolume,
            marketCap: quoteData.marketCap,
            timestamp: Date.now()
          };
        } catch (err) {
          error = err;
          retries++;
          // 等待一段时间再重试
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      throw error;
    } catch (error) {
      console.error(`获取股票实时行情失败: ${symbol}`, error);
      // 返回默认值，避免程序崩溃
      return {
        symbol,
        name: symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 搜索股票
   * @param keyword 关键词
   */
  async searchStocks(keyword: string): Promise<StockInfo[]> {
    try {
      // 添加重试逻辑
      let retries = 0;
      let error: any;
      
      while (retries < this.maxRetries) {
        try {
          const response = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
            params: {
              q: keyword,
              quotesCount: 10,
              newsCount: 0
            },
            timeout: 5000  // 设置超时时间
          });

          const quotes = response.data.quotes || [];
          
          return quotes.map((quote: any) => ({
            symbol: quote.symbol,
            name: quote.shortname || quote.longname || quote.symbol,
            exchange: quote.exchange || '',
            industry: '',
            isIndex: quote.quoteType === 'INDEX'
          }));
        } catch (err) {
          error = err;
          retries++;
          // 等待一段时间再重试
          if (retries < this.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }
      
      throw error;
    } catch (error) {
      console.error(`搜索股票失败: ${keyword}`, error);
      return [];
    }
  }
  
  /**
   * 格式化中国股票代码，使其符合Yahoo Finance的格式
   * @param symbol 原始股票代码
   * @returns 格式化后的股票代码
   */
  private formatChineseSymbol(symbol: string): string {
    // 如果已经是Yahoo Finance格式，直接返回
    if (symbol.includes('.SS') || symbol.includes('.SZ') || symbol.includes('.HK')) {
      return symbol;
    }
    
    // 上海证券交易所股票代码转换
    if (/^(600|601|603|605|688)\d{3}$/.test(symbol)) {
      return `${symbol}.SS`;
    }
    
    // 深圳证券交易所股票代码转换
    if (/^(000|001|002|003|004|300|301|302|303|399)\d{3,4}$/.test(symbol)) {
      return `${symbol}.SZ`;
    }
    
    // 香港证券交易所股票代码转换
    if (/^\d{4,5}$/.test(symbol) && symbol.length <= 5) {
      return `${symbol}.HK`;
    }
    
    // 其他情况，返回原始代码
    return symbol;
  }
}

/**
 * GitHub开源数据源 - 使用EOD历史数据
 * 数据来源: https://github.com/datasets/s-and-p-500-companies
 */
export class GitHubDataSource implements StockDataSource {
  name = 'GitHub Open Data';
  private yahooFinance = new YahooFinanceDataSource();
  
  // 缓存S&P 500成分股数据
  private sp500Companies: StockInfo[] = [];
  
  constructor() {
    // 初始化时加载S&P 500成分股数据
    this.loadSP500Companies();
  }
  
  /**
   * 加载S&P 500成分股数据
   */
  private async loadSP500Companies(): Promise<void> {
    try {
      const response = await axios.get(
        'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv'
      );
      
      const csvData = response.data;
      const lines = csvData.split('\n');
      
      // 跳过标题行
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [symbol, name, sector] = line.split(',');
        
        this.sp500Companies.push({
          symbol,
          name,
          exchange: 'NYSE/NASDAQ',
          industry: sector,
          isIndex: false
        });
      }
      
      console.log(`已加载 ${this.sp500Companies.length} 支S&P 500成分股`);
    } catch (error) {
      console.error('加载S&P 500成分股数据失败:', error);
    }
  }
  
  /**
   * 获取股票信息
   * @param symbol 股票代码
   */
  async getStockInfo(symbol: string): Promise<StockInfo> {
    // 先从缓存中查找
    const cachedInfo = this.sp500Companies.find(stock => stock.symbol === symbol);
    if (cachedInfo) {
      return cachedInfo;
    }
    
    // 如果缓存中没有，则使用Yahoo Finance API
    return this.yahooFinance.getStockInfo(symbol);
  }
  
  /**
   * 获取股票历史价格数据
   * @param symbol 股票代码
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async getStockPrice(symbol: string, startDate: string, endDate: string): Promise<StockPrice[]> {
    // 使用Yahoo Finance API获取历史价格
    return this.yahooFinance.getStockPrice(symbol, startDate, endDate);
  }
  
  /**
   * 获取股票实时行情
   * @param symbol 股票代码
   */
  async getStockQuote(symbol: string): Promise<StockQuote> {
    // 使用Yahoo Finance API获取实时行情
    return this.yahooFinance.getStockQuote(symbol);
  }
  
  /**
   * 搜索股票
   * @param keyword 关键词
   */
  async searchStocks(keyword: string): Promise<StockInfo[]> {
    // 先在缓存中搜索
    const cachedResults = this.sp500Companies.filter(
      stock => stock.symbol.includes(keyword.toUpperCase()) || 
               stock.name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (cachedResults.length > 0) {
      return cachedResults;
    }
    
    // 如果缓存中没有结果，则使用Yahoo Finance API
    return this.yahooFinance.searchStocks(keyword);
  }
}

// 导出默认数据源实例
export const stockDataSource = new GitHubDataSource(); 