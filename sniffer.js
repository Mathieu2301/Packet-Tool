const Cap = require('cap').Cap;
const decoders = require('cap').decoders;
const PROTOCOL = decoders.PROTOCOL;
const c = new Cap();

const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(65535);
let linkType = null;

module.exports = {
  current: {
    ip: '',
    filter: '',
    minLen: 60,
    started: false,
  },

  async setInterceptor(ip = '', filter = '', minLen = 60) {
    if (this.current.started) {
      this.current = { ip, filter, minLen, started: false };
      c.close();
      console.log('Stopped sniffing');
      return;
    }

    console.log('Started sniffing');
    
    this.current = { ip, filter, minLen, started: true };
    linkType = c.open(Cap.findDevice(ip), filter, bufSize, buffer);
    c.setMinBytes && c.setMinBytes(0);
  },

  onMsg(cb = (buffer = Buffer.from(), from = '', to = '') => null) {
    c.on('packet', (nbytes) => {
      if (nbytes <= this.current.minLen) return;

      if (linkType !== 'ETHERNET') return;
      let ret = decoders.Ethernet(buffer);

      if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
        ret = decoders.IPV4(buffer, ret.offset);
        
        const source = ret.info.srcaddr, target = ret.info.dstaddr;

        if (ret.info.protocol === PROTOCOL.IP.UDP) {
          ret = decoders.UDP(buffer, ret.offset);

          cb(
            buffer.toString('base64', ret.offset, ret.offset + ret.info.length),
            `${source}:${ret.info.srcport}`,
            `${target}:${ret.info.dstport}`,
          );
        } if (ret.info.protocol === PROTOCOL.IP.TCP) {
          ret = decoders.TCP(buffer, ret.offset);

          cb(
            buffer.toString('base64', ret.offset, ret.offset + (ret.info.totallen - ret.hdrlen)),
            `${source}:${ret.info.srcport}`,
            `${target}:${ret.info.dstport}`,
          );
        } else console.log('Unsupported IPv4 protocol: ' + PROTOCOL.IP[ret.info.protocol]);
      } else console.log('Unsupported Ethertype: ' + PROTOCOL.ETHERNET[ret.info.type]);
    });
  },

  stop() {
    if (!this.current.started) return;
    c.close();
    this.current.started = false;
  },

  getInterfaces() {
    return Cap.deviceList();
  },
};
