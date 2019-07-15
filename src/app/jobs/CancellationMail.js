import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellatioMail {
  get key() {
    return 'CancelationMail'; // chave única deste job.
  }

  async handle({ data }) {
    const { appointment } = data;

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Cancelamento de agendamento',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(parseISO(appointment.date), "dd 'de' MMMM', às' H:mm", { locale: pt }),
      },
    });
  }
}

export default new CancellatioMail();
