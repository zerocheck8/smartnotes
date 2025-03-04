import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: Date;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  costPrice: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export class StockService {
  private sp500ComponentsPath: string;
  private portfolioPath: string;
  private mockMode: boolean;

  constructor(mockMode = false) {
    this.mockMode = mockMode;
    this.sp500ComponentsPath = path.join(process.cwd(), 'data', 'stock', 'sp500_components.json');
    this.portfolioPath = path.join(process.cwd(), 'data', 'stock', 'portfolio.json');
    
    // 确保数据目录存在
    this.ensureDirectoryExists(path.join(process.cwd(), 'data', 'stock'));
    
    // 初始化投资组合文件
    if (!fs.existsSync(this.portfolioPath)) {
      fs.writeFileSync(this.portfolioPath, JSON.stringify([], null, 2));
    }
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  // 获取实时股票数据
  async getStockQuote(symbol: string): Promise<StockData | null> {
    try {
      if (this.mockMode) {
        return this.getMockStockData(symbol);
      }

      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbol}`);
      
      if (response.status !== 200 || !response.data || !response.data.quoteResponse || !response.data.quoteResponse.result || response.data.quoteResponse.result.length === 0) {
        console.error(`无法获取股票 ${symbol} 的数据`);
        return null;
      }
      
      const stockInfo = response.data.quoteResponse.result[0];
      
      return {
        symbol: stockInfo.symbol,
        name: stockInfo.shortName || stockInfo.longName || symbol,
        price: stockInfo.regularMarketPrice || 0,
        change: stockInfo.regularMarketChange || 0,
        changePercent: stockInfo.regularMarketChangePercent || 0,
        volume: stockInfo.regularMarketVolume || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`获取股票 ${symbol} 数据时出错:`, error);
      return null;
    }
  }

  // 获取历史股票数据
  async getHistoricalData(symbol: string, startDate: string, endDate: string): Promise<HistoricalData[]> {
    try {
      if (this.mockMode) {
        return this.getMockHistoricalData(symbol, startDate, endDate);
      }

      // 将日期转换为Unix时间戳
      const start = Math.floor(new Date(startDate).getTime() / 1000);
      const end = Math.floor(new Date(endDate).getTime() / 1000);
      
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${start}&period2=${end}&interval=1d`
      );
      
      if (response.status !== 200 || !response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
        console.error(`无法获取股票 ${symbol} 的历史数据`);
        return [];
      }
      
      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      
      return timestamps.map((time: number, index: number) => {
        return {
          date: new Date(time * 1000).toISOString().split('T')[0],
          open: quotes.open[index] || 0,
          high: quotes.high[index] || 0,
          low: quotes.low[index] || 0,
          close: quotes.close[index] || 0,
          volume: quotes.volume[index] || 0
        };
      });
    } catch (error) {
      console.error(`获取股票 ${symbol} 历史数据时出错:`, error);
      return [];
    }
  }

  // 搜索S&P 500成分股
  async searchSP500Stocks(keyword: string): Promise<any[]> {
    try {
      // 如果SP500成分股文件不存在，则从GitHub获取
      if (!fs.existsSync(this.sp500ComponentsPath)) {
        await this.fetchSP500Components();
      }
      
      // 读取SP500成分股数据
      const sp500Data = JSON.parse(fs.readFileSync(this.sp500ComponentsPath, 'utf8'));
      
      // 根据关键词搜索
      return sp500Data.filter((stock: any) => {
        const searchStr = `${stock.symbol} ${stock.name} ${stock.sector}`.toLowerCase();
        return searchStr.includes(keyword.toLowerCase());
      });
    } catch (error) {
      console.error('搜索S&P 500成分股时出错:', error);
      return [];
    }
  }

  // 从GitHub获取S&P 500成分股数据
  private async fetchSP500Components(): Promise<void> {
    try {
      const response = await axios.get(
        'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.json'
      );
      
      if (response.status === 200 && response.data) {
        fs.writeFileSync(this.sp500ComponentsPath, JSON.stringify(response.data, null, 2));
      } else {
        throw new Error('无法获取S&P 500成分股数据');
      }
    } catch (error) {
      console.error('获取S&P 500成分股数据时出错:', error);
      // 创建一个基本的模拟数据文件
      const mockData = [
        { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
        { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Discretionary' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
        { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financials' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Health Care' }
      ];
      fs.writeFileSync(this.sp500ComponentsPath, JSON.stringify(mockData, null, 2));
    }
  }

  // 添加股票到投资组合
  async addToPortfolio(symbol: string, shares: number, costPrice: number): Promise<string> {
    try {
      // 获取股票信息
      let stockInfo = await this.getStockQuote(symbol);
      
      // 如果无法获取股票信息，使用基本信息
      if (!stockInfo) {
        stockInfo = {
          symbol,
          name: symbol,
          price: costPrice,
          change: 0,
          changePercent: 0,
          volume: 0,
          lastUpdated: new Date()
        };
      }
      
      // 读取当前投资组合
      const portfolio = JSON.parse(fs.readFileSync(this.portfolioPath, 'utf8'));
      
      // 生成唯一ID
      const id = `${symbol}-${Date.now()}`;
      
      // 计算市场价值和盈亏
      const marketValue = shares * stockInfo.price;
      const profitLoss = marketValue - (shares * costPrice);
      const profitLossPercent = (profitLoss / (shares * costPrice)) * 100;
      
      // 创建新的投资组合项目
      const newItem: PortfolioItem = {
        id,
        symbol,
        name: stockInfo.name,
        shares,
        costPrice,
        currentPrice: stockInfo.price,
        marketValue,
        profitLoss,
        profitLossPercent
      };
      
      // 添加到投资组合
      portfolio.push(newItem);
      
      // 保存投资组合
      fs.writeFileSync(this.portfolioPath, JSON.stringify(portfolio, null, 2));
      
      return id;
    } catch (error) {
      console.error(`添加股票 ${symbol} 到投资组合时出错:`, error);
      throw error;
    }
  }

  // 获取投资组合
  getPortfolio(): PortfolioItem[] {
    try {
      return JSON.parse(fs.readFileSync(this.portfolioPath, 'utf8'));
    } catch (error) {
      console.error('获取投资组合时出错:', error);
      return [];
    }
  }

  // 更新投资组合中的股票价格
  async updatePortfolioPrices(): Promise<void> {
    try {
      const portfolio = this.getPortfolio();
      
      for (let i = 0; i < portfolio.length; i++) {
        const item = portfolio[i];
        const stockInfo = await this.getStockQuote(item.symbol);
        
        if (stockInfo) {
          item.currentPrice = stockInfo.price;
          item.marketValue = item.shares * stockInfo.price;
          item.profitLoss = item.marketValue - (item.shares * item.costPrice);
          item.profitLossPercent = (item.profitLoss / (item.shares * item.costPrice)) * 100;
        }
      }
      
      fs.writeFileSync(this.portfolioPath, JSON.stringify(portfolio, null, 2));
    } catch (error) {
      console.error('更新投资组合价格时出错:', error);
    }
  }

  // 计算投资组合总值
  calculatePortfolioTotal(): { totalCost: number, totalValue: number, totalProfitLoss: number, totalProfitLossPercent: number } {
    try {
      const portfolio = this.getPortfolio();
      
      let totalCost = 0;
      let totalValue = 0;
      
      portfolio.forEach(item => {
        totalCost += item.shares * item.costPrice;
        totalValue += item.marketValue;
      });
      
      const totalProfitLoss = totalValue - totalCost;
      const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
      
      return {
        totalCost,
        totalValue,
        totalProfitLoss,
        totalProfitLossPercent
      };
    } catch (error) {
      console.error('计算投资组合总值时出错:', error);
      return {
        totalCost: 0,
        totalValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0
      };
    }
  }

  // 模拟股票数据（用于测试或API不可用时）
  private getMockStockData(symbol: string): StockData {
    const mockData: Record<string, StockData> = {
      'AAPL': {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        change: 2.75,
        changePercent: 1.86,
        volume: 75000000,
        lastUpdated: new Date()
      },
      'MSFT': {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 290.50,
        change: 1.25,
        changePercent: 0.43,
        volume: 25000000,
        lastUpdated: new Date()
      },
      'BABA': {
        symbol: 'BABA',
        name: 'Alibaba Group Holding Limited',
        price: 85.75,
        change: -1.25,
        changePercent: -1.44,
        volume: 15000000,
        lastUpdated: new Date()
      },
      'BIDU': {
        symbol: 'BIDU',
        name: 'Baidu, Inc.',
        price: 120.30,
        change: 0.80,
        changePercent: 0.67,
        volume: 5000000,
        lastUpdated: new Date()
      },
      '600519.SS': {
        symbol: '600519.SS',
        name: '贵州茅台',
        price: 1800.00,
        change: 15.00,
        changePercent: 0.84,
        volume: 1000000,
        lastUpdated: new Date()
      },
      '000858.SZ': {
        symbol: '000858.SZ',
        name: '五粮液',
        price: 150.00,
        change: -2.00,
        changePercent: -1.32,
        volume: 2000000,
        lastUpdated: new Date()
      },
      '^GSPC': {
        symbol: '^GSPC',
        name: 'S&P 500',
        price: 4500.00,
        change: 25.00,
        changePercent: 0.56,
        volume: 0,
        lastUpdated: new Date()
      },
      '^DJI': {
        symbol: '^DJI',
        name: 'Dow Jones Industrial Average',
        price: 35000.00,
        change: 150.00,
        changePercent: 0.43,
        volume: 0,
        lastUpdated: new Date()
      },
      '^IXIC': {
        symbol: '^IXIC',
        name: 'NASDAQ Composite',
        price: 14000.00,
        change: 100.00,
        changePercent: 0.72,
        volume: 0,
        lastUpdated: new Date()
      }
    };

    return mockData[symbol] || {
      symbol,
      name: symbol,
      price: 100.00,
      change: 0,
      changePercent: 0,
      volume: 0,
      lastUpdated: new Date()
    };
  }

  // 模拟历史数据
  private getMockHistoricalData(symbol: string, startDate: string, endDate: string): HistoricalData[] {
    const result: HistoricalData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 生成基础价格（根据股票符号）
    let basePrice = 100;
    if (symbol === 'AAPL') basePrice = 150;
    else if (symbol === 'MSFT') basePrice = 290;
    else if (symbol === 'BABA') basePrice = 85;
    else if (symbol === 'BIDU') basePrice = 120;
    else if (symbol === '600519.SS') basePrice = 1800;
    else if (symbol === '000858.SZ') basePrice = 150;
    
    // 生成日期范围内的模拟数据
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // 跳过周末
      const day = d.getDay();
      if (day === 0 || day === 6) continue;
      
      // 生成随机波动
      const fluctuation = (Math.random() - 0.5) * 5;
      const dayPrice = basePrice + fluctuation;
      
      result.push({
        date: d.toISOString().split('T')[0],
        open: parseFloat((dayPrice - Math.random() * 2).toFixed(2)),
        high: parseFloat((dayPrice + Math.random() * 2).toFixed(2)),
        low: parseFloat((dayPrice - Math.random() * 2).toFixed(2)),
        close: parseFloat(dayPrice.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000)
      });
      
      // 更新基础价格（模拟趋势）
      basePrice = dayPrice;
    }
    
    return result;
  }
} 