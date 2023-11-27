module.exports = {
  user: (line, options) => {
    const { txDao, $security } = options;

    try {
      const usersCollection = txDao.findCollectionByNameOrId("users");

      // eslint-disable-next-line
      const utils = require(`${__hooks}/utils.js`);
      const {
        email,
        name,
        username,
      } = utils.csvParser(line, 'student')

      const userRecord = new Record(usersCollection);
      userRecord.set("name", name);
      userRecord.set("email", email);
      userRecord.set("username", `${username}_${$security.randomStringWithAlphabet(2, "123456789")}`);
      userRecord.setPassword("azerty1234");
      userRecord.set("role", "student");
      userRecord.setEmailVisibility(true);

      txDao.saveRecord(userRecord);

      return userRecord;
    } catch (error) {
      console.log("db user creation failed", error);
    }
  },
  student: (line, userRecord, options) => {
    const { txDao } = options;

    try {
      const studentsCollection = txDao.findCollectionByNameOrId("students");

      // eslint-disable-next-line
      const utils = require(`${__hooks}/utils.js`);
      const {
        firstName,
        lastName,
      } = utils.csvParser(line, 'student')

      const studentRecord = new Record(studentsCollection);
      studentRecord.set("firstName", firstName);
      studentRecord.set("lastName", lastName);
      studentRecord.set("user", userRecord.id);

      txDao.saveRecord(studentRecord);
      return studentRecord;
    } catch (error) {
      console.log("db student creation failed", error);
    }
  }
};
