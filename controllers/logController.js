const logService = require('../services/logService');
const logger = require('../logger');

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await logService.fetchAllLogs();
        res.status(200).json({ logs });
    } catch (error) {
        logger.error(`Error fetching all logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllErrorLogs = async (req, res) => {
    try {
        const errorLogs = await logService.fetchLogsByLevel('error');
        res.status(200).json({ errorLogs });
    } catch (error) {
        logger.error(`Error fetching error logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllInfoLogs = async (req, res) => {
    try {
        const infoLogs = await logService.fetchLogsByLevel('info');
        res.status(200).json({ infoLogs });
    } catch (error) {
        logger.error(`Error fetching info logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllWarnLogs = async (req, res) => {
    try {
        const warnLogs = await logService.fetchLogsByLevel('warn');
        res.status(200).json({ warnLogs });
    } catch (error) {
        logger.error(`Error fetching warn logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.searchLogs = async (req, res) => {
    const { query } = req.query;
    try {
        const searchResults = await logService.searchLogs(query);
        res.status(200).json({ searchResults });
    } catch (error) {
        logger.error(`Error searching logs: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
