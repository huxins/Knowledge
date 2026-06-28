---
title: Firmware Version
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

## Chain

```sh
# 01: LuCI

# 找 /ds 的 LuCI 入口
root@TP-LINK:~# find /usr/lib/lua/luci -type f | grep 'ds.lua'
/usr/lib/lua/luci/controller/ds.lua

# 能看到 /ds 会解析 JSON，然后走 do_ds()，最后 write_json() 输出

# 找 firmware 模块
root@TP-LINK:~# find /usr/lib/lua/luci -type f | grep -i firmware
root@TP-LINK:~# cat /usr/lib/lua/luci/controller/admin/firmware.lua

# /ds 的 firmware.config.get 注册到 get_firmware()
# 它不是动态拼字符串，而是从 UCI 配置 device_info.info 读取三项：device_model、hw_version、sw_version
```

```lua
-- firmware.lua 核心逻辑
register_module("firmware")
register_keyword_data("firmware","config","get_firmware")

function get_firmware(...)
    local e={}
    e.model=r:get("device_info","info","device_model")
    e.hardware_version=r:get("device_info","info","hw_version")
    e.firmware_version=r:get("device_info","info","sw_version")
    return i.ENONE,e
end
```

```sh
# 2: UCI

root@TP-LINK:~# uci get device_info.info.sw_version
1.4.4 Build 240911 Rel.65759n

# uci show device_info 能显示完整信息，但 /etc/config/device_info 本身只有空 section
# 说明值不是普通配置文件静态写进去的，应该由 TP-LINK 的 UCI 扩展/运行态配置层补出来，或者从某个二进制区域加载后注入

# 运行态数据佐证：find /tmp -maxdepth 3 -type f -name "device_info" -print -exec cat {} \;
# /tmp/.ucisys/device_info
# /tmp/etc/sys_conf/device_info
# /tmp/etc/uc_conf/device_info
# /tmp/.uci/device_info

# /tmp/etc/sys_conf: 启动时的系统默认配置集
# /tmp/etc/uc_conf: 用户配置集

# /etc/config 本身是指向 /tmp/etc/uc_conf 的软链，但 TP-LINK 的 uci 会把系统层 /tmp/etc/sys_conf 和用户层合并，所以空的用户层仍能读到系统层默认值
```

```sh
# 3: /lib/libuci.so

root@TP-LINK:~# ldd /sbin/uci
root@TP-LINK:~# strings /lib/libuci.so | grep /tmp
root@TP-LINK:~# strings /lib/libuci.so | grep ucisys

# /lib/libuci.so 里能看到 /tmp/.ucisys 等 TP-LINK 扩展字符串，合并逻辑基本坐实是在改过的 libuci 里
```

```sh
# 4: /bin/uc_convert

# 查谁包含 /tmp/etc/sys_conf
for f in /bin/* /sbin/* /usr/bin/* /usr/sbin/* /lib/*.so; do
    strings "$f" 2>/dev/null | grep -q "/tmp/etc/sys_conf" && echo "$f"
done

# 会看到关键程序
# /bin/uc_convert

# 看它的字符串
root@TP-LINK:~# strings /bin/uc_convert | grep -E "sys_conf|uc_conf|sys_conf_data|usr_conf_data|ucisys"

# 它从 /etc/sys_conf_data 取系统配置，缓存到 /tmp/etc/sys_conf/，并维护 /tmp/.ucisys
# 用户配置则从 /etc/usr_conf_data 或 mtdblock4 挂载出来的 userconfig 恢复到 /tmp/etc/uc_conf/

# /etc/sys_conf_data 和 /etc/usr_conf_data 都是固件内置的数据包，uc_convert 会解密/校验/解包它们
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
  
# /ds 请求进入 /usr/lib/lua/luci/controller/ds.lua
# firmware 模块在 /usr/lib/lua/luci/controller/admin/firmware.lua 注册
# get_firmware() 读取 UCI
```

## Result

```sh
root@TP-LINK:~# uci get device_info.info.sw_version
1.4.4 Build 240911 Rel.65759n

# -------------------------------------------------

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
```

