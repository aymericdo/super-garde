module.exports = {
  csvParser: (line, type) => {
    switch (type) {
      case 'student': {
        const lineArray = line.split(',');

        const firstName = lineArray[0].slice(1,-1)
        const lastName = lineArray[1].slice(1,-1)
        const email = lineArray[2].slice(1,-1)
        const year = lineArray[3].slice(1,-1)
        const UHCD = lineArray[4].slice(1,-1)
        const onCallCount2025 = lineArray[5].slice(1,-1)
        const totalOnCallCount = lineArray[6].slice(1,-1)

        const name = `${firstName} ${lastName}`;

        return {
          firstName,
          lastName,
          email,
          name,
          year,
          UHCD: UHCD === 'TRUE',
          onCallCount2025: onCallCount2025 ?? 0,
          totalOnCallCount: totalOnCallCount ?? 0,
        }
      }
    }
  },
  randomItemFromList: (list) => {
    return list[Math.floor(Math.random() * list.length)];
  },
  displayDateRange: (start, end) => {
    const pad = n => String(n).padStart(2, '0');
    const weekdays = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

    const formatFull = (d) =>
      `${weekdays[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const formatTime = (d) =>
      `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const datesAreOnSameDay = start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()

    if (datesAreOnSameDay) {
      return `${formatFull(start)} - ${formatTime(end)}`;
    }

    return `${formatFull(start)} - ${formatFull(end)}`;
  },
  slotStudentValidation: (slot, student) => {
    if (slot.get('sector') === 'URTC' && !['MM2', 'MM3'].includes(student.get('year'))) {
      return "Pour faire la tâche URTC, l'étudiant doit être en MM2 ou MM3."
    } else if (slot.get('sector') === 'UHCD' && !student.get('UHCD')) {
      return "Pour faire la tâche UHCD, l'étudiant doit avoir fait la formation."
    } else {
      return null
    }
  },
  emailHtml: (message) => {
    return `<p>Bonjour,</p>
    <p>${message}</p>
    <p>
      <a href="https://super-garde.aymericdo.ovh/on-calls"
        target="_blank"
        rel="noopener"
        style="
          display: inline-block;
          background-color: #f43098;
          color: #ffffff;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          text-align: center;
          transition: background-color 0.3s ease;
        ">
        Voir mes gardes
      </a>
    </p>
    <p>
      Merci,<br/>
      L’équipe Super Garde
    </p>`
  },
  getTotalYearCount: (slots) => {
    let count = 0;
    const { holidays } = require(`${__hooks}/helpers/data.js`);

    for (const slot of slots) {
      const start = new Date(slot.get('start'));
      const isWeekend = start.getDay() === 0 || start.getDay() === 6; // dimanche=0, samedi=6
      const isHoliday = holidays().some((h) => h.toDateString() === start.toDateString());
      const weight = (isWeekend || isHoliday) ? 2 : 1;
      count += weight;
    }

    return count;
  },
};
