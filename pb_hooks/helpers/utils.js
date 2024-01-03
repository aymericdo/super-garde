module.exports = {
  csvParser: (line, type) => {
    switch (type) {
      case 'student': {
        const lineArray = line.split(',');

        const firstName = lineArray[0].slice(1,-1)
        const lastName = lineArray[1].slice(1,-1)
        const email = lineArray[2].slice(1,-1)

        const name = `${firstName} ${lastName}`;
        const username = `${firstName[0]}${lastName}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(' ', '');

        return {
          firstName,
          lastName,
          email,
          name,
          username,
        }
      }
    }
  },
  getEnvFromEnvFile: (key, options) => {
    const { $os, __hooks } = options;

    const envFile = $os.readFile(`${__hooks}/../.env`);
    const rightLine = String.fromCharCode(...envFile.toString().split(','))
      .split('\n')
      .find((line) => {
        const splittedLine = line.split('=');
        return line[0] !== '#' && splittedLine[0] === key;
      });

    if (rightLine) {
      const splittedLine = rightLine.split('=');
      return splittedLine[1]
    }

    return -1
  },
  hello: (name) => {
    console.log(`Hello ${name}`)
  },
};
