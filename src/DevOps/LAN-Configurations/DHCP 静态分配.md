---
title: DHCP 静态分配
---

```sh
# dnsmasq.conf

# Route
dhcp-host=BC:24:11:51:E7:73,192.168.9.254,OpenWrt

# HX
dhcp-host=F0:B6:1E:85:A6:D8,set:proxy,192.168.9.10,7090MFF
dhcp-host=C8:09:A8:22:5E:39,set:proxy,192.168.9.11,ENVY
dhcp-host=CE:6F:C7:4B:D8:61,set:proxy,192.168.9.12,iPhone-12

# SYY
dhcp-host=34:CF:F6:19:6C:4D,set:proxy,192.168.9.20,M920x
dhcp-host=D8:80:83:41:8D:B1,192.168.9.21,EliteBook

# Server
dhcp-host=00:11:32:12:34:56,192.168.9.31,DSM
dhcp-host=BC:24:11:3D:CE:AB,192.168.9.32,Tailscale
dhcp-host=BC:24:11:04:68:FF,192.168.9.33,Storage-mounting

# PVE-S1
dhcp-host=B0:0C:D1:54:60:93,192.168.9.71,PVE-S1

# 配置选项
dhcp-option=lan,tag:proxy,3,192.168.9.254
dhcp-option=lan,tag:proxy,6,192.168.9.254
```

