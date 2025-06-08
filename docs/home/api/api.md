# API 文档

## 域名信息接口

### 接口地址

```
GET https://ocs.ai4funs.com/pwtk
```

### 请求参数

- `keys`: 指定要获取的域名信息
  - 格式：`wm/domain/{域名}`
  - 示例：`wm/domain/short197.dating141.com`

### 返回格式

返回包含域名信息的 JSON 对象，结构如下：

```json
{
  "wm/domain/{域名}": {
    "taskId": "string",          // 任务ID
    "domain": "string",          // 域名
    "ownerUserId": "string",     // 所有者用户ID
    "websiteRef": "string",      // 网站引用
    "onlineServiceCode": "string", // 在线服务代码
    "keyWords": "string",        // 关键词
    "isSupportSsl": "string",    // 是否支持SSL
    "cdnUrl": "string",          // CDN地址
    "domainStatus": "string",    // 域名状态
    "domainType": "string",      // 域名类型
    "domainFrom": "string",      // 域名来源
    "hasStatsCode": "string",    // 是否有统计代码
    "areaCodes": ["string"],     // 地区代码
    "langCodes": ["string"],     // 语言代码
    "landingPage": "string",     // 落地页
    "isForceHttps": "string",    // 是否强制HTTPS
    "isAppDownloadHint": "string", // 是否显示APP下载提示
    "opsManageCode": "string",   // 运营管理代码
    "memo": "string",            // 备注
    "descriptions": "string",    // 描述
    "promotionCode": "string",   // 推广代码
    "createTime": number,        // 创建时间
    "statsCodeJsUrl": "string",  // 统计代码JS地址
    "statsCodeInit": "string",   // 统计代码初始化
    "websiteTitle": "string",    // 网站标题
    "websiteInnerName": "string", // 网站内部名称
    "icon": "string",            // 图标
    "logo": "string",            // Logo
    "appDownloadUrl": "string"   // APP下载地址
  }
}
```

## 域名列表接口

### 接口地址

```
GET https://ocs.ai4funs.com/pwtk
```

### 请求参数

- `keys`: 指定要获取的网站域名列表
  - 格式：`wm/website/domainList/{网站ID}`
  - 示例：`wm/website/domainList/1298334262587555849`

### 返回格式

返回包含域名列表的 JSON 对象：

```json
{
  "wm/website/domainList/{网站ID}": [
    {
      "type": "string", // 域名类型（如："b", "p", "f"）
      "url": "string" // 域名URL
    }
  ]
}
```

### 域名类型说明

- `b`: 业务域名
- `p`: 主域名
- `f`: 备用域名

## 注意事项

- 两个接口使用相同的基地址，但根据 `keys` 参数返回不同的数据结构
- 响应数据总是以查询键作为属性名进行包装
- 所有时间戳均为自纪元以来的毫秒数
