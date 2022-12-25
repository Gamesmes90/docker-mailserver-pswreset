# Docker Mailserver Password Reset
This is a small node js application to interface with the setup.sh file of [docker-mailserver](https://github.com/docker-mailserver/docker-mailserver).

It allows the user to change the password without having to go through the server administrator.

## How it works

1. Upon connecting the user will be prompted to add his email address and if it is found in the domain of the docker-mailserver, the application will send a mail with the reset link inside.
2. The user has 5 minutes to reset his password with the link give.
3. When opening the link the user must insert his password in the form
4. If everything went correctly the password should be changed.

## ENV

TOKEN_SECRET: a random string generated by the command
```
openssl rand -hex 64
```

DOMAIN: the domain of the mailserver
PASSWORD: password of the sender
SENDER: sender email address
URL: site url
PORT: port to deploy to (Default: 3005)

## Build
Make sure you have node 18 (nvm recommended)
```
nvm install 18
nvm use 18
```
run npm
```
npm ci
```
Get pkg if you don't have it
```
npm install pkg -g
```
Then run pkg
```
pkg .
```
or use npm with build-linux-arm64 or build-linux-x64
```
npm run build-linux-x64
npm run build-linux-arm64
```

By default, this program must run in the same directory as the setup.sh script and the .env file
