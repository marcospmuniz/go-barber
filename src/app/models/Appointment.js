import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    /*
     * Aqui no método init, nós declaramos os parametros do model
     * que podem ser cadastrados pelo nosso app.
     * O campo VIRTUAL, é um campo que nunca será salvo no banco de dados
     * ele serve apenas para pegar e/ou retornar uma informação para o usuário
     * final.
     * O campo virtual "past" vai retornar se o agendamento já passou.
     * O campo virtual "cancelable" vai retornar se o agendamento pode ser
     * cancelado, lembrando que só pode cancelar um agendamento com 2h de
     * antecedencia.
     */
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2));
          },
        },
      },
      {
        sequelize,
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
