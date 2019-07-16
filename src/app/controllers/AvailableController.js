import {
  startOfDay, endOfDay, setHours, setMinutes, setSeconds, format, isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    // garante que a data é númerica convertendo ela para Number
    const searchDate = Number(date);

    const appoiments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    /**
     * Lista de horário disponíveis. Esses valores poderiam ser recuperados
     * de uma tabela no banco de dados, onde o prestador informa os horários
     * que ele vai atender.
     */
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
    ];

    /**
     * Precorre todos os horários disponíveis em schedule e retorna apenas
     * os horário disponíveis para atendimento. Não retorna horário que já
     * passou e nem horário que está reservado
     */
    const available = schedule.map((time) => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(setMinutes(setHours(searchDate, hour), minute), 0);

      /**
       * No available do return está verificado se a hora "value" é maior que
       * agora e se o horário não está sendo usado (reservado) no appointments.
       * Available será TRUE se o horário for maior que agora e não estiver
       * reservado.
       */
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date())
          && !appoiments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
