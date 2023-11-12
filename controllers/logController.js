const logService = require('../services/logService');
const logger = require('../logger');

const parseLogs = logs => {
    return logs.map(log => {
        try {
            return JSON.parse(log);
        }
        catch (error) {
            logger.error(`Error parsing log entry: ${error.message}`);
            return log;
        }
    });
};

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await logService.fetchAllLogs();
        const parsedLogs = parseLogs(logs);
        res.status(200).json({ logs: parsedLogs });
    } catch (error) {
        logger.error(`Error fetching all logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllErrorLogs = async (req, res) => {
    try {
        const errorLogs = await logService.fetchLogsByLevel('error');
        const parsedLogs = parseLogs(errorLogs);
        res.status(200).json({ errorLogs: parsedLogs });
    } catch (error) {
        logger.error(`Error fetching error logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllInfoLogs = async (req, res) => {
    try {
        const infoLogs = await logService.fetchLogsByLevel('info');
        const parsedLogs = parseLogs(infoLogs);
        res.status(200).json({ infoLogs: parsedLogs });
    } catch (error) {
        logger.error(`Error fetching info logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllWarnLogs = async (req, res) => {
    try {
        const warnLogs = await logService.fetchLogsByLevel('warn');
        const parsedLogs = parseLogs(warnLogs);
        res.status(200).json({ warnLogs: parsedLogs });
    } catch (error) {
        logger.error(`Error fetching warn logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.searchLogs = async (req, res) => {
    const { query } = req.query;
    try {
        const searchResults = await logService.searchLogs(query);
        const parsedResults = parseLogs(searchResults);
        res.status(200).json({ searchResults: parsedResults });
    } catch (error) {
        logger.error(`Error searching logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
