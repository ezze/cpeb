import cluster from 'cluster';
import os from 'os';
import http from 'http';

import Koa, { Context } from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { Server as SocketServer, Socket } from 'socket.io';

import MainEventBus from '../MainEventBus';
import WorkerEventBus from '../WorkerEventBus';

const port = process.env.PORT || 40000;

if (cluster.isMaster) {
  const server = http.createServer();
  const socket = new SocketServer(server);
  socket.listen(server);
  console.log(`Main process is listening to port ${port}`);

  const mainEventBus = new MainEventBus();

  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log(`Worker ${worker.id} is exited: code — ${code}; signal — ${signal}`);
    cluster.fork();
  });
}
else if (cluster.isWorker) {
  const workerEventBus = new WorkerEventBus();

  const { id: workerId } = cluster.worker;

  const app = new Koa();
  app.use(bodyParser());
  app.use(cors());
  app.on('error', error => console.error(error));
  app.use(async(ctx: Context) => {
    const { request } = ctx;
    console.log(`[ ${workerId} ]: handling request: ${request.method} ${request.url}`);
    ctx.body = 'Hello world';
  });

  const server = http.createServer(app.callback());
  const io = new SocketServer(server);
  io.on('connection', (socket: Socket) => {
    console.log(`[ ${workerId} ]: new connection "${socket.id}" has been established`);
    socket.on('disconnect', (reason) => {
      console.log(`[ ${workerId} ]: connection "${socket.id}" has been closed with the following reason: ${reason}`);
    });
  });
  server.listen(port);
  console.log(`Worker ${workerId} is listening to port ${port}`);

  workerEventBus.request({ id: '1', })
}
