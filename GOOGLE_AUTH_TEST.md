# Google OAuth 测试指南

## 回调 URL 使用方式

当后端 Google OAuth 认证成功后，会重定向到：
```
http://localhost:8080/auth/callback?token=YOUR_JWT_TOKEN
```

## 测试流程

### 1. 正常流程测试
1. 点击 "Sign in with Google" 按钮
2. 在弹出窗口中完成 Google 认证
3. 后端会重定向到 `/auth/callback?token=xxx`
4. 回调页面会：
   - 提取 URL 中的 token
   - 保存到 localStorage
   - 更新用户认证状态
   - 关闭弹窗（如果是弹窗模式）

### 2. 手动测试（模拟后端响应）

如果你想手动测试回调页面，可以：

```bash
# 成功场景 - 使用真实的 JWT token
http://localhost:8080/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

# 错误场景
http://localhost:8080/auth/callback?error=access_denied
```

### 3. 直接窗口模式 vs 弹窗模式

**弹窗模式**（当前实现）：
- 点击登录按钮 → 打开新窗口
- 认证完成后 → 弹窗自动关闭
- 主窗口通过 postMessage 接收认证结果

**直接跳转模式**：
- 如果直接在浏览器访问回调 URL
- 页面会处理 token 并跳转到首页

## 后端配置要求

确保后端的 `FRONTEND_URL` 环境变量设置正确：
```env
FRONTEND_URL=http://localhost:8080
```

## 调试技巧

1. **查看 localStorage**：
   - 打开浏览器开发者工具
   - Application → Local Storage
   - 查看 `auth_token` 是否正确保存

2. **查看网络请求**：
   - Network 标签页
   - 查看 `/api/v1/auth/me` 请求是否带有正确的 Authorization header

3. **查看控制台消息**：
   - 如果是弹窗模式，主窗口会收到 postMessage
   - 查看是否有错误信息

## 常见问题

1. **弹窗被拦截**：
   - 确保是通过用户点击触发
   - 检查浏览器弹窗拦截设置

2. **Token 无效**：
   - 确保后端返回的是有效的 JWT
   - 检查 token 是否过期

3. **跨域问题**：
   - 确保前后端域名一致
   - 或配置正确的 CORS 设置