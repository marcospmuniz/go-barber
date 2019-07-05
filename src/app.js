import express from 'express';
import routes from './routes';

// importa a classe que instancia todos os models da aplicação
import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

// exporta só o atributo 'server' da classe
// ATENÇÃO!
// Só estou usando 'export default' no lugar de 'module.exports = '
// porque  estou usando a lib sucrase nesse projeto
export default new App().server;
