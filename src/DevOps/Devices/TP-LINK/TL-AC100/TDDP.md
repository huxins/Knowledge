---
title: TDDP
---

```sh
root@TP-LINK:~# ubus call tddpServer getInfo '{"infoMask":-1,"sep":"-"}'
{
	"mac": "A4-1A-3A-80-B3-AB",
	"pin": "",
	"dev_id": "001047B97EA2DFEB94471777118247711F474B72",
	"hw_id": "89E963BE1E5C260AEEFFD100EABDC1E1",
	"hw_id_des": "",
	"fw_cur_id": "E4B5B9DDAF6EB5DD5CB7253F7F347C80",
	"flash_sign": "009C0E5D68CD5D10197E51E3B67A70E5EFD798E41B79FFC545D4EFC983167541022E6C96FFCF244B1CBA6ADACC4171DF82EF3CE8DBF3863313C69424F5ECEB3E1E875A10E2DD172BA8D5AA90241F1DCE3CD184150AFC55F4CFA249CB4C44D87804215BF97BFAC22522C6BF592F9568F812FC175D1F7C57364EA403FFD7504B68",
	"backward_list": "",
	"date": "2026-06-27 06:04:13"
}

# dev_id: 设备唯一标识符
# hw_id: 硬件架构/版本 ID
# fw_cur_id: 当前固件 ID
```

```sh
root@TP-LINK:~# ubus -v list tddpServer
'tddpServer' @1b6a8efe
	"start": {  }
	"cleanTMP": { "port": "Integer" }
	"getRadio": { "offset": "Integer", "length": "Integer" }
	"getInfo": { "infoMask": "Integer", "sep": "String" }
	"checkDevID": { "status": "Integer" }
	"dbg": {  }
	"supportExternalDevInfo": { "type": "String", "cmd": "String" }
	"supportExternalProductTest": { "type": "String", "cmd": "String" }
```

