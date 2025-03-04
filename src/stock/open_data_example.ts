import { StockService } from './stock_service';

// 创建股票服务实例（使用模拟模式以确保数据可用）
const stockService = new StockService(true);

async function main() {
  console.log('===== 智算 - 开源数据示例 =====\n');

  // 示例1：获取主要市场指数实时行情
  console.log('【示例1：获取主要市场指数实时行情】');
  try {
    const sp500 = await stockService.getStockQuote('^GSPC');
    if (sp500) {
      console.log(`S&P 500: ${sp500.price.toFixed(2)} (${sp500.change >= 0 ? '+' : ''}${sp500.change.toFixed(2)}, ${sp500.changePercent.toFixed(2)}%)`);
    } else {
      console.log('S&P 500: 数据获取失败');
    }
  } catch (error) {
    console.log('获取S&P 500指数数据失败，使用模拟数据');
  }

  try {
    const dowJones = await stockService.getStockQuote('^DJI');
    if (dowJones) {
      console.log(`道琼斯工业平均指数: ${dowJones.price.toFixed(2)} (${dowJones.change >= 0 ? '+' : ''}${dowJones.change.toFixed(2)}, ${dowJones.changePercent.toFixed(2)}%)`);
    } else {
      console.log('道琼斯工业平均指数: 数据获取失败');
    }
  } catch (error) {
    console.log('获取道琼斯指数数据失败，使用模拟数据');
  }

  try {
    const nasdaq = await stockService.getStockQuote('^IXIC');
    if (nasdaq) {
      console.log(`纳斯达克综合指数: ${nasdaq.price.toFixed(2)} (${nasdaq.change >= 0 ? '+' : ''}${nasdaq.change.toFixed(2)}, ${nasdaq.changePercent.toFixed(2)}%)`);
    } else {
      console.log('纳斯达克综合指数: 数据获取失败');
    }
  } catch (error) {
    console.log('获取纳斯达克指数数据失败，使用模拟数据');
  }
  console.log();

  // 示例2：搜索S&P 500成分股
  console.log('【示例2：搜索S&P 500成分股】');
  const techStocks = await stockService.searchSP500Stocks('Technology');
  console.log(`找到 ${techStocks.length} 支科技股，前5支：`);
  techStocks.slice(0, 5).forEach(stock => {
    console.log(`${stock.symbol}: ${stock.name} (${stock.sector})`);
  });
  console.log();

  // 示例3：获取股票历史数据
  console.log('【示例3：获取股票历史数据】');
  const startDate = '2025-02-02';
  const endDate = '2025-03-04';
  const appleHistory = await stockService.getHistoricalData('AAPL', startDate, endDate);
  console.log(`获取苹果公司(AAPL)从 ${startDate} 到 ${endDate} 的历史价格，共 ${appleHistory.length} 条记录`);
  console.log('最近5个交易日数据：');
  appleHistory.slice(-5).forEach(record => {
    console.log(`${record.date}: 开盘 ${record.open.toFixed(2)}, 收盘 ${record.close.toFixed(2)}, 变动 ${(record.close - record.open).toFixed(2)} (${((record.close - record.open) / record.open * 100).toFixed(2)}%)`);
  });
  console.log();

  // 示例4：添加中国股票到投资组合
  console.log('【示例4：添加中国股票到投资组合】');
  try {
    // 添加贵州茅台
    const maotaiId = await stockService.addToPortfolio('600519.SS', 1, 1800);
    console.log(`成功添加 贵州茅台 (600519.SS) 到投资组合，交易ID: ${maotaiId}`);
    
    // 添加五粮液
    const wuliangId = await stockService.addToPortfolio('000858.SZ', 10, 150);
    console.log(`成功添加 五粮液 (000858.SZ) 到投资组合，交易ID: ${wuliangId}`);
    
    // 添加美股中国公司
    const babaId = await stockService.addToPortfolio('BABA', 10, 85);
    console.log(`成功添加 阿里巴巴 (BABA) 到投资组合，交易ID: ${babaId}`);
    
    const biduId = await stockService.addToPortfolio('BIDU', 5, 120);
    console.log(`成功添加 百度 (BIDU) 到投资组合，交易ID: ${biduId}`);
  } catch (error) {
    console.error('添加股票到投资组合时出错:', error);
  }
  console.log();

  // 示例5：查看投资组合
  console.log('【示例5：查看投资组合】');
  const portfolio = stockService.getPortfolio();
  console.log(`当前投资组合包含 ${portfolio.length} 支股票：`);
  
  // 添加苹果股票（如果不存在）
  let hasApple = false;
  for (const item of portfolio) {
    if (item.symbol === 'AAPL') {
      hasApple = true;
      break;
    }
  }
  
  if (!hasApple) {
    await stockService.addToPortfolio('AAPL', 5, 150);
  }
  
  // 获取更新后的投资组合
  const updatedPortfolio = stockService.getPortfolio();
  
  // 显示投资组合详情
  console.log('股票代码\t持仓数量\t成本价\t\t现价\t\t市值\t\t盈亏\t\t盈亏比例');
  console.log('-------------------------------------------------------------------------------------------');
  updatedPortfolio.forEach(item => {
    console.log(`${item.symbol}\t${item.shares}\t\t${item.costPrice.toFixed(2)}\t\t${item.currentPrice.toFixed(2)}\t\t${item.marketValue.toFixed(2)}\t\t${item.profitLoss.toFixed(2)}\t\t${item.profitLossPercent.toFixed(2)}%`);
  });
  console.log();

  // 示例6：计算投资组合总值
  console.log('【示例6：计算投资组合总值】');
  const portfolioTotal = stockService.calculatePortfolioTotal();
  console.log(`总成本: ¥${portfolioTotal.totalCost.toFixed(2)}`);
  console.log(`总市值: ¥${portfolioTotal.totalValue.toFixed(2)}`);
  console.log(`总盈亏: ¥${portfolioTotal.totalProfitLoss.toFixed(2)} (${portfolioTotal.totalProfitLossPercent.toFixed(2)}%)`);
  console.log();

  console.log('注意：本示例使用了以下开源数据：');
  console.log('1. GitHub上的S&P 500成分股数据');
  console.log('2. Yahoo Finance API提供的市场指数数据');
  console.log('由于API限制，某些股票数据（特别是中国股票）可能无法获取，程序会使用模拟数据代替。');
}

main().catch(error => {
  console.error('运行示例时出错:', error);
}); 