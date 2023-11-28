module.exports = {
  students: (options) => {
    const { txDao } = options;

    let offset = 0;
    const perPage = 100;

    let lastStudentsArray = [];
    let students = [];

    try {
      do {
        lastStudentsArray = txDao.findRecordsByFilter("students", "id != ''", '-created', perPage, offset);
        students = students.concat(lastStudentsArray);
        offset += perPage;
      } while(lastStudentsArray.length)

      return students;
    } catch (error) {
      console.log("db students reading failed", error);
    }
  },
};
