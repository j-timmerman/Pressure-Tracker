# Project Setup and Deployment (Linux)

This document covers cloning the project, building the frontend, running it
with PocketBase, and installing it as a systemd service.

Placeholders are written in angle brackets, e.g. `<token>`. Replace the whole
thing, including the brackets. Each section lists its placeholders above the
command or file that uses them.

The server address used in this document is 192.168.40.131 and PocketBase
runs on its default port, 8090. If the server has a different IP, substitute
it wherever that address appears.

Prerequisites: git, Node.js with npm, wget, unzip, ufw, and sudo access.


## 1. Clone the repository

```bash
git clone https://github.com/j-timmerman/Pressure-Tracker.git
cd Pressure-Tracker
```

All remaining commands are run from this project directory unless stated
otherwise.


## 2. Create the .env file

```bash
nano .env
```

Contents of .env:

```txt
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_POCKETBASE_ADMIN_URL=http://127.0.0.1:8090/_/
```

These values are read at build time, so the file must exist before step 4.
If they change later, rebuild the frontend.


## 3. Download PocketBase and open the firewall port

### Download

Download and unpack PocketBase v0.40.5 into the project directory:

```bash
wget https://github.com/pocketbase/pocketbase/releases/download/v0.40.5/pocketbase_0.40.5_linux_amd64.zip
unzip pocketbase_0.40.5_linux_amd64.zip
```

### Firewall

Allow PocketBase's default port (8090) through the firewall:

```bash
sudo ufw allow 8090
sudo ufw reload
```


## 4. Build the frontend and copy it into pb_public

PocketBase serves static files from the pb_public directory next to its
binary.

```bash
npm install
npm run build
mkdir -p pb_public
cp -a dist/. pb_public/
```


## 5. Start PocketBase and create the superuser

### Start

```bash
./pocketbase serve --http=0.0.0.0:8090
```

### Create the superuser

On first start, PocketBase prints a setup link in the terminal for creating
the first superuser. Open it in a browser; if you are on another machine,
replace the host in the link with 192.168.40.131.

Alternatively, create the superuser from a second terminal in the project
directory.

Placeholders:

```txt
<email>     - superuser login email
<password>  - superuser password
```

```bash
./pocketbase superuser create <email> <password>
```


## 6. Verify

```txt
App:    http://192.168.40.131:8090
Admin:  http://192.168.40.131:8090/_/#/login
```

Once both load, stop the foreground process with Ctrl+C before setting up
the service in step 7. Otherwise the service cannot bind to port 8090.


## 7. Run as a systemd service

### Service file

Create the service file:

```bash
sudo nano /etc/systemd/system/pocketbase.service
```

Placeholders:

```txt
<linux-user>   - Linux user that owns the project directory and should
                 run PocketBase
<project-dir>  - absolute path to the project directory (the one that
                 contains the pocketbase binary and pb_public),
                 e.g. /home/<linux-user>/<repository>
```

Example /etc/systemd/system/pocketbase.service:

```txt
[Unit]
Description=PocketBase
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=<linux-user>
WorkingDirectory=<project-dir>
ExecStart=<project-dir>/pocketbase serve --http=0.0.0.0:8090
Restart=on-failure
RestartSec=5
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

### Enable and start

Load, enable at boot, start, and check the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
sudo systemctl status pocketbase --no-pager
```

### Logs

```bash
sudo journalctl -u pocketbase -f
```


## Stopping the service

```bash
sudo systemctl stop pocketbase
```

To start it again:

```bash
sudo systemctl start pocketbase
```


## Updating

Placeholders:

```txt
<project-dir>  - absolute path to the project directory (same as step 7)
```

```bash
cd <project-dir>
git pull --ff-only
npm install
npm run build
mkdir -p pb_public
cp -a dist/. pb_public/
```

Frontend files are served straight from pb_public, so a frontend-only
update needs no restart. If you want to restart anyway:

```bash
sudo systemctl restart pocketbase
```
