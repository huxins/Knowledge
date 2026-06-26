---
title: Gitea
---

- [Gitea](https://docs.gitea.com/)

## 安装

### 二进制

使用[二进制文件](https://docs.gitea.com/zh-cn/installation/install-from-binary)安装，从[下载页面](https://dl.gitea.io/gitea/)中选择与目标平台匹配的文件，复制 URL 并在以下命令中替换 URL。

```sh
wget -O gitea https://dl.gitea.com/gitea/1.22.0/gitea-1.22.0-linux-amd64
chmod +x gitea
cp gitea /usr/local/bin/gitea
```

检查服务器上是否安装了 Git。Gitea 需要 Git 版本 >= 2.0。

```sh
git --version
```

创建用户以运行 Gitea。

```sh
adduser \
  --system \
  --shell /bin/bash \
  --gecos 'Git Version Control' \
  --group \
  --disabled-password \
  --home /home/gitea \
  gitea
```

创建所需的目录结构。

```sh
mkdir -p /var/lib/gitea/{custom,data,log}
chown -R gitea:gitea /var/lib/gitea/
chmod -R 750 /var/lib/gitea/
mkdir /etc/gitea
chown root:gitea /etc/gitea
chmod 770 /etc/gitea
```

### Systemd

在 Debian 中以 [service](https://docs.gitea.com/zh-cn/installation/linux-service) 方式运行。

创建 `/etc/systemd/system/gitea.service` 文件。

```ini
[Unit]
Description=Gitea
After=network.target postgresql.service
Wants=postgresql.service

[Service]
RestartSec=2s
Type=simple
User=gitea
Group=gitea
WorkingDirectory=/var/lib/gitea/
ExecStart=/usr/local/bin/gitea web --config /etc/gitea/app.ini
Restart=always
Environment=USER=gitea HOME=/home/gitea GITEA_WORK_DIR=/var/lib/gitea

[Install]
WantedBy=multi-user.target
```

设置自启并启动 Gitea。

```sh
systemctl enable gitea
systemctl start gitea
```

### 数据库

#### PostgreSQL

在数据库服务器上，以超级用户身份登录到数据库控制台。

```sh
su -c "psql" - postgres
```

创建具有登录权限和密码的数据库用户。

```sql
CREATE ROLE gitea WITH LOGIN PASSWORD 'new_password';
```

使用 UTF-8 字符集创建数据库，并由之前创建的数据库用户拥有。

```sql
CREATE DATABASE giteadb WITH OWNER gitea TEMPLATE template0 ENCODING UTF8 LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';
```

测试与数据库的连接。

```sh
psql -U gitea -d giteadb                    # 本地数据库
psql "postgres://gitea@127.0.0.1/giteadb"   # 远程数据库
```

### 反向代理

#### Nginx

创建 `/etc/nginx/conf.d/gitea`，配置如下 *server*。

```nginx
server {
    listen 443 ssl;
    server_name git.example.com;
    
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_certificate     www.example.com.crt;
    ssl_certificate_key www.example.com.key;

    location / {
        proxy_pass http://localhost:3000;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 管理

### 备份

为了确保 Gitea 实例的一致性，在[备份](https://docs.gitea.com/zh-cn/administration/backup-and-restore)期间必须关闭它。

```sh
systemctl stop gitea
```

使用 [`dump`](https://docs.gitea.com/zh-cn/administration/command-line#dump) 命令备份所有需要的文件到一个 `zip` 压缩文件中。

```sh
su gitea -c "/usr/local/bin/gitea dump --config /etc/gitea/app.ini"
```

最后生成的 *gitea-dump-1719182585.zip* 文件将会包含如下内容。

```
1、app.ini：配置文件。
2、data/：数据目录。
3、repos/：仓库目录的完整副本。
4、gitea-db.sql：数据库备份。
```

### 数据目录

| 名称       | 目录                                     |
| ---------- | ---------------------------------------- |
| 仓库根目录 | `/var/lib/gitea/data/gitea-repositories` |
| LFS 根目录 | `/var/lib/gitea/data/lfs`                |
| 日志路径   | `/var/lib/gitea/log`                     |

