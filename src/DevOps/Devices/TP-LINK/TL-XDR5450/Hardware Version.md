---
title: Hardware Version
---

```xml
# cat /conf/oem.xml

<device name="xdr5450mtv3">
    <element name="fullName">TP-LINK Wireless Router TL-XDR5450易展Turbo版</element>
    <element name="modelName">TL-XDR5450易展Turbo版</element>
    <element name="deviceInfo">XDR5450易展Turbo版V3 Wireless Router</element>
    <element name="modelVer">3.0</element>
    <element name="prodId">0x5450A0A3</element>
</device>
```

```sh
# /bin/dms 里有对应的读取/展示逻辑线索
UCGetDeviceModel
UCGetHardwareVersion
UCGetHardwareVersionStr
deviceModel
hardwareVersion
modelName
```

