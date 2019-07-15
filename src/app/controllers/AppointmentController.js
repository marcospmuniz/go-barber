import * as Yup from 'yup';
import {
  startOfHour, parseISO, isBefore, subHours, format,
} from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notifications';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider_id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'You can only create appointments with providers',
      });
    }

    if (provider_id === req.userId) {
      return res.status(401).json({
        error: 'You can not create appointments for your self!',
      });
    }

    /**
     * Check for past dates
     */
    // despresa os minutos de "date" e retorna uma data apenas com a hora cheia de date
    const hourStart = startOfHour(parseISO(date));

    // checa se a hourStart está no passado
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted!' });
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Appointment date not available!' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /**
     * Notify provider
     */
    const user = await User.findByPk(req.userId);

    const formatedDate = format(hourStart, "dd 'de' MMMM', às' H:mm", { locale: pt });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formatedDate}h`,
      user: provider_id,
    });

    /**
     * Notify provider via email to
     */
    // const providerInfo = await User.findByPk(provider_id);

    // await Mail.sendMail({
    //   to: `${providerInfo.name} <${providerInfo.email}>`,
    //   subject: 'Novo agendamento criado',
    //   text: 'Você tem um novo agendamento!',
    // });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You can only cancel your own appointments!',
      });
    }

    /**
     * Calculate 2 hours before the appointment date
     */
    const dateWithSub = subHours(appointment.date, 2);

    /**
     * Check if the cancel is being doing in the permiteed range of
     * 2 hours in advance
     */
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments with 2 hours in advance!',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancellationMail.key, { appointment });

    return res.json(appointment);
  }
}

export default new AppointmentController();
