const app = require('./app');
const config = require('./config/database');
const os = require('os');

const PORT = config.port;
const HOST = '0.0.0.0';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesso local:   http://localhost:${PORT}`);
  console.log(`Acesso na rede: http://${localIP}:${PORT}`);
});

module.exports = app;
