const app = require('./app');
const config = require('./config/database');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
