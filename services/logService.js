const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../combined.log');

const fetchAllLogs = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const logs = data.split('\n').filter(line => line);
        resolve(logs);
      }
    });
  });
};

const fetchLogsByLevel = (level) => {
  return new Promise((resolve, reject) => {
    fetchAllLogs()
      .then(logs => {
        const filteredLogs = logs.filter(log => log.includes(`"level":"${level}"`));
        resolve(filteredLogs);
      })
      .catch(reject);
  });
};

const searchLogs = (searchTerm) => {
  return new Promise((resolve, reject) => {
    fetchAllLogs()
      .then(logs => {
        const filteredLogs = logs.filter(log => log.includes(searchTerm));
        resolve(filteredLogs);
      })
      .catch(reject);
  });
};

module.exports = { fetchAllLogs, fetchLogsByLevel, searchLogs };
