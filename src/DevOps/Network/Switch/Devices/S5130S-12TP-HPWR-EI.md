---
title: S5130S-12TP-HPWR-EI
---

- [家用 VLAN 划分方案 - *皮卡丘*](https://www.xiaohongshu.com/discovery/item/6a0d36380000000035038b89?source=webshare&xhsshare=pc_web&xsec_token=ABVJr4n3Te78Gx1BRZAV2BE78EjHn1QpS005ZCWHUTaLw=&xsec_source=pc_share)

```sh
# 清除当前保存的配置文件
<H3C> reset saved-configuration

# 查看当前配置
<H3C> display current-configuration

# 保存配置
<H3C> save

# 查看端口
<H3C> display interface GigabitEthernet 1/0/1

# 查看VLAN配置
<H3C> display vlan brief

# 查看VLANIF端口
<H3C> display interface Vlan-interface 1

# 查看PoE端口
<H3C> display poe interface

# 查看MAC地址表
<H3C> display mac-address interface GigabitEthernet 1/0/1

# 查看ARP表
<H3C> display arp | include 192.168.9.10

# 查看DHCP客户端
<H3C> display dhcp client interface Vlan-interface 10
```

## SSH

```sh
# 创建用户
[H3C] local-user admin class manage
[H3C-luser-manage-admin] password simple <password>
[H3C-luser-manage-admin] service-type ssh
[H3C-luser-manage-admin] authorization-attribute user-role network-admin

[H3C] line vty 0 4
[H3C-line-vty0-4] authentication-mode scheme

[H3C] ssh server enable
<H3C> display ssh server status
```

## DHCP Snooping

```sh
<H3C> display dhcp snooping trust
<H3C> display dhcp snooping binding

# 开启DHCP Snooping
[H3C] dhcp enable
[H3C] display current-configuration | include dhcp
[H3C] dhcp snooping enable

# 开放信任
[H3C] interface GigabitEthernet 1/0/9
[H3C-GigabitEthernet1/0/9] dhcp snooping trust

# 可开启仿冒DHCP服务器日志
# 可结合IPSG，禁止手动改静态IP

[H3C] vlan 10
[H3C-vlan10] dhcp snooping enable
```

```sh
# Windows 重新获取 DHCP
ipconfig /release
ipconfig /renew
```

## VLAN

```sh
# 新建 VLAN
[H3C] vlan 10
[H3C-vlan10] description Admin_Network
[H3C-vlan10] dhcp snooping enable

# 清除 PVID 配置
[H3C-if-range] undo port access vlan

# 设置 PVID 配置
[H3C-if-range] port hybrid pvid vlan 10

# 修改PVID，Access模式下
[H3C] interface range GigabitEthernet 1/0/1 to GigabitEthernet 1/0/12
[H3C-if-range] port access vlan 10

# ------
# 修改所有端口为Hybrid模式
[H3C] interface range GigabitEthernet 1/0/1 to GigabitEthernet 1/0/12

# 如果是Trunk，取消放行所有VLAN
[H3C-if-range] undo port trunk permit vlan all
[H3C-if-range] port trunk permit vlan 1

# 如果是Access，退回默认VLAN 1
[H3C-if-range] port access vlan 1

# 将所有端口的链路类型更改为 Hybrid
[H3C-if-range] port link-type hybrid

# 指定 Hybrid 端口以 Untagged（不带标签）方式放行默认的 VLAN 1
[H3C-if-range] port hybrid vlan 1 untagged
[H3C-if-range] port hybrid vlan 10 untagged
# ------

# 删除虚接口
[H3C] undo interface Vlan-interface 1

# 新建虚接口
[H3C] interface Vlan-interface 10
[H3C-Vlan-interface10] ip address dhcp-alloc
[H3C-Vlan-interface10] dhcp client identifier ascii 30b0371b3510-VLAN0010

# 创建业务 VLAN 10 和 20，并手动指定它们的网关 IP（不需要通过 DHCP 获取）
[H3C] vlan 10
[H3C-vlan10] quit
[H3C] interface Vlan-interface 10
[H3C-Vlan-interface10] ip address 192.168.10.1 255.255.255.0
[H3C-Vlan-interface10] quit
```

