# 赤币街机 (Crimson Coin Arcade)

一个现代化的加密货币游戏平台，使用 React、TypeScript、Vite 和 Shadcn UI 构建。

![赤币街机](https://picsum.photos/seed/crimson/800/400)

## 项目规则和开发标准

### 1. 代码风格和格式

- **TypeScript**: 所有文件必须使用 TypeScript (.tsx/.ts)，避免使用 any 类型
- **ESLint**: 遵循项目的 ESLint 配置规则
- **命名约定**:
  - 组件: PascalCase (例如: GameCard, HeroSection)
  - 函数/变量: camelCase (例如: toggleTheme, setIsLoading)
  - 常量: UPPER_SNAKE_CASE (例如: API_URL, MAX_ATTEMPTS)
  - 文件名: 与导出的主要组件名称一致，使用 PascalCase
- **导入顺序**:
  1. React 和 React 相关库
  2. 第三方库
  3. 项目内上下文和钩子
  4. 工具函数和常量
  5. 组件
  6. 类型
  7. 样式

### 2. 项目架构

- **文件夹结构**:

  - `src/components/`: UI 组件
    - `ui/`: 通用/基础 UI 组件
    - `sections/`: 页面特定部分组件
    - `layout/`: 布局相关组件
  - `src/contexts/`: React 上下文提供者
  - `src/hooks/`: 自定义 React 钩子
  - `src/pages/`: 路由页面组件
  - `src/services/`: API 调用和服务
  - `src/types/`: TypeScript 类型定义
  - `src/lib/`: 工具函数和常量

- **组件模式**:
  - 使用函数组件和钩子，避免类组件
  - 小型、单一职责组件
  - 使用组合而非继承

### 3. 状态管理

- 使用 React Context API 进行全局状态管理
- 将相关状态组合在同一上下文中 (如 AppContext)
- 使用 useState 和 useReducer 进行组件级状态管理
- 复杂表单使用 react-hook-form

### 4. API 和数据获取

- 使用 TanStack Query (@tanstack/react-query) 进行数据获取
- API 调用集中在 services 文件夹
- 使用 TypeScript 类型保证 API 响应的类型安全

### 5. 样式和设计

- 使用 Tailwind CSS 进行样式设计
- 遵循 Shadcn UI 的设计系统和组件
- 确保响应式设计和移动优先开发
- 支持亮色/暗色主题
- 使用 CSS 变量实现不同主题的颜色方案

### 6. 性能优化

- 组件合理拆分，避免过度渲染
- 使用 React.memo, useMemo 和 useCallback 优化性能
- 图片使用 lazy loading 和优化尺寸
- 加载状态和骨架屏处理用户体验

### 7. 测试标准

- 组件单元测试使用 Vitest
- 遵循测试三部曲: Arrange, Act, Assert
- 测试覆盖率目标: 至少 80%
- 关键用户流程需有端到端测试

### 8. 版本控制和提交

- 使用 Git Flow 工作流
- 提交信息使用约定式提交规范:
  - feat: 新特性
  - fix: 修复
  - docs: 文档更新
  - style: 样式更新
  - refactor: 代码重构
  - test: 测试相关
  - chore: 构建过程或辅助工具变动

### 9. 文档

- 复杂组件和功能需要添加注释
- 关键函数需添加 JSDoc 注释
- 项目关键配置和设计决策需在文档中说明

### 10. AI 辅助开发

- 使用 Cursor IDE 进行 AI 辅助开发
- 遵循 [Cursor AI 协作指南](./CURSOR_GUIDE.md) 中的最佳实践
- AI 生成的代码必须经过人工审查
- 在提交中标记 AI 辅助生成的内容

## 开始使用

### 安装

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 bun
bun install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 目录结构

```
crimson-coin-arcade/
├── public/             # 静态资源
├── src/
│   ├── components/     # 组件
│   │   ├── ui/         # 基础UI组件
│   │   ├── sections/   # 页面部分组件
│   │   └── layout/     # 布局组件
│   ├── contexts/       # 上下文提供者
│   ├── hooks/          # 自定义钩子
│   ├── pages/          # 页面组件
│   ├── services/       # API服务
│   ├── types/          # 类型定义
│   ├── lib/            # 工具函数
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # 渲染入口
├── tailwind.config.ts  # Tailwind配置
├── tsconfig.json       # TypeScript配置
└── vite.config.ts      # Vite配置
```

## 相关文档

- [样式指南](./STYLE_GUIDE.md) - 设计系统和视觉规范
- [贡献指南](./CONTRIBUTING.md) - 如何参与项目贡献
- [行为准则](./CODE_OF_CONDUCT.md) - 社区行为规范
- [Cursor 协作指南](./CURSOR_GUIDE.md) - AI 辅助开发最佳实践

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

MIT
