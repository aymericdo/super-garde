module.exports = {
  putOnMarket: (model, oldStudentId, options) => {
    const { $app, MailerMessage, $os, __hooks } = options;

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

    const message1 = new MailerMessage({
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

    let oldStudentEmail = null;
    let message2;
    if (oldStudentId !== student.id && !model.get('isOnMarket')) {
      const oldStudent = $app.findRecordById('students', oldStudentId);
      $app.expandRecord(oldStudent, ['user'], null);
      const oldUser = oldStudent.expandedOne('user');
      oldStudentEmail = oldUser.get('email');

      message2 = new MailerMessage({
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

    let message3;
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

      message3 = new MailerMessage({
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
      const NODE_ENV = process.env['NODE_ENV']
      const DEV_SEND_EMAIL = process.env['DEV_SEND_EMAIL']

      if (NODE_ENV === 'production' || DEV_SEND_EMAIL === 'true') {
        $app.newMailClient().send(message1);
        if (message2) $app.newMailClient().send(message2);
        if (message3) $app.newMailClient().send(message3);
      }
    } catch (error) {
      console.error(error);
    }
  },
};
