---
title: factory_info
---

```sh
root@(none):~# cat /proc/mtd
dev:    size   erasesize  name
mtd0: 0009f800 00010000 "factory_boot"
mtd1: 00000800 00000800 "factory_info"
mtd2: 00010000 00010000 "art"
mtd3: 00010000 00010000 "config"
mtd4: 00020000 00010000 "normal_boot"
mtd5: 0025806c 00010000 "kernel"
mtd6: 00a47f94 00010000 "rootfs"
mtd7: 00280000 00010000 "rootfs_data"
mtd8: 00f20000 00010000 "firmware"
```

```sh
+------+--------+--------+--------------------------------------------------------------+
| Type | Offset | Length | Content                                                      |
+------+--------+--------+--------------------------------------------------------------+
| 2    | 0x2e   | 0x14   | 00 00 91 6d 41 93 71 60 c9 d7 56 ae 83 9f 13 73 21 8d 16 b3  |
| 3    | 0x46   | 0x10   | C908A92EA21EC3AFF6385C389FAE766E                             |
+------+--------+--------+--------------------------------------------------------------+
```

## hardware_id

```sh
root@(none):/tmp/etc/config# sed -n 's/.*"hardware_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' /conf/apdb.json
C908A92EA21EC3AFF6385C389FAE766E

root@(none):/tmp/etc/config# dd if=/dev/mtd1 bs=1 skip=$((0x46+4)) count=16 2>/dev/null | busybox hexdump -v -e '1/1 "%02X"'
C908A92EA21EC3AFF6385C389FAE766E
```

