# 外部邮件访问API文档

## 概述

本文档介绍了Cloud Mail的外部邮件访问API功能，允许管理员通过API密钥获取指定邮箱的邮件。

## 功能特性

1. **API密钥管理**
   - 生成API密钥
   - 查看API密钥列表
   - 删除API密钥

2. **外部邮件查询**
   - 使用API密钥验证身份
   - 获取指定邮箱的邮件
   - 支持限制返回数量
   - 支持时间过滤

## API密钥管理

### 1. 生成API密钥

**接口**: `POST /api/apiKey/generate`

**请求头**:
```
Authorization: Bearer <your-jwt-token>
```

**请求体**:
```json
{
  "keyName": "My API Key",
  "expireDays": 30
}
```

**参数说明**:
- `keyName`: 密钥名称（必填）
- `expireDays`: 有效期天数（可选，不设置则永不过期）

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "apiKey": "api_abc123def456..."
  },
  "message": "success"
}
```

### 2. 查看API密钥列表

**接口**: `GET /api/apiKey/list`

**请求头**:
```
Authorization: Bearer <your-jwt-token>
```

**响应示例**:
```json
{
  "code": 0,
  "data": [
    {
      "keyId": 1,
      "keyName": "My API Key",
      "apiKey": "api_abc123def456...",
      "userId": 1,
      "status": 1,
      "lastUsed": "2026-03-13 10:30:00",
      "createTime": "2026-03-01 10:00:00",
      "expireTime": "2026-03-31 10:00:00"
    }
  ],
  "message": "success"
}
```

### 3. 删除API密钥

**接口**: `DELETE /api/apiKey/delete?keyId=1`

**请求头**:
```
Authorization: Bearer <your-jwt-token>
```

**响应示例**:
```json
{
  "code": 0,
  "data": null,
  "message": "success"
}
```

## 外部邮件查询

### 获取指定邮箱的邮件

**接口**: `GET /api/external/emails`

**请求头**:
```
X-API-Key: <your-api-key>
```

**请求参数**:
- `email`: 目标邮箱地址（必填）
- `limit`: 返回邮件数量限制（可选，默认10，最大50）
- `afterTime`: 时间过滤，获取此时间之后的邮件（可选，格式：YYYY-MM-DD HH:mm:ss）

**请求示例**:
```bash
curl -H "X-API-Key: api_abc123def456..." \
  "http://your-domain.com/api/external/emails?email=user@example.com&limit=20&afterTime=2026-03-01%2000:00:00"
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "emailId": 123,
        "sendEmail": "sender@example.com",
        "name": "Sender Name",
        "accountId": 1,
        "userId": 1,
        "subject": "Email Subject",
        "text": "Plain text content",
        "content": "<html>Email HTML content</html>",
        "toEmail": "user@example.com",
        "toName": "User Name",
        "type": 1,
        "status": 1,
        "unread": 1,
        "createTime": "2026-03-13 10:30:00",
        "attList": []
      }
    ]
  },
  "message": "success"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 401 | API密钥无效、过期或未提供 |
| 403 | 权限不足（非管理员用户） |
| 404 | 邮箱账号不存在 |

## 注意事项

1. **安全性**
   - API密钥仅管理员可以生成和管理
   - 请妥善保管API密钥，不要泄露
   - 建议设置合理的有效期

2. **使用限制**
   - 单次查询最多返回50封邮件
   - 只能查询接收到的邮件，不能查询发送的邮件

3. **权限控制**
   - 只有管理员可以生成和管理API密钥
   - API密钥可以访问系统内任意邮箱的邮件

## 示例代码

### Python示例

```python
import requests

# 配置
API_BASE = "http://your-domain.com/api"
API_KEY = "api_abc123def456..."
TARGET_EMAIL = "user@example.com"

# 获取邮件
headers = {
    "X-API-Key": API_KEY
}

params = {
    "email": TARGET_EMAIL,
    "limit": 20,
    "afterTime": "2026-03-01 00:00:00"
}

response = requests.get(
    f"{API_BASE}/external/emails",
    headers=headers,
    params=params
)

data = response.json()
if data["code"] == 0:
    emails = data["data"]["list"]
    for email in emails:
        print(f"From: {email['sendEmail']}")
        print(f"Subject: {email['subject']}")
        print(f"Time: {email['createTime']}")
        print("-" * 50)
else:
    print(f"Error: {data['message']}")
```

### JavaScript示例

```javascript
const API_BASE = "http://your-domain.com/api";
const API_KEY = "api_abc123def456...";
const TARGET_EMAIL = "user@example.com";

async function getEmails() {
  const headers = {
    "X-API-Key": API_KEY
  };

  const params = new URLSearchParams({
    email: TARGET_EMAIL,
    limit: 20,
    afterTime: "2026-03-01 00:00:00"
  });

  const response = await fetch(`${API_BASE}/external/emails?${params}`, {
    headers: headers
  });

  const data = await response.json();
  
  if (data.code === 0) {
    data.data.list.forEach(email => {
      console.log(`From: ${email.sendEmail}`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Time: ${email.createTime}`);
      console.log("-".repeat(50));
    });
  } else {
    console.error(`Error: ${data.message}`);
  }
}

getEmails();
```

## 更新日志

### v1.0.0 (2026-03-13)
- 初始版本
- 添加API密钥管理功能
- 添加外部邮件查询功能
