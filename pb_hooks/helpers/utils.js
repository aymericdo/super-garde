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
};
