module.exports = {
  putOnMarket: (model, options) => {
    const { $app, MailerMessage, __hooks } = options;

    const slot = $app.findRecordById('onCallSlots', model.id);
    $app.expandRecord(slot, ['student'], null);
    
    const student = slot.expandedOne('student');
    $app.expandRecord(student, ['user'], null);

    const user = student.expandedOne('user');
    const email = user.get('email');

    let subject = '';
    let html = '';
    if (model.get('isOnMarket')) {
      subject = "Votre garde est maintenant disponible";
      html = `<div>La garde du ${slot.get('start')}/${slot.get('end')} est dispo pour tout le monde 😊</div>`;
    } else {
      subject = "Tu as une nouvelle garde !";
      html = `<div>La garde du ${slot.get('start')}/${slot.get('end')} est à toi 😊</div>`;
    }

    const messageToCurrentSlotStudent = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{
        address: email,
      }],
      subject,
      html,
    });

    const oldStudentId = model.original().get("student");
    let messageToOldSlotStudent;
    if (oldStudentId !== student.id && !model.get('isOnMarket')) {
      const oldStudent = $app.findRecordById('students', oldStudentId);
      $app.expandRecord(oldStudent, ['user'], null);
      const oldUser = oldStudent.expandedOne('user');
      const oldStudentEmail = oldUser.get('email');

      messageToOldSlotStudent = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: $app.settings().meta.senderName,
        },
        to: [{
          address: oldStudentEmail,
        }],
        subject: "Votre garde a bien été récupérée !",
        html: `<div>La garde du ${slot.get('start')}/${slot.get('end')} n'est plus pour toi 😊</div>`,
      });
    }

    let messageToAllStudents;
    if (model.get('isOnMarket')) {
      const dbRead = require(`${__hooks}/helpers/db-read.js`);
      const students = dbRead.students({ $app });
      const studentEmails = students.reduce((prev, stud) => {
        if (student.id !== stud.id) {
          $app.expandRecord(stud, ['user'], null);
          const oldUser = stud.expandedOne('user');
          prev.push({ address: oldUser.get('email') });
        }
        return prev;
      }, [])

      messageToAllStudents = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name: $app.settings().meta.senderName,
        },
        to: studentEmails,
        subject: "Nouvelle garde dispo !",
        html: `<div>La garde du ${slot.get('start')}/${slot.get('end')} est disponible 😊</div>`,
      });
    }

    try {
      const DEV_SEND_EMAIL = process.env['DEV_SEND_EMAIL']

      if (DEV_SEND_EMAIL === 'true') {
        $app.newMailClient().send(messageToCurrentSlotStudent);
        if (messageToOldSlotStudent) $app.newMailClient().send(messageToOldSlotStudent);
        // if (messageToAllStudents) $app.newMailClient().send(messageToAllStudents);
      }
    } catch (error) {
      console.error(error);
    }
  },
  putOnTransfer: (model, options) => {
    const { $app, MailerMessage } = options;

    const slot = $app.findRecordById('onCallSlots', model.id);

    const onTransferSlots = $app.findFirstRecordByFilter('onTransferSlots', "slot = {:slot}", { slot: slot.id });
    $app.expandRecord(onTransferSlots, ['from', 'to'], null);

    const fromStudent = onTransferSlots.expandedOne('from');
    const toStudent = onTransferSlots.expandedOne('to');

    $app.expandRecord(fromStudent, ['user'], null);
    $app.expandRecord(toStudent, ['user'], null);
    const fromUser = fromStudent.expandedOne('user');
    const toUser = toStudent.expandedOne('user');

    const fromEmail = fromUser.get('email');
    const toEmail = toUser.get('email');

    let toSubject = '';
    let fromSubject = '';
    let toHtml = '';
    let fromHtml = '';

    const onCallsUrl = 'https://super-garde.aymericdo.ovh/on-calls'

    if (onTransferSlots.get('state') === 'progress') {
      toSubject = "Une garde est proposée au transfert";
      toHtml = `<div>La garde du ${slot.get('start')} au ${slot.get('end')} est proposée au transfert.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
      fromSubject = "Vous avez proposé votre garde au transfert";
      fromHtml = `<div>Vous avez proposé la garde du ${slot.get('start')} au ${slot.get('end')} au transfert.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
    } else if (onTransferSlots.get('state') === 'cancel') {
      toSubject = "Une proposition de garde a été annulée";
      toHtml = `<div>La garde du ${slot.get('start')} au ${slot.get('end')} n’est plus proposée.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
      fromSubject = "Vous avez annulé votre proposition de garde";
      fromHtml = `<div>Vous avez annulé la proposition de transfert de la garde du ${slot.get('start')} au ${slot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
    } else if (onTransferSlots.get('state') === 'done') {
      toSubject = "Vous avez récupéré une garde 🎉";
      toHtml = `<div>Vous avez récupéré la garde du ${slot.get('start')} au ${slot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
      fromSubject = "Votre garde a été transférée";
      fromHtml = `<div>Votre garde du ${slot.get('start')} au ${slot.get('end')} a été transférée à un collègue.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
    }

    console.log('coucou')

    const messageToFromStudent = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{
        address: fromEmail,
      }],
      subject: fromSubject,
      html: fromHtml,
    });

    console.log('coucou')

    const messageToToStudent = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{
        address: toEmail,
      }],
      subject: toSubject,
      html: toHtml,
    });

    console.log('coucou')

    try {
      const DEV_SEND_EMAIL = process.env['DEV_SEND_EMAIL']
      console.log(DEV_SEND_EMAIL)

      if (DEV_SEND_EMAIL === 'true') {
        $app.newMailClient().send(messageToFromStudent);
        $app.newMailClient().send(messageToToStudent);
      }
    } catch (error) {
      console.error(error);
    }
  },
  putOnExchange: (model, options) => {
    const { $app, MailerMessage } = options;

    const slot = $app.findRecordById('onCallSlots', model.id);

    const onExchangeSlots = $app.findFirstRecordByFilter('onExchangeSlots', "slot = {:slot}", { slot: slot.id });
    $app.expandRecord(onExchangeSlots, ['from', 'to', 'toSlot'], null);

    const fromStudent = onExchangeSlots.expandedOne('from');
    const toStudent = onExchangeSlots.expandedOne('to');
    const toSlot = onExchangeSlots.expandedOne('toSlot');

    $app.expandRecord(fromStudent, ['user'], null);
    $app.expandRecord(toStudent, ['user'], null);
    const fromUser = fromStudent.expandedOne('user');
    const toUser = toStudent.expandedOne('user');

    const fromEmail = fromUser.get('email');
    const toEmail = toUser.get('email');

    let toSubject = '';
    let fromSubject = '';
    let toHtml = '';
    let fromHtml = '';

    const onCallsUrl = 'https://super-garde.aymericdo.ovh/on-calls'

    if (onExchangeSlots.get('state') === 'progress') {
      toSubject = "Une garde vous est proposée en échange";
      toHtml = `<div>La garde du ${slot.get('start')} au ${slot.get('end')} est proposée en échange contre votre garde du ${toSlot.get('start')} au ${toSlot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
      fromSubject = "Vous avez proposé un échange de garde";
      fromHtml = `<div>Vous avez proposé d’échanger votre garde du ${slot.get('start')} au ${slot.get('end')} contre la garde du ${toSlot.get('start')} au ${toSlot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
    } else if (onExchangeSlots.get('state') === 'cancel') {
      toSubject = "Une proposition d’échange de garde a été annulée";
      toHtml = `<div>La proposition d’échanger la garde du ${slot.get('start')} au ${slot.get('end')} contre la vôtre du ${toSlot.get('start')} au ${toSlot.get('end')} a été annulée.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
      fromSubject = "Vous avez annulé votre proposition d’échange";
      fromHtml = `<div>Vous avez annulé la proposition d’échange entre votre garde du ${slot.get('start')} au ${slot.get('end')} et celle du ${toSlot.get('start')} au ${toSlot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
    } else if (onExchangeSlots.get('state') === 'done') {
      toSubject = "Vous avez accepté un échange de garde 🎉";
      toHtml = `<div>Vous avez échangé votre garde du ${toSlot.get('start')} au ${toSlot.get('end')} avec la garde du ${slot.get('start')} au ${slot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
      fromSubject = "Votre échange de garde a été confirmé";
      fromHtml = `<div>Votre garde du ${slot.get('start')} au ${slot.get('end')} a été échangée avec celle du ${toSlot.get('start')} au ${toSlot.get('end')}.<br/><a class="btn" href="${onCallsUrl}">Gérer mes gardes</a></div>`;
    }

    const messageToFromStudent = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{
        address: fromEmail,
      }],
      subject: fromSubject,
      html: fromHtml,
    });

    const messageToToStudent = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{
        address: toEmail,
      }],
      subject: toSubject,
      html: toHtml,
    });

    try {
      const DEV_SEND_EMAIL = process.env['DEV_SEND_EMAIL']

      if (DEV_SEND_EMAIL === 'true') {
        $app.newMailClient().send(messageToFromStudent);
        $app.newMailClient().send(messageToToStudent);
      }
    } catch (error) {
      console.error(error);
    }
  },
};
