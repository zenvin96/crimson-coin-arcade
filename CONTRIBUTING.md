# 赤币街机贡献指南

感谢您考虑为赤币街机项目贡献代码！以下是参与贡献的指南和工作流程。

## 开发环境设置

1. Fork 此仓库
2. Clone 您的 fork 到本地机器
   ```bash
   git clone https://github.com/您的用户名/crimson-coin-arcade.git
   cd crimson-coin-arcade
   ```
3. 安装依赖
   ```bash
   npm install
   # 或
   yarn install
   # 或
   bun install
   ```
4. 创建一个新分支
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. 启动开发服务器
   ```bash
   npm run dev
   ```

## 代码风格与质量

我们使用 ESLint 和 Prettier 来确保代码质量和一致性。请确保您的代码通过以下命令的检查：

```bash
npm run lint
```

在提交代码前，请检查您的更改是否符合我们的代码风格规范。

## 提交规范

我们遵循约定式提交规范（Conventional Commits），这有助于生成清晰的更新日志。

提交信息格式如下：

```
<类型>[可选 作用域]: <描述>

[可选 正文]

[可选 脚注]
```

### 提交类型

- **feat**: 新功能
- **fix**: 修复错误
- **docs**: 仅文档更改
- **style**: 不影响代码含义的更改（如空格、格式化、缺少分号等）
- **refactor**: 既不修复错误也不添加功能的代码更改
- **perf**: 改进性能的代码更改
- **test**: 添加缺失或修正现有测试
- **chore**: 对构建过程或辅助工具和库的更改

### 提交示例

```
feat(auth): 添加用户登录功能

实现了基于JWT的用户身份验证系统，包括登录、注册和密码重置功能。

Resolves: #123
```

## 分支与合并策略

- **main**: 主分支，包含稳定版本
- **develop**: 开发分支，包含最新开发版本
- **feature/\***: 功能分支，从 develop 分支创建
- **bugfix/\***: 修复分支，从 develop 分支创建
- **release/\***: 发布准备分支

### 工作流程

1. 从 develop 分支创建一个新的功能或修复分支
2. 完成开发工作并提交更改
3. 确保所有测试通过
4. 提交 Pull Request 到 develop 分支
5. 代码审查通过后，PR 将被合并

## Pull Request 流程

1. 更新您的分支与最新的 develop 同步
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-feature-branch
   git rebase develop
   ```
2. 推送到您的 fork
   ```bash
   git push origin your-feature-branch
   ```
3. 创建 Pull Request
4. 在 PR 描述中提供：
   - 功能或修复的概述
   - 相关的 issue 编号
   - 任何特殊的注意事项或测试说明

## 代码审查

所有提交都需要通过代码审查。审查者会检查：

- 代码质量和风格
- 测试覆盖率
- 文档完整性
- 功能实现是否符合需求

## 测试要求

- 所有新功能必须包含相应的测试
- 测试覆盖率不应降低
- 测试应该有意义并涵盖关键功能

### 运行测试

```bash
npm test
```

## 文档要求

- 复杂组件应有详细文档
- API 更改需要更新相关文档
- 必要时添加或更新示例

## 项目沟通

- 使用 Issue 进行任务跟踪和讨论
- 对于较大的更改，请先创建一个提案 Issue 进行讨论
- 如有问题，请在相关 Issue 中提问

## 发布流程

项目维护者会负责版本发布。版本号遵循语义化版本规范：

- **主版本号**：不兼容的 API 更改
- **次版本号**：向后兼容的功能性新增
- **修订号**：向后兼容的问题修正

## 行为准则

请参阅我们的 [行为准则](CODE_OF_CONDUCT.md)，我们期望所有贡献者遵守。

---

再次感谢您的贡献！您的参与将帮助赤币街机变得更好。如有任何疑问，请随时联系项目维护者。
