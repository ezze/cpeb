import { io } from 'socket.io-client';

const serverUrl = 'http://localhost:40000';

document.addEventListener('DOMContentLoaded', () => {
  const eventListElement = document.querySelector('.events');
  if (!eventListElement) {
    throw new Error('Event list HTML element is not found');
  }

  const socket = io(serverUrl, {
    transports: ['websocket']
  });

  const logEvent = (type = 'info', message: string, params?: any) => {
    switch (type) {
      case 'error': {
        console.error(message);
        break;
      }
      default: {
        console.info(message);
        break;
      }
    }
    const eventTextNode = document.createTextNode(`${new Date().toISOString()} [ ${type} ]: ${message}`);
    const eventItemElement = document.createElement('li');
    eventItemElement.append(eventTextNode);
    eventListElement.prepend(eventItemElement);
  };

  let activeSocketId: string;

  socket.on('connect', () => {
    activeSocketId = socket.id;
    logEvent('info', `New socket connection "${activeSocketId}" with server "${serverUrl}" has been established`);
  });

  socket.on('disconnect', () => {
    logEvent('error', `New socket connection "${activeSocketId}" with server "${serverUrl}" has been established`);
  });
});
