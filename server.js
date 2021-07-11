/**
 * Created by SanLeen on 2021/7/11
 * @reference https://github.com/suwu150/node-http-server
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const childProcess = require('child_process');

const execMediaKeyCode = code => {
    console.log(`[${new Date().toLocaleString()}] ${code}`);
    childProcess.exec(`${path.resolve('./lib/mkey')} ${code}`);
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
            execMediaKeyCode(code);
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
let host = '127.0.0.1';
const netInfoList = os.networkInterfaces();
Object.keys(netInfoList).forEach(dev => netInfoList[dev].forEach(details => {
    if (details.family === 'IPv4') {
        host = details.address;
    }
}));
const url = `${protocol}${host}:${server.address().port}`;

console.log(`🎉AirPP running at:`);
console.log(url);
childProcess.exec(`echo "${url}" | pbcopy`); // copy url to clipboard