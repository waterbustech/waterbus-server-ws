// import * as winston from 'winston';

// const customFormat = winston.format.printf(({ timestamp, level, message }) => {
//   let icon = '';
//   switch (level) {
//     case 'info':
//       icon = '🦋';
//       break;
//     case 'warn':
//       icon = '⚠️';
//       break;
//     case 'error':
//       icon = '🐞';
//       break;
//     default:
//       icon = '';
//       break;
//   }
//   return `${icon} [${timestamp}][${level}]: ${message}`;
// });

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.timestamp(),
//     customFormat,
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'app.log', level: 'info' }),
//     new winston.transports.Console(),
//   ],
// });

// export default logger;
