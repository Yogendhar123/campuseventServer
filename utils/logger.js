import fs from 'fs';
import path from 'path';

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logToFile = (level, message) => {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFile(path.join(logDir, 'app.log'), line, () => {});
  if (level === 'error') console.error(line.trim());
  else console.log(line.trim());
};

const logger = {
  info: (msg) => logToFile('info', msg),
  error: (msg) => logToFile('error', msg),
  warn: (msg) => logToFile('warn', msg),
};

export default logger;
