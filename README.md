# pwtk-web-template-tk01-t_tk005

# 版本管理

本项目实现了一套完整的PWA版本自动化管理系统，能够在构建过程中自动生成版本信息，并在PWA更新时通知用户。

## 版本号规则

- **基础版本号**: 使用语义化版本 `X.Y.Z` (主版本.次版本.补丁版本)
- **完整版本号**: `X.Y.Z-YYYYMMDD-hash` 格式，包含日期和Git提交哈希

## 版本管理命令

```bash
# 查看当前版本
npm run version:show

# 手动升级版本号
npm run version:patch  # 升级补丁版本 (1.0.0 -> 1.0.1)  
npm run version:minor  # 升级次要版本 (1.0.0 -> 1.1.0)
npm run version:major  # 升级主要版本 (1.0.0 -> 2.0.0)

# 自动确定版本升级类型
npm run version:auto   # 根据提交记录自动决定升级类型

# 简单更新版本并创建版本文件
npm run version:bump   # 升级补丁版本并更新版本文件
```

## 开发与构建

```bash
# 开发环境启动
npm run dev            # 暗色模式
npm run dev:light      # 亮色模式
npm run dev:https      # HTTPS开发模式

# 构建生产环境
npm run build          # 暗色模式构建
npm run build:light    # 亮色模式构建 

# 一键打包发布
npm run deploy         # 构建并显示版本号
```

## 版本文件

在开发和构建过程中会自动生成`version.json`，包含以下信息：

```json
{
  "version": "1.0.1",              // package.json中的版本号
  "fullVersion": "1.0.1-20240710-a1b2c3d", // 完整版本号
  "environment": "production",      // 环境（production/development）
  "buildDate": "2024-07-10T12:34:56.789Z", // 构建时间
  "buildTimestamp": 1689030000000,  // 构建时间戳
  "git": {                          // Git信息
    "hash": "a1b2c3d",              // 提交哈希
    "branch": "main",               // 分支
    "message": "feat: 添加新功能",   // 提交信息
    "date": "2024-07-10T12:00:00Z", // 提交时间
    "isDirty": false                // 是否有未提交的更改
  }
}
```

## PWA更新机制

当Service Worker检测到新版本时，会显示更新提示，用户可以点击"更新"按钮刷新到最新版本。
版本历史会被记录到本地存储中，可在调试模式下查看。
