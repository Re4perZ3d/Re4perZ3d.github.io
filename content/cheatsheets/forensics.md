---
title: "Forensics Cheat Sheet"
date: 2026-09-01
side: "blue"
summary: "My full DFIR reference: memory, disk, Windows artifacts, Eric Zimmerman tools, log analysis, network forensics, malware triage, steganography and CTF tricks."
tags: ["dfir", "forensics", "volatility", "windows-forensics", "ctf"]
---
> **SOC · DFIR · CTF** — everything in one place. Updated September 2026.

## My Tool Matrix

<table>
<thead><tr><th>Category</th><th>Tools</th></tr></thead>
<tbody>
<tr><td>Memory</td><td>Volatility 3, bulk_extractor, strings</td></tr>
<tr><td>Disk (Linux)</td><td>SleuthKit (fls/icat/mmls), Foremost, fdisk</td></tr>
<tr><td>Disk (Windows)</td><td>FTK Imager, Autopsy, EZ Tools suite</td></tr>
<tr><td>Windows Artifacts</td><td>PECmd, MFTECmd, EvtxECmd, SBECmd, SQLECmd, LECmd, JLECmd, RECmd, AmcacheParser, AppCompatCacheParser, SrumECmd, WxTCmd</td></tr>
<tr><td>Log Analysis</td><td>Chainsaw + Sigma, jq, auth.log/wtmp, EvtxECmd</td></tr>
<tr><td>Network</td><td>Wireshark, tshark, tcpdump, ssldump</td></tr>
<tr><td>Malware Static</td><td>olevba, oleobj, binwalk, DIE (Detect-It-Easy), strings, exiftool</td></tr>
<tr><td>Malware Dynamic</td><td><a href="http://any.run">any.run</a>, Cuckoo, pyinstxtractor + uncompyle6</td></tr>
<tr><td>Steganography</td><td>steghide, zsteg, stegsolve, Audacity, pngcheck</td></tr>
<tr><td>Crypto / Password</td><td>CyberChef, hashcat, john, bkcrack</td></tr>
<tr><td>Threat Intel</td><td>VirusTotal, <a href="http://URLscan.io">URLscan.io</a>, Unfurl, AnyRun, MalwareBazaar</td></tr>
</tbody>
</table>

## 1. Acquisition & Triage

<details><summary>KAPE (Kroll Artifact Parser and Extractor)</summary>

Best for live triage — collects and processes Windows artifacts in one shot.

```bash
# Collect + process in one command
kape.exe --tsource C: --tdest C:\kape_output --target !SANS_Triage --mdest C:\kape_modules --module !EZParser

# Collect only (for offline processing)
kape.exe --tsource C: --tdest output --target KapeTriage

# Common targets: !SANS_Triage, Windows, EventLogs, $MFT, Browsers, Prefetch
```

**Key collected artifacts:** $MFT, $J, Prefetch, Event Logs, Registry hives, browser DBs, LNK files, Jump Lists
</details>

<details><summary>Disk Imaging</summary>

```bash
# dc3dd (forensic dd with hashing)
dc3dd if=/dev/sdb of=disk.img hash=sha256 log=image.log

# dcfldd
dcfldd if=/dev/sdb of=disk.img bs=4k hash=md5,sha256 hashlog=hashes.txt

# FTK Imager (GUI) → File > Create Disk Image > Raw (dd)

# Verify integrity
md5sum disk.img
sha256sum disk.img
```
</details>

<details><summary>Linux Memory Acquisition (LiME)</summary>

```bash
# Load LiME module and dump to file
insmod lime.ko "path=/tmp/mem.lime format=lime"

# Or dump over network
insmod lime.ko "path=tcp:4444 format=lime"
# Receiver:
nc -l -p 4444 > mem.lime
```
</details>

## 2. Memory Forensics (Volatility 3)

<details><summary>Setup & Banner Identification</summary>

```bash
# Identify Linux kernel banner
vol -f mem.dmp banners
vol -r pretty -f mem.dmp banners

# Find matching symbol file in Abyss-W4tcher repo
grep -A 2 'Linux version X.X.X' banners_plain.json

# Download symbol file
wget https://github.com/Abyss-W4tcher/volatility3-symbols/raw/master/<path>.json.xz
# Place in: volatility3/volatility3/symbols/
```

- Symbol repo: [github.com/Abyss-W4tcher/volatility3-symbols](https://github.com/Abyss-W4tcher/volatility3-symbols)
- Cheat sheet: [hacktivity.fr/volatility-3-cheatsheet](https://hacktivity.fr/volatility-3-cheatsheet/)
- Blog: [blog.onfvp.com/post/volatility-cheatsheet](https://blog.onfvp.com/post/volatility-cheatsheet)
</details>

<details><summary>Linux Plugins</summary>

```bash
vol -f mem.dmp banners
vol -f mem.dmp linux.bash.Bash                       # Recover bash command history
vol -f mem.dmp linux.pstree.PsTree                   # Process tree, parent/child
vol -f mem.dmp linux.pslist.PsList                   # List active processes
vol -f mem.dmp linux.psscan.PsScan                   # Finds hidden/unlinked/terminated procs; compare with pslist
vol -f mem.dmp linux.lsof.Lsof                       # Open files and sockets per process
vol -f mem.dmp linux.lsmod.Lsmod                     # Loaded kernel modules
vol -f mem.dmp linux.malfind.Malfind                 # Suspicious memory regions (RWX, injected code)
vol -f mem.dmp linux.hidden_modules.Hidden_modules   # Kernel modules hidden from module list
vol -f mem.dmp linux.pagecache.Files >> files.txt    # Files cached in the page cache
vol -f mem.dmp linux.pagecache.InodePages --inode 0xXXX --dump   # Dump cached pages by inode
vol -f mem.dmp linux.sockstat.Sockstat               # Network sockets: state, addresses, owning process
vol -f mem.dmp linux.envars.Envars                   # Environment variables per process
vol -f mem.dmp linux.elfs.Elfs                       # Memory-mapped ELF files per process
vol -f mem.dmp linux.library_list.LibraryList        # Shared libraries loaded per process

# With remote symbol URL
vol --remote-isf-url https://github.com/Abyss-W4tcher/volatility3-symbols/raw/master/banners/banners.json -f mem.lime linux.bash.Bash
```
</details>

<details><summary>Windows Plugins</summary>

```bash
vol -f mem.dmp windows.pslist.PsList                 # List active processes
vol -f mem.dmp windows.pstree.PsTree                 # Process tree
vol -f mem.dmp windows.psscan.PsScan                 # Finds hidden/unlinked/terminated procs
vol -f mem.dmp windows.psxview.PsXView               # Detect hidden processes
vol -f mem.dmp windows.cmdline.CmdLine                # Full command line per process
vol -f mem.dmp windows.netscan.NetScan                # Network objects by pool tag
vol -f mem.dmp windows.netstat.NetStat
vol -f mem.dmp windows.malfind.Malfind                # Injected code detection
vol -f mem.dmp windows.dlllist.DllList                # DLLs loaded per process
vol -f mem.dmp windows.handles.Handles                # Open handles per process
vol -f mem.dmp windows.svcscan.SvcScan                # Windows services and state
vol -f mem.dmp windows.filescan.FileScan              # Scan memory for FILE_OBJECTs
vol -f mem.dmp windows.dumpfiles.DumpFiles --physaddr 0xXXX   # Extract a cached file from memory
vol -f mem.dmp windows.hashdump.Hashdump              # Dump local account NTLM hashes
vol -f mem.dmp windows.getsids.GetSIDs                # SIDs/privilege groups per process
vol -f mem.dmp windows.registry.hivelist.HiveList     # Registry hives loaded in memory
vol -f mem.dmp windows.registry.printkey.PrintKey --key "SOFTWARE\\Microsoft\\Windows"
vol -f mem.dmp windows.vadinfo.VadInfo                 # Virtual address descriptors
vol -f mem.dmp windows.hollowprocesses.HollowProcesses # Detect process hollowing
vol -f mem.dmp windows.scheduled_tasks.ScheduledTasks  # Scheduled tasks
vol -f mem.dmp windows.amcache.Amcache                 # Recover Amcache entries
vol -f mem.dmp windows.truecrypt.Passphrase            # Cached TrueCrypt passphrase
vol -f mem.dmp windows.strings.Strings --strings-file strings.txt

# Dump specific file by physical address (vol2)
python2 vol.py -f mem.raw --profile=Win7SP1x86 dumpfiles -Q 0x000000000bbf6158 -D .
# TrueCrypt passphrase (vol2)
python2 vol.py -f mem.raw --profile=Win7SP1x86 truecryptpassphrase
# Clipboard (vol2)
vol2 -f mem.bin --profile=Win7SP1x64 clipboard
```
</details>

<details><summary>Memory Strings Analysis</summary>

```bash
# IPv4 addresses
strings mem.dmp | grep -E "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b"

# Email addresses
strings mem.dmp | grep -oE "\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b"

# PowerShell / cmd artifacts
strings mem.dmp | grep -E "(cmd|powershell|bash)[^\s]+"

# bulk_extractor — extract many artifact types at once
bulk_extractor -o extracted_data/ mem.dmp
# Output: email, URL, domains, credit cards, JSON, etc.
# https://github.com/simsong/bulk_extractor
```
</details>

## 3. Disk Forensics

<details><summary>Linux Disk</summary>

```bash
# Identify partitions
fdisk -l disk.dd
mmls disk.dd          # SleuthKit (more reliable)

# Extract a partition
dd if=disk.dd of=part1.img bs=512 skip=<start> count=<sectors>

# Mount read-only
sudo mount -o loop,ro part1.img /mnt/disk/
# EXT4 dirty journal:
sudo mount -o loop,ro,norecovery part1.img /mnt/disk/

# SleuthKit essentials
fls -r disk.dd          # list files (including deleted)
icat disk.dd <inode>    # extract file by inode
istat disk.dd <inode>   # file metadata / timestamps
fsstat disk.dd          # filesystem info

# File carving
foremost -i disk.img -o carved_output/
scalpel disk.img -o scalpel_output/
binwalk --extract --dd=".*" target.file

# Timeline
log2timeline.py timeline.plaso disk.img
psort.py -o l2tcsv timeline.plaso > timeline.csv
mactime -b bodyfile.txt > timeline.txt
```
</details>

<details><summary>Linux Artifact Locations</summary>

```bash
cat /mnt/etc/passwd              # user accounts
cat /mnt/etc/shadow              # password hashes
cat /mnt/home/*/.bash_history    # bash history
ls  /mnt/home/*/.ssh/            # SSH keys
cat /mnt/etc/crontab             # cron jobs
ls  /mnt/etc/cron.*
ls  /mnt/etc/systemd/system/     # services
ls  /mnt/var/log/
zcat /mnt/var/log/*.gz           # compressed logs

# Search for flags / IOCs
grep -Ri 'flag' /mnt 2>/dev/null
strings -n 8 part1.img | grep -i flag
find /mnt -name "*.sh" -newer /mnt/etc/passwd
```
</details>

<details><summary>LUKS Encrypted Disk</summary>

```bash
# Convert VDI to RAW (VirtualBox)
VBoxManage.exe clonehd disk.vdi disk.raw --format RAW

# Dump LUKS info
sudo cryptsetup luksDump disk.raw

# Find AES key in memory
findaes mem.raw

# Convert hex masterkey and add to LUKS
echo "<hex_key>" | xxd -r -p > masterkey.key
cryptsetup luksAddKey --master-key-file=masterkey.key disk.raw

# Open and mount
sudo cryptsetup luksOpen disk.raw decrypted
mkdir /mnt/decrypted
sudo mount /dev/mapper/decrypted /mnt/decrypted
```
</details>

<details><summary>BitLocker</summary>

```bash
# Extract hash
bitlocker2john -i bitlocker.dd > bitlocker.txt

# Crack with hashcat
hashcat -m 22100 -a 0 bitlocker.txt /usr/share/wordlists/rockyou.txt -w 3

# Mount with dislocker
mkdir dis mounted
sudo dislocker bitlocker.dd -u<password> dis
sudo mount -o loop dis/dislocker-file mounted
```
</details>

## 4. Windows Artifacts & Eric Zimmerman Tools

> Full EZ Tools suite: [ericzimmerman.github.io](https://ericzimmerman.github.io/#!index.md)

<details><summary>Prefetch — PECmd</summary>

```powershell
# Parse all prefetch files → CSV
.\PECmd.exe -d "C:\Windows\Prefetch" --csv .\Results --csvf prefetch.csv

# Parse single file
.\PECmd.exe -f "C:\Windows\Prefetch\CALC.EXE-3FBEF7FD.pf"

# Output JSON
.\PECmd.exe -f file.pf --json C:\output --jsonpretty

# Using keyword
.\PECmd.exe -d "C:\Windows\Prefetch" -k "powershell,cmd"
```

**Prefetch tells you:** executable name, last run time, run count, loaded files/directories
</details>

<details><summary>MFT — MFTECmd</summary>

**Core functions & capabilities**
- **Artifact parsing:** reads core NTFS artifacts including `$MFT`, `$J` (USN Journal), `$LogFile`, `$Boot`, and `$SDS` (Security Descriptors).
- **Output formats:** CSV, JSON, and bodyfile formats for spreadsheet analysis and timeline tools like Timeline Explorer.
- **Forensic value:** extracts file/directory names, allocation states, parent-directory paths, resident/non-resident data, and dual timestamps (`$Standard_Information` vs `$File_Name`) to spot timestomping, deleted records, and alternate data streams.
- **Advanced options:** Volume Shadow Copy (`-vss`) processing and duplicate dedup (`-dedupe`).

> `$MFT` gives a snapshot of the current state of the file system, while `$J` gives a historical log of recent file activity.

```powershell
# Parse $MFT → CSV
.\MFTECmd.exe -f '$MFT' --csv .\Results --csvf mft.csv

# Parse USN Journal ($J)
.\MFTECmd.exe -f 'C:\$Extend\$J' --csv .\Results --csvf usnjournal.csv

# Then open in Timeline Explorer
```

**MFT offset calculation:** `Entry Number × 1024 = offset in bytes` → convert to HEX → search in hex editor. The objective is to determine the offset of the stager file, for example.

> 📸 *Screenshot: hex-editor view of an MFT offset calculation — add from your notes (the original Notion image link had already expired by the time this page was built).*
</details>

<details><summary>Event Logs — EvtxECmd</summary>

```powershell
# Single file → CSV
.\EvtxECmd.exe -f Security.evtx --csv .\out --csvf security.csv

# Single file → JSON
.\EvtxECmd.exe -f Security.evtx --json C:\out

# Include only specific event IDs
.\EvtxECmd.exe -f Security.evtx --csv .\out --csvf out.csv --inc 4624,4625,4688
```
</details>

<details><summary>ShellBags — SBECmd</summary>

**SBECmd** is a command-line utility by Eric Zimmerman used to parse Windows ShellBags and export folder browsing history, directory structures, and interaction timestamps.

- **Reconstructs user activity:** parses `NTUSER.DAT` and `USRCLASS.DAT` to reveal folder paths accessed by a user.
- **Recovers deleted evidence:** retains records of directories, removable USB drives, and network shares even after deletion/disconnection.
- **Exports to CSV** for timeline analysis in tools like Timeline Explorer.

```powershell
.\SBECmd.exe -d "C:\Users\User\AppData\Local\Microsoft\Windows" --csv .\Results --csvf shellbags.csv
```

**ShellBags reveal:** folder access history (even deleted folders), timestamps.
</details>

<details><summary>SQLite Databases — SQLECmd</summary>

```powershell
# Browser history (Chrome/Edge/Firefox)
.\SQLECmd.exe -f "History" --csv C:\out

# Hunt mode — auto-identify all SQLite files
.\SQLECmd.exe -d "C:\Users" --hunt --csv C:\out

# Supported maps: Chrome history, Edge, Firefox, Dropbox, Google Drive,
# Sticky Notes, Windows Notifications (WPN), SRUM, Photos, etc.
```

**Windows Notifications DB:** `C:\Users\<user>\AppData\Local\Microsoft\Windows\Notifications\wpndatabase.db`
</details>

<details><summary>Other EZ Tools</summary>

<table>
<thead><tr><th>Tool</th><th>Artifact</th><th>Utility</th></tr></thead>
<tbody>
<tr><td><strong>LECmd</strong></td><td>LNK files</td><td>Parses shortcut files to show the target path, timestamps (created/modified/accessed), volume serial, drive type, and machine ID. Proves a file or folder was opened, even if later deleted or on a USB/network share.</td></tr>
<tr><td><strong>JLECmd</strong></td><td>Jump Lists</td><td>Parses AutomaticDestinations (and CustomDestinations) to show recently/frequently opened files per application, with timestamps and access counts.</td></tr>
<tr><td><strong>RECmd / Registry Explorer</strong></td><td>Registry hives</td><td>Batch-parses hives (NTUSER.DAT, SYSTEM, SOFTWARE…). Finds persistence keys, UserAssist, RecentDocs, USB history, ShellBags. Registry Explorer is the GUI version.</td></tr>
<tr><td><strong>AmcacheParser</strong></td><td>Amcache.hve</td><td>Evidence of program execution/installation: file paths, first-run times, SHA1 hashes (useful for VirusTotal). Also lists connected devices/drivers.</td></tr>
<tr><td><strong>AppCompatCacheParser</strong></td><td>ShimCache</td><td>Parses SYSTEM hive for executables that existed/were touched, with last-modified timestamps. Shows presence/possible execution, not definitive execution.</td></tr>
<tr><td><strong>SrumECmd</strong></td><td>SRUM (SRUDB.dat)</td><td>Per-application resource usage over ~30–60 days: network bytes, CPU time, which user ran it. Great for data-exfil proof and execution history of deleted tools. `-r SYSTEM` resolves network/interface names.</td></tr>
<tr><td><strong>WxTCmd</strong></td><td>Windows Timeline</td><td>Parses ActivitiesCache.db: apps used, files opened, URLs visited, focus time, clipboard data.</td></tr>
<tr><td><strong>VSCMount</strong></td><td>Volume Shadow Copies</td><td>Mounts shadow copies so you can access older file versions and compare system states over time.</td></tr>
<tr><td><strong>bstrings</strong></td><td>Any binary/image</td><td>Fast string extraction with regex search, offsets, Unicode/ASCII support.</td></tr>
</tbody>
</table>

```powershell
# LNK Files — LECmd
.\LECmd.exe -f file.lnk
.\LECmd.exe -d "C:\Users\User\AppData\Roaming\Microsoft\Windows\Recent" --csv .\out

# Jump Lists — JLECmd
.\JLECmd.exe -d "C:\Users\User\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations" --csv .\out

# Registry — RECmd / RegistryExplorer
.\RECmd.exe -f NTUSER.DAT --csv .\out

# Amcache — AmcacheParser
.\AmcacheParser.exe -f Amcache.hve --csv .\out

# ShimCache (AppCompatCache) — AppCompatCacheParser
.\AppCompatCacheParser.exe -f SYSTEM --csv .\out

# SRUM — SrumECmd
.\SrumECmd.exe -f SRUDB.dat -r SYSTEM --csv .\out

# Windows Timeline (ActivitiesCache.db) — WxTCmd
.\WxTCmd.exe -f ActivitiesCache.db --csv .\out

# Volume Shadow Copy mount — VSCMount
.\VSCMount.exe --dl C --mp C:\VSC_Mount

# Bulk strings — bstrings
.\bstrings.exe -f image.dd --csv .\out
```
</details>

<details><summary>Registry Forensics</summary>

```text
Key hives:
SAM      → user accounts, password hashes (with SYSTEM)
SECURITY → LSA secrets, SIDs
SYSTEM   → computer name, timezone, services, USB devices
SOFTWARE → installed software, run keys, recent docs
NTUSER.DAT → per-user settings, recent files, typed URLs
```

```powershell
# Dump hashes from SAM + SYSTEM
impacket-secretsdump -sam SAM -system SYSTEM LOCAL

# Key locations in Registry Explorer:
# Hostname:     SYSTEM\CurrentControlSet\Control\ComputerName\ComputerName
# IP Config:    SYSTEM\ControlSet001\Services\Tcpip\Parameters\Interfaces
# Timezone:     SYSTEM\CurrentControlSet\Control\TimeZoneInformation
# LSA RunAsPPL: SYSTEM\CurrentControlSet\Control\Lsa\RunAsPPL
# SID:          SECURITY\Policy\Accounts
# USB devices:  SYSTEM\CurrentControlSet\Enum\USBSTOR
# Run keys:     SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```
</details>

<details><summary>Windows Key Artifact Locations</summary>

```text
Prefetch:      C:\Windows\Prefetch\*.pf
$MFT:          C:\
$Extend\$J:   C:\$Extend\$J        (USN Journal)
Event Logs:    C:\Windows\System32\winevt\Logs\*.evtx
Amcache:       C:\Windows\AppCompat\Programs\Amcache.hve
ShimCache:     SYSTEM hive → AppCompatCache
SRUM:          C:\Windows\System32\sru\SRUDB.dat
LNK files:     C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Recent\
Jump Lists:    C:\Users\<user>\AppData\Roaming\Microsoft\Windows\Recent\AutomaticDestinations\
ShellBags:     NTUSER.DAT → Software\Microsoft\Windows\Shell\Bags
Browser DB:    C:\Users\<user>\AppData\Local\<Browser>\User Data\Default\History
WPN DB:        C:\Users\<user>\AppData\Local\Microsoft\Windows\Notifications\wpndatabase.db
PSReadline:    C:\Users\<user>\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
Recycle Bin:   C:\$Recycle.Bin\
Timeline:      C:\Users\<user>\AppData\Local\ConnectedDevicesPlatform\L.<user>\ActivitiesCache.db
```

**NTFS special files explained:**
- `$MFT` — Master File Table: metadata for every file (name, timestamps, permissions, size)
- `$Extend\$J` — USN Journal: tracks every file change on the volume
- `$LogFile` — NTFS transaction log (crash recovery)
- `$Boot` — boot sector
- `$Secure_$SDS` — security descriptors (ACLs)
</details>

## 5. Log Analysis

<details><summary>Chainsaw (Windows Event Logs)</summary>

```bash
# Hunt with Sigma rules
chainsaw hunt *.evtx \
  --sigma /opt/chainsaw/sigma \
  --mapping /opt/chainsaw/mappings/sigma-event-logs-all.yml

# Search for specific EventID
chainsaw search 4688 *.evtx

# Search for string
chainsaw search cmd.exe *.evtx

# Filter by EventID in Sigma format
chainsaw search -t 'Event.System.EventID: =1' Sysmon.evtx --json | jq -r '.[].Event.EventData.CommandLine'

# Dump to JSON / JSONL
chainsaw dump --json  *.evtx > events.json
chainsaw dump --jsonl *.evtx > events.jsonl

# Dump $MFT
chainsaw dump '$MFT' --json > mft.json
```
</details>

<details><summary>jq Recipes for events.json / events.jsonl</summary>

```bash
# All EventIDs with counts (System channel)
cat events.json | jq '.[].Event | select(.System.Channel == "System") | .System.EventID' | sort | uniq -c | awk '{print $2":"$1}' | sort -n

# Filter by EventID
cat events.json | jq '.[].Event | select(.System.EventID == 7036)'

# Volume Shadow Copy events
cat events.json | jq '.[].Event | select(.System.EventID == 7036) | select(.EventData.param1 == "Volume Shadow Copy")'

# Find NTDS.dit path
cat events.jsonl | jq '.Event | select(.System.Channel == "Application" and .System.EventID == 325)' -c | grep -i ntds.dit | jq . -r

# VSS correlation ID (for shadow copy operations)
cat events.json | jq '.[].Event.EventData' -c | egrep -i "[a-z0-9]{8}-[a-z0-9]{4}-" | grep -i shadow | jq .VolumeCorrelationId

# Security EventID 4799 — group enum by ntdsutil
cat events.jsonl | jq '.Event | select(.System.Channel == "Security" and .System.EventID == 4799)' -c | grep ntdsutil | jq .EventData.TargetUserName | sort -u

# Running services
cat events.jsonl | jq '.Event | select(.System.Channel == "System" and .System.EventID == 7036 and .EventData.param2 == "running") | .EventData.param1'

# Application events for NTDS dump path
cat events.jsonl | jq '.Event | select(.System.Channel == "Application")' -c | grep -i ntds.dit | grep dump_tmp | jq . | less -S

# MFT — search for specific file
cat mft.json | jq .[] -c | grep -i ntds.dit | jq .
```
</details>

<details><summary>auth.log & wtmp (Linux SSH Forensics)</summary>

```bash
# View wtmp (login history)
utmpdump /var/log/wtmp

# Count log sources
cat auth.log | cut -d' ' -f 6 | cut -d'[' -f1 | sort | uniq -c | sort -nr

# SSH failures by username
cat auth.log | grep Failed | cut -d: -f4 | cut -d' ' -f5- | rev | cut -d' ' -f6- | rev | sort | uniq -c | sort -nr

# Successful SSH logins
cat auth.log | grep Accepted

# Session duration from wtmp timestamps
utmpdump wtmp | grep <username>

# User creation events
cat auth.log | grep -E 'useradd|usermod|groupadd'

# Sudo commands
cat auth.log | grep sudo | grep COMMAND
```

**Format:** `<Timestamp> <Hostname> <Service>[<PID>]: <Message>`
**wtmp columns:** Event Type | PID | Terminal | User | Host | IP | Timestamp
</details>

## 6. Important Windows Event IDs

<details><summary>Security Events</summary>

```text
4624  Successful logon
4625  Failed logon
4634  Logoff
4648  Explicit credentials used (RunAs)
4656  Object handle requested
4663  Object access attempt
4688  New process created (Windows 10)
4698  Scheduled task created
4699  Scheduled task deleted
4702  Scheduled task updated
4720  User account created
4722  User account enabled
4724  Password reset attempt
4728  Member added to security-enabled global group
4732  Member added to security-enabled local group
4768  Kerberos TGT requested
4769  Kerberos service ticket requested
4771  Kerberos pre-auth failed (brute force indicator)
4776  NTLM authentication
4798  User local group membership enumerated
4799  Security-enabled local group membership enumerated
```
</details>

<details><summary>PowerShell Events</summary>

```text
4103  Executing Pipeline (Module Logging)
4104  Script Block Logging — full script content
800   Pipeline Execution Details
```
</details>

<details><summary>Sysmon Events (ID 1–25)</summary>

```text
1   Process creation
2   File creation time changed (timestomping!)
3   Network connection
5   Process terminated
6   Driver loaded
7   Image (DLL) loaded
8   CreateRemoteThread
10  ProcessAccess (credential dumping)
11  FileCreate
12  RegistryEvent (create/delete)
13  RegistryEvent (value set)
14  RegistryEvent (rename)
15  FileCreateStreamHash (ADS)
17  PipeEvent created
18  PipeEvent connected
22  DNSEvent (DNS query)
23  FileDelete
25  ProcessTampering
```
</details>

<details><summary>System Events</summary>

```text
7034  Service crashed
7036  Service started/stopped  ← VSS, NTDS dumping
7040  Service start type changed
7045  New service installed
```
</details>

<details><summary>Application Events (NTDS dump detection)</summary>

```text
325   NTDS — database engine attached a database
326   NTDS — database engine detached a database
327   NTDS — database engine started
```
</details>

## 7. Network Forensics

<details><summary>Wireshark Filters</summary>

```text
# Port scans (SYN-ACK replies from target)
ip.addr == <target_ip> && tcp.flags.syn==1 && tcp.flags.ack==1

# HTTP requests only
http && http.request.method == GET
http && http.request.method == POST

# TLS/SSL traffic
tls || ssl

# DNS queries
dns.flags.response == 0

# LDAP
ldap

# MySQL queries
mysql.command == 3

# SMB
smb2

# Traffic to/from specific IP
ip.src == 192.168.1.1 && ip.dst == 10.0.0.1

# URIs (sorted unique)
tshark -r cap.pcap -Y 'http.request' -T fields -e http.request.uri | sort -u
```
</details>

<details><summary>tshark Commands</summary>

```bash
# Extract MySQL queries
tshark -r capture.pcap -Y "mysql.command==3" -T fields -e mysql.query

# Extract HTTP URIs
tshark -2 -r capture.pcap -Y "http.request" -T fields -e http.request.uri | sort -u

# Extract DNS queries (with source IP)
tshark -r capture.pcap -n -T fields -e ip.src -e dns.qry.name -Y "dns.flags.response == 0"

# Extract LDAP
tshark -r capture.pcap -Y "ldap" -O ldap > ldap_output.txt

# Extract TTL fields
tshark -r capture.pcap -Y "ip.src == 192.168.1.1 && tcp.port == 8080" -T fields -e ip.ttl

# Filter traffic and write new pcap
tcpdump -nr traffic.pcap port 53 -w dns.pcap

# SSL dump with key
ssldump -r capture.pcap -k server.key -d > output.txt
```
</details>

<details><summary>DNS Exfiltration Detection & Decode</summary>

```bash
# Extract DNS-only traffic
tcpdump -nr traffic.pcap port 53 -w dns.pcap
```

```python
# decode_dns_exfil.py — extract hex-encoded data from DNS queries
from scapy.all import *

r = rdpcap('dns.pcap')
with open("output.txt", "w") as myfile:
    c = b""
    for packet in r:
        if packet.haslayer(DNSQR):
            a = packet[DNSQR].qname
            # Adjust slice [18:] to skip subdomain prefix length
            no9 = a[18:]
            b = no9.replace(b'microsofto365.com.', b'')
            if not b or b == c:
                continue
            c = b
            try:
                hex_chars = ''.join(ch for ch in b.decode(errors='ignore')
                                    if ch in '0123456789abcdefABCDEF')
                ascii_str = bytes.fromhex(hex_chars).decode('utf-8', errors='ignore')
                myfile.write(ascii_str + '\n')
            except ValueError as e:
                print(f"Error: {e}")
```

**Tip:** use `ip.src == <attacker_ip>` + an LDAP filter to find LDAP queries; check the `badPwdCount` attribute for brute-force evidence.
</details>

<details><summary>Network Steganography</summary>

```bash
# TTL-based steganography
tshark -r capture.pcap -T fields -e ip.ttl | sort | uniq -c
# Tool: https://github.com/chrispetrou/NETsteg

# Endpoint stats trick in Wireshark:
# Statistics > Endpoints > sort by "RX Bytes"
# High RX Bytes = IP that sent most data = likely exfiltration source
```
</details>

## 8. Malware Analysis

<details><summary>Static Analysis</summary>

```bash
# File type identification
file malware.exe
die malware.exe           # Detect-It-Easy
binwalk malware.bin       # embedded files
strings -n 8 malware.exe  # printable strings (min 8 chars)
exiftool malware.doc      # metadata

# PE analysis
readelf -a malware.elf
objdump -d malware.exe    # disassemble
pefile malware.exe        # Python pefile library

# Shared library dependencies
ldd /bin/suspicious_binary

# Check ELF sections
readelf -a *.elf
```
</details>

<details><summary>Office Document Malware</summary>

```bash
# OLE / VBA macro analysis
olevba malicious.doc > output.txt
olevba malicious.xls  # oBfsC4t10n-style
olevba malicious.xlsm

# Extract embedded objects
oleobj malicious.doc

# Binwalk extract from docx
binwalk --extract --dd=".*" suspicious.docx

# PCAP: sniff URL from VBA → wget/curl → follow tcp stream

# Deobfuscation technique (batch .bat files):
# Prefix all action lines with 'echo' → cmd resolves variables before execution
# Or use Event ID 4688 to see fully resolved command line
```
</details>

<details><summary>Python Executables</summary>

```bash
# Step 1: Extract PyInstaller archive
python pyinstxtractor.py suspicious_binary
# https://github.com/extremecoders-re/pyinstxtractor

# Step 2: Decompile .pyc bytecode
uncompyle6 main.pyc > main.py
# https://github.com/rocky/python-uncompyle6
# Note: match Python version used to build executable
```
</details>

<details><summary>Password / Archive Cracking</summary>

```bash
# KeePass
keepass2john pwdb.kdbx > hash.txt
hashcat -m 13400 hash.txt /usr/share/wordlists/rockyou.txt
john hash.txt --wordlist=rockyou.txt

# ZIP with known plaintext attack (ZipCrypto)
zipinfo archive.zip           # identify files
bkcrack -C archive.zip -c known_entry.svg -p known_plaintext.svg
# → recovers 3 internal keys
bkcrack -C archive.zip -k key1 key2 key3 -D decrypted.zip
unzip decrypted.zip

# General hashcat modes
hashcat -m 22100  # BitLocker
hashcat -m 13400  # KeePass
hashcat -m 1000   # NTLM
hashcat -m 1800   # sha512crypt (Linux)
hashcat -m 3200   # bcrypt
```
</details>

<details><summary>NTDS.dit / AD Credential Dumping (detection)</summary>

```bash
# Dump SAM+SYSTEM (offline)
impacket-secretsdump -sam SAM -system SYSTEM LOCAL

# Detection artifacts:
# Event ID 325/326/327 in Application log
# Event ID 4799 in Security log with ntdsutil keyword
# VSS creation via Event ID 7036 (Volume Shadow Copy service running)
# ntdsutil in Sysmon Event ID 1 (process creation)
# chainsaw: search for ntdsutil in process events
```
</details>

<details><summary>CyberChef Recipes (Common)</summary>

```text
Base64 decode:           From Base64
Hex decode:              From Hex
URL decode:              URL Decode
Deflate decompress:      Fork → From Base64 → Raw Inflate
XOR decode:              XOR { key: 0xdf, scheme: Standard }
DES decrypt:             DES Decrypt { key, IV }
AES decrypt:             AES Decrypt { key, IV, mode: CFB }
PowerShell encoded:      From Base64 → Decode text (UTF-16LE)
Chained base64+gunzip:   From Base64 → Gunzip

URL: https://gchq.github.io/CyberChef/
```
</details>

## 9. Steganography

<details><summary>Tools & Commands</summary>

```bash
# Image metadata
exiftool image.png

# PNG chunk validation
pngcheck -v image.png

# LSB steganography (images)
zsteg image.png          # detect LSB in PNG/BMP
zsteg -a image.png       # try all methods
stegsolve image.png      # GUI — bit plane viewer

# steghide (JPEG / BMP)
steghide extract -sf image.jpg -p <password>
steghide info image.jpg

# binwalk — hidden files in images
binwalk -e image.png
binwalk --extract --dd=".*" image.png

# Audio steganography
# Audacity → View > Spectrogram view (look for text/images in frequencies)
# Also check: Analyze > Plot Spectrum

# Check for appended data
xxd image.png | tail -20
strings image.png | grep -i flag

# Network steganography (TTL field)
# https://github.com/chrispetrou/NETsteg

# Container steganography comparison
container-diff diff 1.tar 2.tar --type=file
# https://github.com/GoogleContainerTools/container-diff
```
</details>

## 10. File & Email Forensics

<details><summary>OST / PST Files</summary>

```bash
# pff-tools
sudo apt-get install pff-tools
pffexport /path/to/file.ost
# Navigate: Root - Mailbox > IPM_SUBTREE > Inbox

# XstReader (GUI): https://github.com/Dijji/XstReader
```
</details>

<details><summary>PDF Analysis</summary>

```bash
# Check PDF structure
pdfid.py suspicious.pdf

# Extract streams / objects
pdf-parser.py suspicious.pdf
peepdf suspicious.pdf

# Extract embedded files
oleobj suspicious.pdf

# Strings extraction
strings suspicious.pdf | grep -i http
strings suspicious.pdf | grep -i javascript
```
</details>

<details><summary>Browser Forensics</summary>

```bash
# Chrome / Edge history (SQLite)
sqlite3 'History' "SELECT url, title, visit_count, last_visit_time FROM urls ORDER BY last_visit_time DESC;"

# Hindsight — Chrome/Chromium artifact parser
python hindsight.py -i 'User Data/Default' -o report
# https://github.com/obsidianforensics/hindsight

# SQLECmd covers: Chrome, Edge, Firefox downloads/history/cookies/searches

# BrowsingHistoryView (Windows GUI)
# Options > Advanced Options > Show time in GMT
# https://www.nirsoft.net/utils/browsing_history_view.html
```
</details>

<details><summary>SQLite — Manual Forensics</summary>

```sql
-- Online viewer: https://sqliteviewer.app/
-- Schema inspection
.tables
.schema table_name

-- phpBB example (Bumblebee sherlock)
SELECT user_id, username, user_email, user_ip FROM phpbb_users;
SELECT log_id, phpbb_users.username, log_ip,
  datetime(log_time, 'unixepoch'), log_operation
FROM phpbb_log
INNER JOIN phpbb_users ON phpbb_log.user_id = phpbb_users.user_id;

-- LDAP credentials in phpBB config
SELECT * FROM phpbb_config WHERE config_name LIKE 'ldap_%';
```
</details>

## 11. Container & Docker Forensics

```bash
# Pull and inspect Docker image
sudo docker pull <image>
sudo docker history --no-trunc <image>   # see all layers + commands
sudo docker image ls

# Save image as tar for offline analysis
sudo docker save <image_id> -o image.tar
tar xvf image.tar

# Compare two image tars
container-diff diff 1.tar 2.tar --type=file
# https://github.com/GoogleContainerTools/container-diff

# AWS CloudTrail → SIEM
python3 aws-cloudtrail2sof-elk.py -r <account_id>/ -w output.json -f
```

## 12. Crypto & Encoding Quick Reference

```text
Base64:     echo 'string' | base64 -d
Hex:        echo 'hex' | xxd -r -p
Rot13:      tr 'A-Za-z' 'N-ZA-Mn-za-m'
URL:        python3 -c "import urllib.parse; print(urllib.parse.unquote('...'))"
UTF-16LE:   echo 'base64' | base64 -d | iconv -f utf-16le -t utf-8

# Null bytes removal (common in memory dumps)
strings -el file.bin   # 16-bit little-endian strings
python3 -c "data=open('file','rb').read(); print(data.replace(b'\x00',b'').decode())"

# Base64 reassembly from chunked data
# See: Endpoint / MySQL challenge script above
```

## 13. Threat Intelligence Resources

<table>
<thead><tr><th>Tool</th><th>URL</th><th>Use case</th></tr></thead>
<tbody>
<tr><td>VirusTotal</td><td><a href="https://virustotal.com">virustotal.com</a></td><td>Hash/URL/file analysis, malware family</td></tr>
<tr><td>URLscan.io</td><td><a href="https://urlscan.io">urlscan.io</a></td><td>URL behavior analysis</td></tr>
<tr><td>AnyRun</td><td><a href="https://any.run">any.run</a></td><td>Interactive malware sandbox</td></tr>
<tr><td>JoeSandbox</td><td><a href="https://joesandbox.com">joesandbox.com</a></td><td>Deep malware analysis</td></tr>
<tr><td>MalwareBazaar</td><td><a href="https://bazaar.abuse.ch">bazaar.abuse.ch</a></td><td>Malware sample database</td></tr>
<tr><td>Unfurl</td><td><a href="https://dfir.blog/unfurl/">dfir.blog/unfurl</a></td><td>Decode/parse URLs</td></tr>
<tr><td>Shodan</td><td><a href="https://shodan.io">shodan.io</a></td><td>Internet-facing device search</td></tr>
<tr><td>GreyNoise</td><td><a href="https://greynoise.io">greynoise.io</a></td><td>Distinguish scanners from targeted attacks</td></tr>
<tr><td>Unit42 IoCs</td><td><a href="https://github.com/PaloAltoNetworks/Unit42-timely-threat-intel">GitHub</a></td><td>Timely IoC feeds</td></tr>
<tr><td>MITRE ATT&CK</td><td><a href="https://attack.mitre.org">attack.mitre.org</a></td><td>TTP mapping</td></tr>
<tr><td>LOLBAS</td><td><a href="https://lolbas-project.github.io">lolbas-project.github.io</a></td><td>Living-off-the-land binaries</td></tr>
<tr><td>GTFOBins</td><td><a href="https://gtfobins.github.io">gtfobins.github.io</a></td><td>Linux privilege escalation via binaries</td></tr>
</tbody>
</table>

## 14. References & Cheat Sheets

```text
Vol3 cheat sheet:        https://hacktivity.fr/volatility-3-cheatsheet/
Vol3 cheat sheet (alt):  https://blog.onfvp.com/post/volatility-cheatsheet
Vol3 symbol files:       https://github.com/Abyss-W4tcher/volatility3-symbols
EZ Tools:                https://ericzimmerman.github.io/#!index.md
SANS Windows Forensics:  https://www.sans.org/posters/windows-forensics-evidence-of/
SANS Memory Forensics:   https://www.sans.org/posters/hunt-evil/
CyberChef:               https://gchq.github.io/CyberChef/
BrowsingHistoryView:     https://www.nirsoft.net/utils/browsing_history_view.html
pyinstxtractor:          https://github.com/extremecoders-re/pyinstxtractor
python-uncompyle6:       https://github.com/rocky/python-uncompyle6
bulk_extractor:          https://github.com/simsong/bulk_extractor
container-diff:          https://github.com/GoogleContainerTools/container-diff
NETsteg:                 https://github.com/chrispetrou/NETsteg
Hindsight:               https://github.com/obsidianforensics/hindsight
XstReader:               https://github.com/Dijji/XstReader
Abyss symbols:           https://github.com/Abyss-W4tcher/volatility3-symbols
```

## 15. CTF Tips & Tricks

<details><summary>Common CTF Forensics Workflow</summary>

```text
1.  file *             → identify all file types
2.  strings file       → quick flag grep
3.  binwalk file       → hidden/embedded files
4.  exiftool file      → metadata
5.  xxd file | head    → magic bytes / hex inspection
6.  tcpdump / tshark   → if .pcap
7.  volatility         → if memory dump
8.  unzip / tar / 7z   → if archive (check zipinfo first)
9.  CyberChef          → decode encoded data
10. VirusTotal hash    → if suspicious binary
```
</details>

<details><summary>Magic Bytes Reference</summary>

```text
89 50 4E 47  → PNG
FF D8 FF     → JPEG
50 4B 03 04  → ZIP / docx / xlsx / pptx
7F 45 4C 46  → ELF
4D 5A        → PE / EXE (MZ header)
25 50 44 46  → PDF
52 61 72 21  → RAR
1F 8B        → GZIP
42 5A 68     → BZIP2
4C 75 61 53  → Lua bytecode
```
</details>

<details><summary>PowerShell Deobfuscation</summary>

```powershell
# Method 1 — echo trick (safest, in VM)
# Replace all action lines with 'echo <line>'
# cmd.exe resolves %variables% before executing → prints fully deobfuscated command

# Method 2 — Event ID 4688 (Security log)
# Windows logs the FULLY RESOLVED command line in process creation events
# No manual decoding needed

# Method 3 — remove obfuscation token with script
# Example: remove 'd2FudGVkCg' noise token (base64 decoded = 'wanted\n')
text.replace('d2FudGVkCg', '')

# Decode PS encoded command
$enc = 'base64here'
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($enc))
```
</details>

<details><summary>Useful One-Liners</summary>

```bash
# Find all hidden files
find . -name '.*' 2>/dev/null

# SHA256 of file for VirusTotal lookup
sha256sum suspicious.exe

# Find SUID binaries (Linux privilege esc)
find / -perm -4000 -type f 2>/dev/null

# Decode base64 file
base64 -d encoded.txt > decoded.bin

# Python base64 + zlib (CyberChef Raw Inflate equivalent)
import base64, zlib
print(zlib.decompress(base64.b64decode(data), -15).decode())

# grep for flag format in pcap strings
strings capture.pcap | grep -i 'HTB{\|CTF{\|FLAG{'

# Extract all URLs from strings output
strings file | grep -oE 'https?://[^]+'

# Quick IIS log analysis
grep -v '#' u_ex230712.log | awk '{print $9" "$5}' | sort | uniq -c | grep aspx | sort
grep -v '#' u_ex230712.log | awk '{print $10}' | sort | uniq -c | sort -rn
```
</details>
