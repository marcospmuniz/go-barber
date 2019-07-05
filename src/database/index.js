import Sequelize from 'sequelize';

import User from '../app/models/User';

import databaseConfig from '../config/database';

// lista de models da aplicação
const models = [User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    // percorre todos os models da aplicação instanciando eles e passando
    // a conexão com o banco de dados como parametro para o init() de cada
    // model registrado na aplicação
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
