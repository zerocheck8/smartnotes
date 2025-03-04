import { stockManager } from './manager';

/**
 * 股票功能示例
 */
async function stockExample() {
  console.log('智算 - 股票功能示例');
  console.log('===================');
  console.log();

  // 示例1：搜索股票
  console.log('示例1：搜索股票');
  console.log('搜索关键词: Apple');
  const searchResults = await stockManager.searchStocks('Apple');
  console.log('搜索结果:');
  searchResults.slice(0, 3).forEach(stock => {
    console.log(`- ${stock.symbol}: ${stock.name} (${stock.exchange})`);
  });
  console.log();

  // 示例2：获取股票信息
  console.log('示例2：获取股票信息');
  const symbol = 'AAPL';
  console.log(`获取股票信息: ${symbol}`);
  const stockInfo = await stockManager.getStockInfo(symbol, true);
  if (stockInfo) {
    console.log(`- 代码: ${stockInfo.symbol}`);
    console.log(`- 名称: ${stockInfo.name}`);
    console.log(`- 交易所: ${stockInfo.exchange}`);
    console.log(`- 行业: ${stockInfo.industry}`);
  }
  console.log();

  // 示例3：获取股票实时行情
  console.log('示例3：获取股票实时行情');
  console.log(`获取实时行情: ${symbol}`);
  const quote = await stockManager.getStockQuote(symbol);
  if (quote) {
    console.log(`- 当前价格: $${quote.price.toFixed(2)}`);
    console.log(`- 涨跌额: ${quote.change >= 0 ? '+' : ''}$${quote.change.toFixed(2)}`);
    console.log(`- 涨跌幅: ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`);
    console.log(`- 开盘价: $${quote.open.toFixed(2)}`);
    console.log(`- 最高价: $${quote.high.toFixed(2)}`);
    console.log(`- 最低价: $${quote.low.toFixed(2)}`);
    console.log(`- 成交量: ${quote.volume.toLocaleString()}`);
  }
  console.log();

  // 示例4：获取历史价格
  console.log('示例4：获取历史价格');
  const startDate = '2023-01-01';
  const endDate = '2023-01-10';
  console.log(`获取历史价格: ${symbol} (${startDate} 至 ${endDate})`);
  const prices = await stockManager.getStockPrices(symbol, startDate, endDate);
  console.log(`获取到 ${prices.length} 条价格记录`);
  if (prices.length > 0) {
    console.log('最近5条记录:');
    prices.slice(0, 5).forEach(price => {
      console.log(`- ${price.date}: 开盘 $${price.open.toFixed(2)}, 收盘 $${price.close.toFixed(2)}, 最高 $${price.high.toFixed(2)}, 最低 $${price.low.toFixed(2)}, 成交量 ${price.volume.toLocaleString()}`);
    });
  }
  console.log();

  // 示例5：添加交易记录
  console.log('示例5：添加交易记录');
  console.log(`添加买入交易: ${symbol}`);
  const transaction = stockManager.addTransaction({
    date: new Date().toISOString().split('T')[0],
    symbol,
    name: stockInfo?.name || symbol,
    type: 'buy',
    shares: 10,
    price: quote?.price || 150,
    fee: 5,
    total: (quote?.price || 150) * 10 + 5,
    notes: '示例交易'
  });
  console.log(`交易已添加: ID ${transaction.id}`);
  console.log();

  // 示例6：获取持仓信息
  console.log('示例6：获取持仓信息');
  const holdings = stockManager.getHoldings();
  console.log(`当前持有 ${holdings.length} 支股票:`);
  holdings.forEach(holding => {
    console.log(`- ${holding.symbol} (${holding.name}):`);
    console.log(`  持有数量: ${holding.shares} 股`);
    console.log(`  成本价: $${holding.costPrice.toFixed(2)}`);
    console.log(`  当前价: $${holding.currentPrice.toFixed(2)}`);
    console.log(`  市值: $${holding.value.toFixed(2)}`);
    console.log(`  盈亏: ${holding.profit >= 0 ? '+' : ''}$${holding.profit.toFixed(2)} (${holding.profitPercent >= 0 ? '+' : ''}${holding.profitPercent.toFixed(2)}%)`);
  });
  console.log();

  // 示例7：获取投资组合总价值
  console.log('示例7：获取投资组合总价值');
  const portfolio = stockManager.getPortfolioValue();
  console.log(`总成本: $${portfolio.totalCost.toFixed(2)}`);
  console.log(`总市值: $${portfolio.totalValue.toFixed(2)}`);
  console.log(`总盈亏: ${portfolio.totalProfit >= 0 ? '+' : ''}$${portfolio.totalProfit.toFixed(2)} (${portfolio.totalProfitPercent >= 0 ? '+' : ''}${portfolio.totalProfitPercent.toFixed(2)}%)`);
  console.log();

  console.log('注意：这只是一个简单的演示。实际应用中，您可以：');
  console.log('1. 使用更完整的股票数据源');
  console.log('2. 实现更复杂的投资组合分析');
  console.log('3. 添加图表和可视化功能');
  console.log('4. 集成到智算的计算和记事本功能中');
}

// 运行示例
stockExample().catch(error => {
  console.error('示例运行失败:', error);
}); 