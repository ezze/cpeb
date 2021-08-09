import cluster from 'cluster';
import { ChildProcess } from 'child_process';
import { v4 as uuid } from 'uuid';

import CrossProcessEventBus from './CrossProcessEventBus';

const initiator: EventBusRequestInitiator = 'worker';
const initiatorId: number = cluster.worker.id;

class WorkerEventBus extends CrossProcessEventBus {
  request(request: EventBusRequest): Promise<EventBusResponse> {
    const id = uuid();
    const { name, params } = request;
    process.on('test', () => {

    });
    const message = { id, name, params };
    (<ChildProcess>process).send(message);

    // return new Promise((resolve, reject) => {
      // const onMessage = (message: any) => {
      //   if (message.id !== id || message.name !== )
      //   const { id, name, params } = message;
      //   if (request)
      //   const { __request: request } = message;
      //   if (
      //     request.id !== id || request.initiator !== initiator ||
      //     request.type !== type || request.workerId !== workerId
      //   ) {
      //     return;
      //   }
      //
      //   if (timeoutId !== null) {
      //     clearTimeout(timeoutId);
      //     timeoutId = null;
      //   }
      //
      //   process.removeListener('message', onMessage);
      //
      //   const response = { ...message };
      //   delete response['__request'];
      //   this.handleResponse(response).then(resolve).catch(reject);
      // };
      //
      // process.on('message', onMessage);
      //
      // let timeoutId = setTimeout(() => {
      //   process.removeListener('message', onMessage);
      //   reject(`Request "${type}" is timed out.`);
      // }, this.workerRequestTimeoutMs);
    // });

    const response = { id, initiator, initiatorId, name, contents: params };
    return Promise.resolve(response);
  }

  response(response: EventBusResponse): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export = WorkerEventBus;
