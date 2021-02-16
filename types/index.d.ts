declare type EventHandler = Function;
declare type ErrorCallback = (error: Error) => void;

declare type EventHandlers = Array<EventHandler>;

declare type EventBusOptions = {
  errorCallback?: ErrorCallback;
}
