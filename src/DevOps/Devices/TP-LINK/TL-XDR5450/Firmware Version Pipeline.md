---
title: Firmware Version Pipeline
---

```sh
# 先看已知构建信息
root@(none):~# cat /etc/build_info.conf
BUILD_DATE = 240531
BUILD_DATE_YEAR = 24
BUILD_DATE_MONTH = 5
BUILD_DATE_MDAY = 31
BUILD_DATE_HOUR = 20
BUILD_DATE_MIN = 47
BUILD_DATE_SEC = 33
SYS_SOFTWARE_REVISION = 0x50010002
SYS_SOFTWARE_REVISION_MINOR = 0x0000

# 全局搜索，找不到 Rel.74853 相关信息，确认它不是明文配置

# 找 Web 后台主程序
root@(none):~# ls -l /proc/$(pidof dms)/exe
lrwxrwxrwx    1 root     root             0 Jun 26 18:20 /proc/1630/exe -> /bin/dms

# 在 dms 里找版本格式字符串
root@(none):~# strings /bin/dms | grep -i "Rel\|Build\|SoftwareVersion\|UCGetSoftwareVersion"
# 关键输出
UCGetSoftwareVersionStr
UCGetBuildTime
%hd.%hd.%hd Build %08x Rel. %d
softVersion : %d.%d.%d Build %08x Rel. %d

# 验证 Rel 的计算方式
root@(none):~# awk -F ' = ' '{a[$1]=$2} END {rev=a["SYS_SOFTWARE_REVISION"]; printf "%d.%d.%d Build %s Rel.%d\n", substr(rev,5,2), substr(rev,7,2), substr(rev,9,2), a["BUILD_DATE"], a["BUILD_DATE_HOUR"]*3600 + a["BUILD_DATE_MIN"]*60 + a["BUILD_DATE_SEC"]}' /etc/build_info.conf
1.0.2 Build 240531 Rel.74853
```

