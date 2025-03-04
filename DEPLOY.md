# 智算 (ZhiSuan) 部署指南

本文档提供将智算项目部署到GitHub的详细步骤。

## 部署前检查清单

- [x] 项目结构完整
- [x] 所有依赖已安装
- [x] 代码可以成功构建
- [x] 主程序可以正常运行
- [x] 股票功能可以正常工作
- [x] 已添加.gitignore文件
- [x] 已添加LICENSE文件
- [x] 已添加GitHub Actions工作流
- [x] README.md文件已更新

## 部署步骤

1. **创建GitHub仓库**

   在GitHub上创建一个新的仓库，命名为`zhisuan`。

2. **初始化本地Git仓库**

   ```bash
   git init
   git add .
   git commit -m "初始提交：智算项目"
   ```

3. **连接到GitHub仓库**

   ```bash
   git remote add origin https://github.com/yourusername/zhisuan.git
   git branch -M main
   git push -u origin main
   ```

4. **启用GitHub Pages**

   - 在GitHub仓库页面，点击"Settings"
   - 滚动到"Pages"部分
   - 在"Source"下拉菜单中选择"GitHub Actions"
   - 保存设置

5. **配置仓库设置**

   - 在GitHub仓库页面，点击"Settings"
   - 添加适当的描述和标签
   - 在"Social Preview"部分上传项目预览图片

6. **验证部署**

   - 检查GitHub Actions工作流是否成功运行
   - 访问`https://yourusername.github.io/zhisuan`确认网站已部署
   - 测试演示功能是否正常工作

## 更新项目

每次更新项目后，只需推送到GitHub仓库，GitHub Actions将自动构建和部署：

```bash
git add .
git commit -m "更新：描述更改内容"
git push
```

## 常见问题

1. **GitHub Actions构建失败**

   检查工作流日志，解决构建错误，然后重新提交。

2. **GitHub Pages未更新**

   GitHub Pages可能需要几分钟才能反映最新更改。如果长时间未更新，检查部署工作流是否成功完成。

3. **本地测试与部署版本不一致**

   确保所有更改都已提交并推送到GitHub。检查构建过程是否包含了所有必要的文件。

## 注意事项

- 请确保不要将敏感信息（如API密钥）提交到公共仓库
- 定期更新依赖以修复安全漏洞
- 保持README.md文件的更新，以便用户了解最新功能和使用方法