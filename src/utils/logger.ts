import * as fs from 'fs';
import * as path from 'path';

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] INFO: ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
    console.log(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log + '\n');
  },

  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ERROR: ${message}${error ? '\n' + JSON.stringify(error, null, 2) : ''}`;
    console.error(log);
    fs.appendFileSync(path.join(logDir, 'error.log'), log + '\n');
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const log = `[${timestamp}] DEBUG: ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
      console.log(log);
    }
  },

  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] WARN: ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
    console.warn(log);
    fs.appendFileSync(path.join(logDir, 'app.log'), log + '\n');
  },
};
