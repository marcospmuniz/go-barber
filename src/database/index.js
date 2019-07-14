import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

import databaseConfig from '../config/database';

// lista de models da aplicação
const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    // percorre todos os models da aplicação instanciando eles e passando
    // a conexão com o banco de dados como parametro para o init() de cada
    // model registrado na aplicação. Depois faz a mesma coisa mas agora
    // chamando o método associate() de cada modulo (onde existir) para criar
    // as associações de foreignkey
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect('mongodb://localhost:27017/gobarber', {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

export default new Database();
