---
title: ImmortalWrt
---

- [ImmortalWrt Firmware Selector](https://firmware-selector.immortalwrt.org/)

## 安装

### PVE

```sh
wget https://downloads.immortalwrt.org/releases/24.10.3/targets/x86/64/immortalwrt-24.10.3-x86-64-generic-ext4-combined.qcow2.gz
gunzip immortalwrt-24.10.3-x86-64-generic-ext4-combined.qcow2.gz
qm importdisk 104 immortalwrt-24.10.3-x86-64-generic-ext4-combined.qcow2 local-lvm
```

## 网络配置

```sh
# 根据实际情况修改网络配置
# /etc/config/network

# 静态
config interface 'lan'
        option device 'br-lan'
        option proto 'static'
        option ipaddr '192.168.9.73'
        option netmask '255.255.255.0'
        option ip6assign '60'
        option gateway '192.168.9.1'
        list dns '192.168.9.1'

# 重启网络
/etc/init.d/network restart
```

## 软件安装

### SFTP

```sh
# 安装 SFTP
opkg update
opkg install openssh-sftp-server
```

## 磁盘扩容

```sh
# 扩容硬盘

# 工具包
opkg update
opkg install cfdisk e2fsprogs blkid

# 在空闲空间建立分区（在 PVE 里增大硬盘）
cfdisk
# 查看新分区的设备号
fdisk -l
# 格式化分区
mkfs.ext4 /dev/sda3
# 查看 UUID
blkid
# 在 UI 界面挂载新分区到根目录
# 之后根据实际情况运行下列命令
mkdir -p /tmp/introot
mkdir -p /tmp/extroot
mount --bind / /tmp/introot
mount /dev/sda3 /tmp/extroot
tar -C /tmp/introot -cvf - . | tar -C /tmp/extroot -xf -
umount /tmp/introot
umount /tmp/extroot
reboot
```

