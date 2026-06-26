---
title: Firmware Version Pipeline
---

## Web API

```sh
curl 'http://192.168.9.253/stok=c615553eae2e5015f823a06a311823e1/ds' \
  -H 'Accept: text/plain, */*; q=0.01' \
  -H 'Accept-Language: zh-CN,zh;q=0.9' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json; charset=UTF-8' \
  -H 'Origin: http://192.168.9.253' \
  -H 'Referer: http://192.168.9.253/' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36' \
  -H 'X-Requested-With: XMLHttpRequest' \
  --data-raw '{"method":"get","firmware":{"name":"config"}}' \
  --insecure
```

```json
{
    "error_code": 0,
    "firmware": {
        "config": {
            "model": "TL-AC100",
            "hardware_version": "4.0",
            "firmware_version": "1.4.4%20Build%20240911%20Rel.65759n"
        }
    }
}
```

## Result

```sh
# 01
# 找 /ds 的 LuCI 入口
root@TP-LINK:~# find /usr/lib/lua/luci -type f | grep 'ds.lua'
/usr/lib/lua/luci/controller/ds.lua

# 能看到 /ds 会解析 JSON，然后走 do_ds()，最后 write_json() 输出
root@TP-LINK:~# grep -n "function ds" /usr/lib/lua/luci/controller/ds.lua
250:function ds(r)local t={}local n

root@TP-LINK:~# grep -n "write_json" /usr/lib/lua/luci/controller/ds.lua
257:write_json(t)return
259:t=do_ds(n)write_json(t)end
458:function write_json(e)s.prepare_content("application/json")s.write_json(e,urlencode)end
```

```sh
# 02
# 找 firmware 模块
root@TP-LINK:~# find /usr/lib/lua/luci -type f | grep -i firmware
/usr/lib/lua/luci/controller/admin/firmware.lua
/usr/lib/lua/luci/controller/admin/firmware_backuprestore.lua
/usr/lib/lua/luci/controller/admin/firmware_upgrade.lua
/usr/lib/lua/luci/model/ap_upgrade_firmware.lua
/usr/lib/lua/luci/model/local_upgrade_firmware.lua
/usr/lib/lua/luci/model/upgrade_firmware.lua
/usr/lib/lua/luci/view/userrpm/firmware_backuprestore.htm
/usr/lib/lua/luci/view/userrpm/firmware_factory.htm
/usr/lib/lua/luci/view/userrpm/firmware_reboot.htm
/usr/lib/lua/luci/view/userrpm/firmware_upgrade.htm

# 重点文件是 firmware.lua
root@TP-LINK:~# cat /usr/lib/lua/luci/controller/admin/firmware.lua
local i=require("luci.torchlight.error")local e=require("luci.model.uci")module("luci.controller.admin.firmware",package.seeall)function index()register_module("firmware")register_keyword_data("firmware","config","get_firmware")end
local r=e.cursor()function get_firmware(e,e,e,e)local e={}e.model=r:get("device_info","info","device_model")e.hardware_version=r:get("device_info","info","hw_version")e.firmware_version=r:get("device_info","info","sw_version")return i.ENONE,e
end
```

```lua
-- 核心逻辑
register_module("firmware")
register_keyword_data("firmware","config","get_firmware")

function get_firmware(...)
    local e={}
    e.model=r:get("device_info","info","device_model")
    e.hardware_version=r:get("device_info","info","hw_version")
    e.firmware_version=r:get("device_info","info","sw_version")
    return i.ENONE,e
end

-- 说明 Web 返回的 firmware.config.firmware_version 来自
-- device_info.info.sw_version
```

```sh
# 03
# 直接查 UCI 值
root@TP-LINK:~# uci show device_info
device_info.info=info
device_info.info.sys_software_revision=0x500a0104
device_info.info.sys_software_revision_minor=0x0004
device_info.info.device_name=TL-AC100 4.0
device_info.info.device_info=TL-AC100 4.0
device_info.info.device_type=AC
device_info.info.device_model=TL-AC100
device_info.info.hw_version=4.0
device_info.info.domain_name=tplogin.cn
device_info.info.language=CN
device_info.info.enable_dns=1
device_info.info.manufacturer_name=TP-LINK
device_info.info.manufacturer_url=www.tp-link.com.cn
device_info.info.fw_description=AC100v4
device_info.info.vendor_id=0x00000001
device_info.info.zone_code=0x0
device_info.info.product_id=4CFE9A9F
device_info.info.sw_version=1.4.4 Build 240911 Rel.65759n

root@TP-LINK:~# uci get device_info.info.sw_version
1.4.4 Build 240911 Rel.65759n
```

```sh
# 04
# 找这个 UCI 值实际来自哪个文件

# 先看普通配置文件
root@TP-LINK:~# ls -l /etc/config
lrwxrwxrwx    1 root     root            16 Sep 11  2024 /etc/config -> /tmp/etc/uc_conf

# 基本是空的
root@TP-LINK:~# cat /etc/config/device_info
config info 'info'

# 所以继续找运行时文件
root@TP-LINK:~# find /tmp -maxdepth 3 -type f -name "device_info" -print -exec cat {} \;
/tmp/.ucisys/device_info
device_info.info=info
device_info.info.sys_software_revision=0x500a0104
device_info.info.sys_software_revision_minor=0x0004
device_info.info.device_name=TL-AC100 4.0
device_info.info.device_info=TL-AC100 4.0
device_info.info.device_type=AC
device_info.info.device_model=TL-AC100
device_info.info.hw_version=4.0
device_info.info.domain_name=tplogin.cn
device_info.info.language=CN
device_info.info.enable_dns=1
device_info.info.manufacturer_name=TP-LINK
device_info.info.manufacturer_url=www.tp-link.com.cn
device_info.info.fw_description=AC100v4
device_info.info.vendor_id=0x00000001
device_info.info.zone_code=0x0
device_info.info.product_id=4CFE9A9F
device_info.info.sw_version=1.4.4 Build 240911 Rel.65759n
/tmp/etc/sys_conf/device_info

config info 'info'
	option sys_software_revision '0x500a0104'
	option sys_software_revision_minor '0x0004'
	option device_name 'TL-AC100 4.0'
	option device_info 'TL-AC100 4.0'
	option device_type 'AC'
	option device_model 'TL-AC100'
	option hw_version '4.0'
	option domain_name 'tplogin.cn'
	option language 'CN'
	option enable_dns '1'
	option manufacturer_name 'TP-LINK'
	option manufacturer_url 'www.tp-link.com.cn'
	option fw_description 'AC100v4'
	option vendor_id '0x00000001'
	option zone_code '0x0'
	option product_id '4CFE9A9F'
	option sw_version '1.4.4 Build 240911 Rel.65759n'

/tmp/etc/uc_conf/device_info

config info 'info'

/tmp/.uci/device_info

# 重点会看到
# /tmp/etc/sys_conf/device_info
# /tmp/etc/uc_conf/device_info
# /tmp/.ucisys/device_info

# 这里就是完整来源
# /tmp/etc/sys_conf/device_info
```

```sh
# 05
# 为什么空的 /etc/config 也能读到完整值

# 看一下 uci 链接的库
root@TP-LINK:~# ldd /sbin/uci
ldd: can't open cache '/etc/ld.so.cache'
	libuci.so => /lib/libuci.so (0x77675000)
	libdl.so.0 => /lib/libdl.so.0 (0x77661000)
	libubox.so => /lib/libubox.so (0x7764a000)
	libblobmsg_json.so => /lib/libblobmsg_json.so (0x77638000)
	libjson-c.so.2 => /usr/lib/libjson-c.so.2 (0x77620000)
	libiconv.so.2 => /usr/lib/libiconv.so.2 (0x775f3000)
	libgcc_s.so.1 => /lib/libgcc_s.so.1 (0x775cf000)
	libc.so.0 => /lib/libc.so.0 (0x77562000)
	ld-uClibc.so.0 => /lib/ld-uClibc.so.0 (0x77690000)

# 会看到
# libuci.so => /lib/libuci.so

# 再看 TP-LINK 改过的 UCI 库里有什么路径
root@TP-LINK:~# strings /lib/libuci.so | grep /tmp
/tmp/.ucisys
[ -e /tmp/jffs2_ready ] && cat /tmp/jffs2_ready || echo 1
/tmp/uc/config/
/tmp/.uci

root@TP-LINK:~# strings /lib/libuci.so | grep ucisys
/tmp/.ucisys

# 会看到类似
# /tmp/.ucisys
# /tmp/uc/config/
# /tmp/.uci

# 说明不是标准 OpenWrt 单层 /etc/config，而是 TP-LINK 做了系统配置层、用户配置层合并
```

```sh
# 06
# 找系统配置层怎么生成

# 查谁包含 /tmp/etc/sys_conf
for f in /bin/* /sbin/* /usr/bin/* /usr/sbin/* /lib/*.so; do
    strings "$f" 2>/dev/null | grep -q "/tmp/etc/sys_conf" && echo "$f"
done

# 会看到关键程序
# /bin/uc_convert

# 看它的字符串
root@TP-LINK:~# strings /bin/uc_convert | grep -E "sys_conf|uc_conf|sys_conf_data|usr_conf_data|ucisys"
/tmp/etc/sys_conf/
/tmp/etc/def_uc_conf/
[ ! -f "/tmp/etc/uc_conf/%s" ] && cp -f /tmp/etc/def_uc_conf/%s /tmp/etc/uc_conf/%s 
 cp -f /tmp/etc/def_uc_conf/%s /tmp/etc/uc_conf/%s 
rm -rf /tmp/.ucisys/*
/tmp/.ucisys
/etc/usr_conf_data
/tmp/etc/uc_conf/
/tmp/etc/old_uc_conf/
/tmp/tmp_uc_conf/uc.conf
/tmp/etc/uc_conf/uc_conf
/etc/tmp_uc_conf/uc.conf
/etc/sys_conf_data
mkdir -p /tmp/etc/def_uc_conf/; mkdir -p /tmp/tmp_uc_conf/
/tmp/fac_uc_conf/

# 会看到类似
/etc/sys_conf_data
/tmp/etc/sys_conf/
/etc/usr_conf_data
/tmp/etc/uc_conf/
/tmp/.ucisys

# 这说明启动时 uc_convert/libuci 体系会把固件里的 /etc/sys_conf_data 解包/缓存成 /tmp/etc/sys_conf/device_info
root@TP-LINK:~# cat /tmp/etc/sys_conf/device_info
config info 'info'
	option sys_software_revision '0x500a0104'
	option sys_software_revision_minor '0x0004'
	option device_name 'TL-AC100 4.0'
	option device_info 'TL-AC100 4.0'
	option device_type 'AC'
	option device_model 'TL-AC100'
	option hw_version '4.0'
	option domain_name 'tplogin.cn'
	option language 'CN'
	option enable_dns '1'
	option manufacturer_name 'TP-LINK'
	option manufacturer_url 'www.tp-link.com.cn'
	option fw_description 'AC100v4'
	option vendor_id '0x00000001'
	option zone_code '0x0'
	option product_id '4CFE9A9F'
	option sw_version '1.4.4 Build 240911 Rel.65759n'

# 然后 LuCI 从 UCI 读出来
```

```sh
# 最终链路
/etc/sys_conf_data
  -> /bin/uc_convert 解包/缓存
  -> /tmp/etc/sys_conf/device_info
  -> uci get device_info.info.sw_version
  -> /usr/lib/lua/luci/controller/admin/firmware.lua:get_firmware()
  -> /usr/lib/lua/luci/controller/ds.lua:write_json()
  -> Web 响应 firmware_version
```

