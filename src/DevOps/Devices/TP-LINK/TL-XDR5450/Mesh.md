---
title: Mesh
---

```
易展 1.0：最早一代的 Mesh 技术。

易展 2.0：支持 2.4GHz、5GHz、6GHz 三频互联，兼容无线、有线、光纤三种介质互联。还支持家用路由与企业路由、商用 AP/AC 相互兼容。

易展 3.0：支持易展 IoT 设备一键快速接入，支持改密码后自动重连。
```

## 配置数据库

```sh
# Mesh 设备能力数据库

# "is_mesh_device": true,

root@(none):/tmp# cat /conf/apdb.json
{
        "ap_name":"TL-XDR5450易展版",
        "version":1,
        "id":1414570147,
        "vendor":0,
        "flags":0,
        "support_cloud_upgrade":true,
        "hardware_id":"C908A92EA21EC3AFF6385C389FAE766E",
        "product_type": 1,
        "is_mesh_device": true,
        "ext_wire_phy": 3,
        "power_position":"left",
        "phy_type":"RJ45,RJ45,RJ45",
        "models":[{
                "hwver":"3.0",
                "radios":{
                        "2.4G":{
                                "max_ssid":     7,
                                "max_stations": 128,
                                "max_tx_power": 29,
                                "min_tx_power": 3,
                                "dft_tx_power": 29,
                                "support_11ax": true,
                                "support_WPA3": true,
                                "max_tx_stream": 2,
                                "max_rx_stream": 2
                        },
                        "5.0G":{
                                "max_ssid":     7,
                                "max_stations": 512,
                                "max_tx_power": 29,
                                "min_tx_power": 6,
                                "dft_tx_power": 29,
                                "support_11ac": true,
                                "support_11ax": true,
                                "support_WPA3": true,
                                "support_160m": true,
                                "mutex_channel": "36,40,44,48,52,56,60,64,149,153,157,161,165",
                                "max_tx_stream": 4,
                                "max_rx_stream": 4
                        }
                }
        }]
}
```

```sh
# 系统是否支持 Mesh

# "support_mesh": "1"

root@(none):/tmp# cat /tmp/etc/config/system.json
{"capability":{"system_time_capability":{"version":"1.1.0"}},"system":{"sys_mode":{"mode":"0"},"capability":{"system_capability":{"quick_setup":"0","support_ap_mode":"1","support_client_mode":"0","support_router_mode":"1","support_mesh":"1","support_serial_server":"0","support_ipv6":"1","no_support_pair_button":"0"}},"global_config":{"work_mode":"0","mngt_mode":"1","work_form":"1","controller_detect_mode":"1"},"sys":{"timezone":"CST-8","is_factory":"1"}},"timeserver":{"ntp":{"pri_ntp":"","snd_ntp":""}},"time_type":{"time_type":{"type":"auto"}}}
```

```sh
# 当前 Mesh 运行状态

# "mesh_switch": {
#   "enable": 1
# }

root@(none):/tmp# cat /tmp/etc/config/mapd.json
{"business":{"mesh_switch":{"enable":1},"token_connect_ctx":{"mesh_client_token":"65475A656D6B31494C4A436F47537132614E3874527979483866516B6B633174"},"mesh_group":{"cap_al_mac":"48-5f-08-86-b8-6a"},"role_selection":{"role":1,"paired":1},"bh_config":{"bh_work_mode":1,"ext_steering":0,"wired_ext_steering":1},"autoconf":{"config_ver":51,"token":"6532363136313264393137356263373033333731636563373961663665383030"}},"topology_db":[ {"485F0886B86A":{"mac":"485F0886B86A","position":"","model":"TL-XDR5450易展Turbo版","name":"TL-XDR5450易展Turbo版_B86A","phy_num":"3","power_pos":"0","svlan":"1","sub_func":"60","port":[ "4", "3", "1" ],"speed":[ "3", "3", "3" ],"type":[ "1", "1", "1" ],"sfp_cap":[ "auto" ]}} ]}
```

## DMS

```sh
# dms 里的关键信息

root@(none):/tmp# strings /bin/dms | grep -i "mesh2\|mesh3\|map_cur_version\|protocol_version\|map_ver_support_mesh2"

map_cur_version
map_ver_support_mesh2
CWVendorInfo_mesh2_join_type
CWVendorInfo_protocol_version
VENDOR_SPEC_PAYLOAD_PROTOCOL_VERSION
mesh2.0 wait for ac allow join in!
New re is mesh2.0 device, do not send joinRequest for it!
```

