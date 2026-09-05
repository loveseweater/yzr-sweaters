# yzrsweaters.com — Google 收录（Search Console）操作指南

你的网站已经上线（首页 + 博客，10 篇文章 + sitemap + robots）。**这步是让 Google 收录你的网站**，之后你的网站在 Google 搜索里才能被搜到。

> 前提：你已经准备好一个能登录 Google 的账号（Gmail）。Google 访问需科学上网，建议保持 VPN 开启。

---

## 第一步：在 Google Search Console 添加网站

1. 打开 Google Search Console：https://search.google.com/search-console
2. 用你的 **Gmail 账号登录**（如果 Google 提示，登录即可）
3. 选择「**添加资源 / Add property**」
4. 有两个选项，**选「域名 / Domain」**（最推荐，能把 www、http、所有子域名一起收录）：
   - 在输入框填：`yzrsweaters.com`（只写域名，不要带 `www`、`http://`、`/`）
   - 点「继续」

## 第二步：验证域名所有权（DNS 验证）

选「域名」类型时，Google 会给你一条 **TXT 记录**用来验证域名是你的。你需要在 Cloudflare 里加：

1. 登录 Cloudflare → 点 `yzrsweaters.com` → 左侧「DNS」→「记录」
2. 点「+ 添加记录」：
   - **类型**：`TXT`
   - **名称**：`@`（就是 Google 给的「主机 / 前缀」字段，通常是 `@` 或一串字符）
   - **内容**：Google 给你的一长串 `google-site-verification=xxxxxxxx` 值（**完整复制，别漏字符**）
   - **代理状态**：**仅 DNS（灰云）** ← 重要，验证记录不能开代理
3. 保存
4. 回到 Google Search Console，点「**验证 / Verify**」
5. 几秒到几分钟内验证通过（若提示失败，等 5-10 分钟 DNS 生效再点一次）

> ✅ 提示：因为你用的是「域名」资源方式，Google 会自动把 `https://yzrsweaters.com`、`www`、`blog` 等全部收录，很方便。

---

## 第三步：提交 sitemap（让 Google 快速发现所有页面）

你的 sitemap 已经建好，路径是：
```
https://yzrsweaters.com/sitemap.xml
```

1. 在 Search Console 左侧菜单点「**Sitemaps / 站点地图**」
2. 在「添加新的站点地图」输入框填：`sitemap.xml`
3. 点「**提交 / Submit**」
4. 状态显示「**成功 / Success**」，系统会显示已发现页面数（应该包含首页 + 博客列表 + 10 篇文章 ≈ 12 个 URL）

## 第四步：主动请求收录（加速）

Google 收录是**自动**的，新网站可能要几天到几周。想加速，可在 Search Console 上方搜索框（URL 检查工具）提交几个关键页面：

1. 在顶部输入框粘贴：`https://yzrsweaters.com/`
2. 回车 → 点「**请求索引 / Request Indexing**」
3. 对 `https://yzrsweaters.com/blog` 和每篇博客文章也重复这个操作（一次一个 URL）

> 用 URL 检查工具加上「请求索引」，会让 Google 优先抓取这些页面，通常 1-3 天内开始收录。

---

## 验证收录效果

- 提交后，等 **1-7 天**，在 Google 搜索：
  ```
  site:yzrsweaters.com
  ```
  能看到你的页面就是收录成功了。
- 也可以搜关键词试试，比如 `knitwear manufacturer`、`wool sweater supplier`、`sweater wholesale from china` 等，看你的博客/首页是否出现。

---

## 常见问题

**Q：为什么搜不到？**
A：Google 收录需要时间。新域名 + 新页面，正常要 **几天到几周**。只要 sitemap 提交成功、robots 允许抓取，就会慢慢收录。保持 VPN 开启、别急着删。

**Q：验证时提示失败？**
A：最常见是**DNS 还在传播**。Cloudflare 加了 TXT 记录后，等 **5-10 分钟**再点「验证」。若还失败，检查 TXT 内容是否复制完整（Google 给的那串很长，别漏）。

**Q：要不要等收录后再做别的？**
A：不用。你现在可以**继续写更多博客文章、完善内容**，Google 会边收录边更新。**内容越专业、越原创，排名越容易靠前。**

---

## 总结流程

```
Google Search Console 登录
  → 添加资源（选"域名"）填 yzrsweaters.com
  → 去 Cloudflare 加 TXT 验证记录（仅DNS/灰云）
  → 回 Console 点"验证"
  → 提交 sitemap.xml
  → URL 检查工具逐个"请求索引"
  → 等 1-7 天，用 site:yzrsweaters.com 查收录
```
