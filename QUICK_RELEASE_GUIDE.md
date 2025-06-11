# 🚀 快速发布指南

## 📋 发布前准备清单

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- **`NPM_TOKEN`**: npm 发布 token
- **`RELEASE_PLEASE_TOKEN`**: GitHub Personal Access Token

### 2. 本地测试

```bash
# 运行所有检查
pnpm release:check

# 测试构建产物
pnpm test:build

# 模拟发布（不实际发布）
pnpm release:dry
```

## 🎯 发布方式

### 方式一：自动化发布（推荐）

1. **提交代码使用 Conventional Commits 格式**：
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "feat!: breaking change"
   ```

2. **推送到 main 分支**：
   ```bash
   git push origin main
   ```

3. **等待 Release Please 创建 PR**：
   - 自动分析提交历史
   - 生成 CHANGELOG
   - 创建版本更新 PR

4. **合并 Release PR**：
   - 审核变更内容
   - 合并 PR 触发自动发布

### 方式二：手动发布

1. **创建 GitHub Release**：
   - 前往 GitHub → Releases
   - 点击 "Create a new release"
   - 创建新 tag（如 `v1.0.1`）
   - 发布 Release

2. **自动触发发布**：
   - GitHub Actions 自动构建
   - 自动发布到 npm

## 📊 版本号规则

根据 Conventional Commits 自动确定版本号：

- `feat:` → **Minor** 版本更新 (1.0.0 → 1.1.0)
- `fix:` → **Patch** 版本更新 (1.0.0 → 1.0.1)
- `feat!:` 或 `BREAKING CHANGE:` → **Major** 版本更新 (1.0.0 → 2.0.0)

## 🔍 监控发布状态

### GitHub Actions

1. 前往 **Actions** 页面查看工作流状态
2. 检查 **Build** 工作流是否成功
3. 确认 **Publish** 步骤完成

### npm 包验证

```bash
# 检查最新版本
npm view hono-tencent-cloudbase-cloud-function-adapter

# 安装测试
npm install hono-tencent-cloudbase-cloud-function-adapter@latest
```

## ⚡ 快速命令

```bash
# 完整的发布前检查
pnpm release:check

# 测试构建和运行
pnpm test:build

# 查看将要发布的内容
pnpm release:dry

# 手动发布（如果需要）
pnpm publish
```

## 🛠️ 故障排除

### 常见问题

1. **npm 发布失败**：
   - 检查 NPM_TOKEN 是否正确
   - 确认包名没有被占用
   - 检查网络连接

2. **GitHub Actions 失败**：
   - 查看具体错误日志
   - 检查测试是否通过
   - 确认代码格式正确

3. **Release Please 不工作**：
   - 检查提交信息格式
   - 确认 token 权限正确

### 调试命令

```bash
# 本地完整测试流程
pnpm test && pnpm type-check && pnpm build && pnpm test:build

# 检查包内容
npm pack --dry-run

# 查看 git 提交历史
git log --oneline -10
```

## 📝 提交信息示例

```bash
# 新功能
git commit -m "feat: add ES Module support for CloudBase"

# 修复 bug
git commit -m "fix: resolve import path issue in ES modules"

# 文档更新
git commit -m "docs: update README with ES Module examples"

# 破坏性变更
git commit -m "feat!: change handler function signature

BREAKING CHANGE: The handle function now requires different parameters"
```

## 🎉 发布成功后

1. **验证 npm 包**：
   - 检查版本号正确
   - 测试安装和使用

2. **更新文档**：
   - 确认 README 是最新的
   - 检查示例代码

3. **通知用户**：
   - 发布 Release Notes
   - 更新相关文档

通过以上流程，您可以轻松实现自动化发布！🚀
