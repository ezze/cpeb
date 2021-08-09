declare type EventHandler = Function;
declare type EventHandlers = Array<EventHandler>;

declare type EventParamTransformer = (param: any) => any;

declare type ErrorCallback = (error: Error | string) => void;

declare interface EventBusOptions {
  paramTransformer?: EventParamTransformer;
  errorCallback?: ErrorCallback;
}

declare type CrossProcessEventBusOptions = EventBusOptions & {
  requestTimeoutMs?: number;
}

declare type EventHandlerExecution = {
  name: string;
  params: Array<any>;
  handler: EventHandler;
  hash: string;
}
declare type EventHandlerExecutions = Array<EventHandlerExecution>;

declare type EventHashes = Array<string>;

declare interface EventFireOptions {
  throwError?: boolean;
  skip?: EventHashes;
}

declare interface EventFireResult {
  done: EventHandlerExecutions;
  skipped: EventHandlerExecutions;
}

declare type EventBusRequestInitiator = 'main' | 'worker' | 'cli';
declare type EventBusResponseStatus = 'done' | 'error';

declare type EventBusRequest = {
  name: string;
  params?: Record<string, any>;
}

declare type EventBusResponse = {
  id: string;
  initiator: EventBusRequestInitiator;
  initiatorId?: number;
  name: string;
  contents?: any;
}

declare class EventBus {
  constructor(options: EventBusOptions);
  create(): Promise<void>;
  destroy(): Promise<void>;
}

declare class MainEventBus extends EventBus {}
declare class WorkerEventBus extends EventBus {}
declare class CliEventBus extends EventBus {}

