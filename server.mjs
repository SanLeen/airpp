/**
 * Created by SanLeen on 2021/7/11
 * @reference https://github.com/suwu150/node-http-server
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { childProcess, spawn } = require('child_process');

/** @type {{exec(code:string):void}} */
let nativeHandler;

switch (process.platform) {
    case 'win32':
        const ps1 = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', path.resolve('./lib/windows/drive.ps1')]);
        ps1.stderr.on('error', data => console.error(`native error: ${data}`));
        ps1.on('close', code => console.log(`native close: ${code}`));
        nativeHandler = {
            exec(code) {
                console.log(`[${new Date().toLocaleString()}] ${code}`);
                ps1.stdin.write(`${code}\n`);
            }
        }
        break;
    case 'darwin':
        nativeHandler = {
            exec(code) {
                console.log(`[${new Date().toLocaleString()}] ${code}`);
                childProcess.exec(`${path.resolve('./lib/darwin/mkey')} ${code}`);
            }
        }
        break;
    default:
        nativeHandler = {
            exec() {
                console.warn(`unsupported platform`);
            }
        }
        break;
}

let port = 8098;

const server = http.createServer((request, response) => {
    const pathname = request.url;
    if (pathname.startsWith('/api')) { // request API
        const headers = { 'Content-Type': 'application/json' };
        const url = new URL('http://localhost' + pathname);
        const body = { msg: undefined };
        if (url.searchParams.has('code')) {
            const code = url.searchParams.get('code');
            nativeHandler.exec(code);
            response.writeHead(200, headers);
            body.msg = '🤖️' + url.searchParams.get('code');
        } else {
            response.writeHead(404, headers);
        }
        response.write(JSON.stringify(body));
        response.end();
    } else { // request web resource
        let filePath = pathname;
        if (pathname === '/') {
            filePath = '/index.html';
        }
        filePath = path.join(path.resolve('./html' + filePath));

        let headers = { 'Content-Type': 'text/html' };
        if (filePath.endsWith('.png')) {
            headers = { 'Content-Type': 'image/png' };
        } else if (filePath.endsWith('.css')) {
            headers = { 'Content-Type': 'text/css' };
        } else if (filePath.endsWith('.js')) {
            headers = { 'Content-Type': 'application/x-javascript' }
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                response.writeHead(404, headers);
            } else {
                response.writeHead(200, headers);
                response.write(data.toString());
            }
            response.end();
        });
    }
}).listen(port);

let protocol = 'http://';
console.log(`🎉AirPP running at:`);
const netInfoList = os.networkInterfaces();
for (const netInfoArray of Object.values(netInfoList)) {
    for (const info of netInfoArray) {
        if (info.internal) continue;
        if (info.family === 'IPv4') {
            const url = `${protocol}${info.address}:${server.address().port}`;
            console.log(url);
        }
    }
}