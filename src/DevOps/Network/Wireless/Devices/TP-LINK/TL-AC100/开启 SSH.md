---
title: 开启 SSH
---

- [AC100 看闲鱼有办法把 3.0 升到 4.0 - *qq494829835*](https://www.chiphell.com/thread-2601769-1-1.html)

```
Web 开启故障诊断模式

Port: 33400
Password: echo -n "A4-1A-3A-80-B3-AB" | tr -d '-' | tr '[a-z]' '[A-Z]' | md5sum | cut -b 1-16

BusyBox v1.19.4 protect shell (psh)
```

## 解锁完整 Shell

```sh
# SSH Password: ac9b98b41fdcf4cf
# BusyBox v1.19.4 (2024-09-11 18:08:18 CST) built-in shell (ash)

# 验证
ssh -p 33400 -o KexAlgorithms=+diffie-hellman-group14-sha1 -o HostKeyAlgorithms=+ssh-rsa root@192.168.9.253 "cat /etc/profile"

# 删除/sbin/psh
ssh -p 33400 -o KexAlgorithms=+diffie-hellman-group14-sha1 -o HostKeyAlgorithms=+ssh-rsa root@192.168.9.253 "sed -i '/\/sbin\/psh/d' /etc/profile"
```

