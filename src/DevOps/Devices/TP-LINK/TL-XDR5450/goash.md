---
title: goash
---

```
Sign   String:     q48LKAABEABBAIFEKAJB
Sign   String:     q48LKASJHAMUUMEPNZLS
Sign   String:     ABQAYIFAMZILRERGAXDY
```

```sh
# 共同前缀: q48LK

# goash 会打开 /tmp/etc/config/uhttpd.json，查找 password":"，取密码字段前 5 个字符
root@(none):~# cat /tmp/etc/config/uhttpd.json
{"uhttpd":{"main":{"listen_http_lan":"80","listen_http_wan":"8888"}},"webPwd":{"webPwd":{"password":"q48LKghc9TefbwK","fac_password":"WaQ7xbhc9TefbwK"}}}
```

## 正常路径

```sh
# 正常路径：q48LKAABEABBAIFEKAJB

# 后 15 字符来自 Flash
打开 /dev/slp_flash_chrdev
用 ioctl 0x8001df04 查询 Flash 区域 1
用 ioctl 0x8001df05 读取区域 1
解析其中 TLV type 2，长度最多 20 字节
对每个原始字节 b 转换

letter = 'A' + (b & (b >> 4));

取转换结果前 15 个字符

# Flash 内容固定，所以通常总是
q48LK + AABEABBAIFEKAJB
```

```sh
# type 2 这条就在 mtd1: factory_info 里
offset 0x2e: 00 02   # TLV type = 2
offset 0x30: 00 14   # TLV len  = 0x14 = 20 字节
offset 0x32: 00 00 91 6d 41 93 71 60 c9 d7 56 ae 83 9f 13 73 21 8d 16 b3

偏移: 0x2e | 长度: 2  | 含义: type = 2
偏移: 0x30 | 长度: 2  | 含义: len = 20
偏移: 0x32 | 长度: 20 | 含义: 实际 payload

# 这 20 个字节经过映射后，会变成
AABEABBAIFEKAJBDAIAD

# 取前 15 个就是
AABEABBAIFEKAJB
```

```sh
# 验证
root@(none):/tmp/etc/config# set -- $(dd if=/dev/mtd1 bs=1 skip=$((0x32)) count=20 2>/dev/null | busybox hexdump -v -e '1/1 "%02x "'); for b; do v=$((0x$b)); printf '%b' "$(printf '\\%03o' $((65 + (v & (v >> 4)))))"; done; printf '\n'
AABEABBAIFEKAJBDAIAD
```

## 异常回退

### flash 打开失败

```sh
# 异常回退：q48LKASJHAMUUMEPNZLS

 <readFlash> flashGetPartitionSize(422). read flash size ioctl failed.
 <ASH> goashcmd(8561). get DevID failed

# 当 Flash 设备打开失败、ioctl 失败、找不到 TLV type 2，或长度异常时，代码改为
for (i = 0; i < 15; i++)
    suffix[i] = rand() % 26 + 'A';

# 关键缺陷是：这条路径没有调用 srand()。每次新启动的 psh 都从 libc 默认随机状态开始，所以所谓“随机”结果会固定成：
ASJHAMUUMEPNZLS
```

```
因此：
AABEABBAIFEKAJB：Flash TLV 数据转换结果。
ASJHAMUUMEPNZLS：读取 Flash 失败后的未播种 rand() 回退值。
```

```sh
# 验证
root@(none):/tmp/etc/config# hi=0; lo=0; i=0; out=; while [ $i -lt 15 ]; do prod=$((lo * 1284865837 + 1)); newlo=$((prod & 0xffffffff)); carry=$((prod >> 32)); prod2=$((hi * 1284865837 + lo * 1481765933 + carry)); newhi=$((prod2 & 0xffffffff)); hi=$newhi; lo=$newlo; c=$((((newhi >> 1) % 26) + 65)); esc=$(printf '\\%03o' $c); out=$out$(printf %b "$esc"); i=$((i+1)); done; echo "$out"
ASJHAMUUMEPNZLS
```

### uhttpd.json 读取失败

```sh
# 异常回退：ABQAYIFAMZILRERGAXDY

# goash 先尝试读取 /tmp/etc/config/uhttpd.json
# 从里面找 password":"...，取前 5 个字符
# 这一步失败，会走这个分支
 <ASH> goashcmd(8529). open /tmp/etc/config/uhttpd.json error.

# 代码只有在连 uhttpd.json 都读取失败时，才会执行：
srand((time(NULL) + 28800) / 3600);

# 然后用 rand() 生成
```

```sh
# 验证
# 用 Shell 手工复现 musl libc 的 srand()/rand() 算法
root@(none):/tmp/etc/config# seed=$((( $(date +%s) + 28800 ) / 3600)); state=$((seed-1)); hi=$((state >> 32)); lo=$((state & 0xffffffff)); i=0; out=; while [ $i -lt 20 ]; do prod=$((lo * 1284865837 + 1)); newlo=$((prod & 0xffffffff)); carry=$((prod >> 32)); prod2=$((hi * 1284865837 + lo * 1481765933 + carry)); newhi=$((prod2 & 0xffffffff)); hi=$newhi; lo=$newlo; c=$((((newhi >> 1) % 26) + 65)); esc=$(printf '\\%03o' $c); out=$out$(printf %b $esc); i=$((i+1)); done; echo "$out"
ABQAYIFAMZILRERGAXDY
```

