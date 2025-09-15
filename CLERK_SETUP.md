# Clerk 认证设置指南

## 🎯 Clerk 集成完成状态

✅ **已完成的配置**：
- Clerk 依赖包已安装（@clerk/nextjs ^5.7.5）
- ClerkProvider 已集成到 _app.js
- 环境变量配置已预备
- 登录/注册页面已支持 Clerk 组件
- 中文本地化已配置（zhCN）

## 📋 获取 Clerk API 密钥步骤

### 1. 创建 Clerk 账户
1. 访问 [https://dashboard.clerk.dev/](https://dashboard.clerk.dev/)
2. 使用 GitHub 或 Email 注册账户
3. 验证邮箱（如果需要）

### 2. 创建新应用
1. 点击 **"Create Application"**
2. 应用设置：
   - **Name**: `NotionNext`
   - **Sign-in methods**: 选择 `Email` 和 `Password`
   - 其他选项保持默认

### 3. 获取 API 密钥
创建应用后，在 Dashboard 中：
1. 点击左侧菜单的 **"API Keys"**
2. 复制以下密钥：
   - **Publishable key** (以 `pk_test_` 开头)
   - **Secret key** (以 `sk_test_` 开头)

### 4. 配置环境变量
在 `.env.local` 文件中，取消注释并替换为实际密钥：

```bash
# 取消注释并替换为实际密钥
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### 5. 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## ✨ 配置完成后的功能

### 登录页面 (`/sign-in`)
- 完整的 Clerk 登录表单
- 邮箱/密码验证
- 社交登录（如已配置）
- 忘记密码功能

### 注册页面 (`/sign-up`)
- 完整的 Clerk 注册表单
- 邮箱验证流程
- 密码强度验证
- 用户资料收集

### 用户管理
- 用户dashboard和资料编辑
- 会话管理
- 安全设置

## 🔒 Clerk 优势

- **无需后端开发**：完全托管的认证服务
- **企业级安全**：符合 SOC 2、GDPR 等标准
- **丰富功能**：2FA、SSO、组织管理等
- **易于集成**：与 Next.js 完美集成
- **免费额度**：月活跃用户数 10,000 以下免费

## 🚀 下一步

1. 按照上述步骤获取 Clerk API 密钥
2. 配置环境变量
3. 重启服务器
4. 访问 `/sign-in` 测试 Clerk 认证功能
5. 根据需要自定义 Clerk 外观和行为

## 📞 需要帮助？

如果您在设置过程中遇到问题：
1. 检查 [Clerk 官方文档](https://clerk.com/docs)
2. 确认 API 密钥格式正确
3. 验证环境变量名称无误
4. 重启开发服务器