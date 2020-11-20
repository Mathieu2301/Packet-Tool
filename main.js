const sniffer = require('./sniffer');
const fs = require('fs');

const port = (parseInt(process.argv.pop()) || 3030);

const server = require('http').createServer((req, res) => {
  if (!req.url || req.url === '/') req.url = '/index.html';

  fs.readFile(`./dist${req.url}`, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(port, () => console.log(`Listening on port http://localhost:${port}\n\r`));

const io = require('socket.io')(server);

io.on('connect', (socket) => {
  io.emit('current', sniffer.current);

  socket.on('stop', sniffer.stop);

  socket.on('getInterfaces', (cb) => cb(sniffer.getInterfaces()));

  socket.on('setInterceptor', async (ip, filter, cb) => {
    try {
      await sniffer.setInterceptor(ip, filter);
      io.emit('current', sniffer.current);
      cb({ success: true });
    } catch (error) {
      cb({ error: true, message: error.message });
    }
  });
});

sniffer.onMsg((buffer, from, to) => {
  if (io) io.emit('onData', buffer, from, to);
});
