# 智算 (ZhiSuan)

![构建状态](https://github.com/yourusername/zhisuan/workflows/Build%20and%20Test/badge.svg)
![许可证](https://img.shields.io/badge/license-MIT-blue.svg)
![版本](https://img.shields.io/badge/version-1.0.0-green.svg)

一个智能计算器与记事本结合的工具，专为中国用户设计。

## 功能特点

- **智能计算**：支持自然语言输入的计算，如"一千加两千"、"¥100 + $15"等
- **单位转换**：自动识别并转换不同单位，包括货币、长度、重量等
- **变量支持**：可以定义变量并在后续计算中使用
- **记事功能**：将计算过程和结果保存为笔记
- **股票功能**：查询股票信息、获取实时行情、管理投资组合

## 在线演示

访问我们的[在线演示](https://yourusername.github.io/zhisuan)体验智算的基本功能。

## 安装与使用

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/zhisuan.git
cd zhisuan
```

2. 安装依赖

```bash
npm install
```

3. 构建项目

```bash
npm run build
```

4. 运行应用

```bash
npm start
```

### 本地部署与测试

1. **运行主程序**

```bash
npm start
```

这将显示智算的基本功能示例，包括基本算术、货币计算、变量使用、求和功能等。

2. **测试股票功能**

```bash
npm run stock
```

或者使用开源数据版本：

```bash
npm run stock:open
```

这将运行股票功能示例，展示如何使用开源数据和Yahoo Finance API获取股票信息、管理投资组合等。

3. **开发模式**

```bash
npm run dev
```

这将启动开发模式，支持热重载，方便开发和调试。

4. **运行测试**

```bash
npm test
```

5. **代码检查**

```bash
npm run lint
```

### 常见问题

- **API访问错误**：由于使用的是Yahoo Finance非官方API，某些股票数据（特别是中国股票）可能无法获取。程序已添加错误处理机制，确保即使API调用失败也不会导致程序崩溃。
- **数据更新频率**：S&P 500成分股数据来自GitHub开源项目，可能不会实时更新。
- **模拟模式**：如果遇到API限制或网络问题，可以使用模拟模式运行程序，这将使用预设的模拟数据而不是实时数据。

## 项目结构

```
zhisuan/
├── src/                  # 源代码
│   ├── index.ts          # 主程序入口
│   ├── parser/           # 解析器模块
│   ├── calculator/       # 计算引擎
│   └── stock/            # 股票功能模块
├── data/                 # 数据文件
│   ├── currencies.json   # 货币数据
│   ├── crypto.json       # 加密货币数据
│   └── stock/            # 股票相关数据
├── dist/                 # 编译后的代码
└── tests/                # 测试文件
```

## 技术栈

- TypeScript
- Node.js
- Axios (用于API请求)
- Big.js (用于精确计算)
- AVA (用于测试)

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议。请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系我们：

- 提交 [GitHub Issue](https://github.com/yourusername/zhisuan/issues)
- 发送邮件至 [your-email@example.com](mailto:your-email@example.com)

## 致谢

- [Yahoo Finance API](https://finance.yahoo.com/) - 提供股票数据
- [GitHub开源社区](https://github.com/) - 提供S&P 500成分股数据
- 所有贡献者和用户 