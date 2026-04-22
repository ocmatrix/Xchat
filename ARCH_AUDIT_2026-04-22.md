# Xchat 深度架构审计报告（2026-04-22）

## 执行摘要

本轮审计聚焦你反馈的“实测卡点”，优先从**真实性能瓶颈**和**高概率功能阻塞点**切入。代码整体具备不错的模块化雏形（服务层、组件层分离），但当前存在“**数据模型一致性** + **前端体量过大** + **实时订阅策略偏粗粒度**”三类系统性问题。

我已先落地两处能直接缓解线上卡点的修复：

1. 修复一对一会话 participant 标识混用（UID/DID）导致会话权限与消息链路异常的问题。
2. 修复 CSS `@import` 顺序，消除构建期样式优化 warning，降低后续样式不可预期风险。

---

## 本次已落地修复

### 1) 一对一会话 participant 标识统一为用户 UID

- 问题：直接会话创建逻辑此前使用 `targetDid` 参与会话 participants，而规则和消息读取链路是按 `request.auth.uid in participants` 判断权限，容易造成“会话可见但消息不可读/不可写”或对端无法加入的问题。
- 修复：`getOrCreateDirectConversation` 参数统一改为 `targetUserId`，会话 participants 统一写入 UID。
- 影响：减少实测中的“点开会话后卡住、消息发不出、权限拒绝”类卡点。

### 2) 选择联系人时优先使用 UID，兼容旧数据

- 问题：`App.tsx` 内选择联系人时调用会话创建函数传递的是 `contact.did`。
- 修复：优先使用 `contact.id`（以及 `contact.uid` 兼容），仅在缺失时回退；并为无标识场景增加显式错误。
- 影响：提升会话建立成功率，避免 silent failure。

### 3) 修复全局样式导入顺序

- 问题：`tailwindcss` 的 `@import` 在字体导入之前，构建器会报 `@import rules must precede all rules` 警告。
- 修复：将 Google Fonts 导入移动到最前。
- 影响：消除 warning，避免后续样式处理链条在不同构建器版本下出现不一致。

---

## 审计发现（高优先级）

## P0：身份标识模型不统一（UID vs DID）

### 现象

- 用户 profile 同时持有 DID 与 UID（文档 ID）。
- 会话规则使用 UID 做权限控制。
- 业务层此前在部分路径把 DID 写入 participants。

### 风险

- 对端权限校验失败。
- 消息列表订阅返回空或 permission-denied。
- 间歇性复现，导致“看似随机卡点”。

### 建议

- 建立硬性约束：**所有 Firestore 关系字段统一使用 UID**；DID 只作展示和外部身份映射。
- 新增数据迁移脚本：清洗历史 conversations 中 DID participant。

---

## P1：前端主包过大，首屏/弱网卡顿明显

### 现象

- 生产构建输出主 JS chunk 约 `1.86 MB`（gzip 后约 `520 KB`）。
- 当前 `App.tsx` 顶层静态引入多个重量组件（会话、音视频、会议、发现节点等），导致初始加载成本过高。

### 风险

- 首屏白屏/长时间不可交互。
- 中低端机切页掉帧、动画卡顿。
- 实测中易被感知为“操作有延迟”。

### 建议

- 对 `MediaCall / AuditoriumMeeting / PeerDiscovery / InitiateGroup / Conversation` 改为 `React.lazy + Suspense` 按需加载。
- 对图标集做按需导入核查，清理未使用 icon。

---

## P1：实时订阅策略过粗，扩展后会成为性能拐点

### 现象

- 用户列表直接订阅 `users` 并 `limit(50)`；会话消息每个会话 `limit(100)` 全量映射。
- 缺少按业务状态/分页策略，且本地过滤排序在 UI 层完成。

### 风险

- 在线用户增长后前端 diff & render 成本上升。
- Firestore 读取成本和冷启动耗时上升。

### 建议

- 用户列表改为“状态索引 + 分页游标”。
- 消息列表引入窗口化（结合现有虚拟列表库）和增量加载。

---

## P2：类型约束偏弱，错误兜底依赖 any

### 现象

- `App.tsx` 与服务层存在多个 `any`。

### 风险

- 回归时隐藏类型问题，线上才暴露。

### 建议

- 先从 `Contact`, `Conversation`, `MessagePayload` 三个核心模型建立严格类型。
- 在服务层出口做 schema guard（如 zod 或自定义 assert）。

---

## 下一步建议（按投入产出排序）

1. **本周必须**：历史数据修复脚本（participants DID->UID）+ 增加会话创建单测。
2. **本周建议**：关键页面 lazy load，目标首包至少下降 30%。
3. **两周内**：订阅分页化 + 消息窗口化，压低交互抖动。
4. **持续**：补齐类型系统，减少 any 漏洞。

