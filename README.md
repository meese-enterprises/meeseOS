# aaronmeese.com

[![DeepSource](https://deepsource.io/gh/ajmeese7/aaronmeese.com.svg/?label=active+issues&show_trend=true&token=CRr7brFwKTb7yUJpTlVeUpjA)](https://deepsource.io/gh/ajmeese7/aaronmeese.com/?ref=repository-badge)
[![DeepSource](https://deepsource.io/gh/ajmeese7/aaronmeese.com.svg/?label=resolved+issues&show_trend=true&token=CRr7brFwKTb7yUJpTlVeUpjA)](https://deepsource.io/gh/ajmeese7/aaronmeese.com/?ref=repository-badge)

This redesign of my website would not be possible without the _incredible_ work by [Anders Evenrud](https://github.com/andersevenrud) on [OS.js](https://github.com/os-js/OS.js). As you can see in the majority of the files, this monorepo is a modified amalgamation of the OS.js source code.

## Setup

- `cp apps/old-site/.env.template apps/old-site/.env`
  - Enter the appropriate information here
- `cp apps/terminal/scripts/.env.template apps/terminal/scripts/.env`
  - Enter the appropriate information here
- `bash ./setup.sh`

## Deploy

- `bash ./deploy.sh`
  - Can use `--no-reset` for local deployment testing, so you don't lose your changes
- Running `pm2 monit` will allow you to track when the server has finished initializing

## Troubleshooting

If you encounter the error `EADDRINUSE, Address already in use` on Windows, run `taskkill /F /IM node.exe`.

To see if your process is still runninng, run `pm2 list`.

To monitor the logs from your process, run `pm2 monit`.

To see if the port is already in use, run `netstat -tulpn | grep LISTEN`. If you need to free the port, you can likely run `sudo pkill -9 node`. Alternatively, you can run the command `sudo fuser -k 8000/tcp` until there is no output, then the port will be guaranteed to be free.

# TODO

- Caching for "rush-project.json"
  - "Project does not have a rush-project.json configuration file, or one provided by a rig, so it does not support caching."
  - "rush build --verbose"
