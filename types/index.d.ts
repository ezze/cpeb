declare type EventHandler = Function;
declare type EventHandlers = Array<EventHandler>;

declare type EventParamTransformer = (param: any) => any;

declare type ErrorCallback = (error: Error | string) => void;

declare interface EventBusOptions {
  paramTransformer?: EventParamTransformer;
  errorCallback?: ErrorCallback;
}

declare interface EventHandlerExecution {
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

declare class EventBus {
  constructor(options: EventBusOptions);
  create(): Promise<void>;
  destroy(): Promise<void>;
}

declare class MainEventBus extends EventBus {}
declare class WorkerEventBus extends EventBus {}
declare class CliEventBus extends EventBus {}

