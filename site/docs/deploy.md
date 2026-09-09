# 部署与上线

本作品集站是 VitePress 静态站，构建产物在 `site/docs/.vitepress/dist`。已通过 **GitHub Pages（GitHub Actions 自动发布）** 上线，线上地址：

> **https://s1166921-png.github.io/personal-project-wiki/**

下文记录两条可落地的上线路径，以及本地预览方式。

::: tip 先说结论
- 已选路径：**GitHub Pages + GitHub Actions 自动发布**（push 到 `main` 即自动构建并发布，零手动操作）。
- 备选路径：自有服务器 **Docker + nginx 自托管**（完全可控）。
- 目标品牌域名：`wiki.meiouyuncang.com`（见下文「绑定自定义域名」）。
:::

## 一、GitHub Pages（当前已上线，自动化）

仓库已内置 `.github/workflows/deploy-pages.yml`：每次 push 到 `main`/`master` 自动 `npm run docs:build` 并将产物发布到 GitHub Pages。仓库的 Pages 功能已开启，**Source 设为 `GitHub Actions`**。

部署链路（已验证可用）：

1. 本地改完文档 → `git push origin main`
2. GitHub Actions 触发：
   - `build` job：`setup-node@v4`（Node 22）→ `npm install` → `npm run docs:build` → `upload-pages-artifact`（上传 `site/docs/.vitepress/dist`）
   - `deploy` job：`actions/deploy-pages@v4` 把产物发布上线
3. 约 1–3 分钟后即可访问 `https://s1166921-png.github.io/personal-project-wiki/`

> 本项目 `config.mts` 的 `base` 设为 `/personal-project-wiki/`，与 GitHub Pages 项目页子路径一致。若以后改为部署到根路径（见自定义域名），需把 `base` 改回 `/`。

### 绑定自定义域名 `wiki.meiouyuncang.com`（可选）

1. 仓库 **Settings → Pages → Custom domain** 填 `wiki.meiouyuncang.com`，勾选 `Enforce HTTPS`。
2. 域名 DNS 加一条 **CNAME** 记录：`wiki` → `s1166921-png.github.io`。
3. 把 `config.mts` 的 `base` 改回 `/`（根路径），push 触发重新发布。
4. DNS 生效后访问 `https://wiki.meiouyuncang.com`。

## 二、自有服务器 Docker 自托管（备选）

仓库已内置 `Dockerfile`（多阶段：Node 构建 → nginx 托管）与 `nginx.conf`。

```bash
# 在服务器上
git clone https://github.com/s1166921-png/personal-project-wiki.git
cd personal-project-wiki
docker build -t meiou-wiki .
docker run -d --name meiou-wiki -p 8080:80 meiou-wiki
```

再用 nginx / Caddy 反代 `localhost:8080` 到 `wiki.meiouyuncang.com` 并配置 HTTPS：

```nginx
server {
    listen 443 ssl;
    server_name wiki.meiouyuncang.com;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 注意：Docker 容器化需要在装有 Docker 的机器上 `docker build` 验证；本工作沙箱未运行 Docker daemon，配置已就位但未在此实跑镜像。

## 三、本地预览

```bash
npm run docs:dev        # 开发热更新 http://localhost:5173
npm run docs:build      # 生成静态产物
npm run docs:preview    # 本地预览产物 http://localhost:4173
```

## 四、上线前检查清单

- [x] `npm run docs:build` 在本地 0 错误通过
- [x] GitHub Pages 已开启（Source: GitHub Actions），首次部署已成功
- [x] 所有项目页的"真实状态 / 数据来源"与代码一致，未夸大
- [x] 导航与侧边栏链接无失效（构建日志无 `dead links` 警告）
- [x] 社交链接、版权信息准确（署名已统一为「小杨」）
- [ ] 自定义域名 `wiki.meiouyuncang.com` 的 DNS / HTTPS（可选，待绑定）
