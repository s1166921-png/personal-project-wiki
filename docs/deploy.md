# 部署与上线

本作品集站是 VitePress 静态站，构建产物在 `site/docs/.vitepress/dist`。下面给出**两条**可落地的上线路径，按你手上的资源选一条即可。

::: tip 先说结论
- 有 GitHub 账号 → 走 **GitHub Pages + 自定义域名**（最省心，CI 自动构建发布）。
- 有自有服务器（Linux + Docker） → 走 **Docker + nginx 自托管**（完全可控）。
- 目标域名：`wiki.meiouyuncang.com`。
:::

## 一、GitHub Pages + 自定义域名（推荐）

仓库已内置 `.github/workflows/deploy-pages.yml`：每次 push 到 `main`/`master` 自动 `npm run docs:build` 并发布。

上线步骤：

1. 把本目录推到 GitHub 仓库（例如 `s1166921-png/meiou-wiki`）。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 `GitHub Actions`。
3. 同一页 **Custom domain** 填 `wiki.meiouyuncang.com`，勾选 `Enforce HTTPS`。
4. 在你的域名 DNS 处加一条 **CNAME** 记录：

   | 主机记录 | 类型 | 值 |
   | --- | --- | --- |
   | `wiki` | `CNAME` | `<你的用户名>.github.io` |

5. 推送一次，Actions 跑完即可访问 `https://wiki.meiouyuncang.com`。

> 注意：VitePress 本项目 `base` 为根路径 `/`，部署到子路径（如 `/wiki/`）时需改 `config.mts` 的 `base`。

## 二、自有服务器 Docker 自托管

仓库已内置 `Dockerfile`（多阶段：Node 构建 → nginx 托管）与 `nginx.conf`。

```bash
# 在服务器上
git clone <你的仓库> && cd <仓库>
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

## 三、本地预览

```bash
npm run docs:dev        # 开发热更新 http://localhost:5173
npm run docs:build      # 生成静态产物
npm run docs:preview    # 本地预览产物 http://localhost:4173
```

## 四、上线前检查清单

- [ ] `npm run docs:build` 在本地 0 错误通过
- [ ] 所有项目页的"真实状态 / 已知边界"与代码一致，未夸大
- [ ] 导航与侧边栏链接无失效（构建日志无 `dead links` 警告）
- [ ] 社交链接、版权信息准确
- [ ] 自定义域名 DNS 已生效、HTTPS 已开启
