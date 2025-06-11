# GitHub Actions CI/CD 发布指南

本指南详细说明如何设置和使用 GitHub Actions 进行自动化构建、测试和发布。

## 🔧 第一步：配置 GitHub Secrets

### 1. NPM Token 设置

1. **登录 npm**：
   - 前往 [npmjs.com](https://www.npmjs.com)
   - 登录您的账户（如果没有账户请先注册）

2. **创建 Access Token**：
   - 点击右上角头像 → "Access Tokens"
   - 点击 "Generate New Token" → "Classic Token"
   - 选择 "Automation" 类型
   - 复制生成的 token

3. **添加到 GitHub Secrets**：
   - 前往 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴您的 npm token

### 2. Release Please Token 设置

1. **创建 GitHub Personal Access Token**：
   - 前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token (classic)"
   - 选择权限：
     - `repo` (Full control of private repositories)
     - `write:packages` (Upload packages to GitHub Package Registry)

2. **添加到 GitHub Secrets**：
   - Name: `RELEASE_PLEASE_TOKEN`
   - Value: 粘贴您的 GitHub token

## 🚀 第二步：发布流程

### 自动化发布流程（推荐）

1. **合并 PR 到 main 分支**：
   ```bash
   # 当您的 feature 分支准备好后
   git checkout main
   git pull origin main
   git merge feature/your-feature
   git push origin main
   ```

2. **Release Please 自动创建 Release PR**：
   - release-please 会自动分析提交信息
   - 根据 Conventional Commits 格式确定版本号
   - 创建一个 Release PR

3. **审核并合并 Release PR**：
   - 检查生成的 CHANGELOG.md
   - 确认版本号正确
   - 合并 Release PR

4. **自动发布**：
   - 合并后自动创建 GitHub Release
   - 自动发布到 npm

### 手动发布流程

如果需要手动发布：

1. **创建 GitHub Release**：
   - 前往 GitHub 仓库 → Releases
   - 点击 "Create a new release"
   - 创建新的 tag（如 `v1.0.0`）
   - 填写 Release notes
   - 点击 "Publish release"

2. **自动触发发布**：
   - 创建 Release 后会自动触发 build.yml 中的 publish job
   - 自动发布到 npm

## 📝 第三步：Conventional Commits

为了让 release-please 正确工作，请使用 Conventional Commits 格式：

### 提交信息格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 常用类型

- `feat:` - 新功能（触发 minor 版本更新）
- `fix:` - 修复 bug（触发 patch 版本更新）
- `docs:` - 文档更新
- `style:` - 代码格式化
- `refactor:` - 重构代码
- `test:` - 添加测试
- `chore:` - 构建过程或辅助工具的变动

### 示例

```bash
# 新功能
git commit -m "feat: add ES Module support"

# 修复 bug
git commit -m "fix: resolve import path issue in ES modules"

# 破坏性变更（触发 major 版本更新）
git commit -m "feat!: change API interface

BREAKING CHANGE: The handle function now requires different parameters"
```

## 🔍 第四步：监控发布状态

### 查看 GitHub Actions

1. **前往 Actions 页面**：
   - GitHub 仓库 → Actions
   - 查看工作流运行状态

2. **检查构建日志**：
   - 点击具体的工作流运行
   - 查看每个步骤的详细日志

### 验证发布

1. **检查 npm 包**：
   ```bash
   npm view hono-tencent-cloudbase-cloud-function-adapter
   ```

2. **检查 GitHub Release**：
   - 前往 Releases 页面
   - 确认新版本已创建

## ⚠️ 故障排除

### 常见问题

1. **npm 发布失败**：
   - 检查 NPM_TOKEN 是否正确
   - 确认包名没有冲突
   - 检查 package.json 中的版本号

2. **Release Please 不工作**：
   - 检查 RELEASE_PLEASE_TOKEN 权限
   - 确认提交信息符合 Conventional Commits 格式

3. **构建失败**：
   - 检查测试是否通过
   - 确认代码格式化正确
   - 查看具体的错误日志

### 调试命令

```bash
# 本地测试构建
pnpm build

# 本地运行测试
pnpm test

# 检查代码格式
pnpm lint-check
pnpm format-check

# 模拟发布（不实际发布）
pnpm publish --dry-run
```

## 🎯 最佳实践

1. **定期更新依赖**：
   - Dependabot 会自动创建 PR
   - 及时审核和合并依赖更新

2. **保持提交信息规范**：
   - 使用 Conventional Commits 格式
   - 写清楚的提交描述

3. **测试覆盖**：
   - 确保新功能有对应测试
   - 保持高测试覆盖率

4. **文档更新**：
   - 及时更新 README.md
   - 维护 CHANGELOG.md

通过以上流程，您可以实现完全自动化的 CI/CD 发布！
