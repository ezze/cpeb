import EventBus from './EventBus';

abstract class CrossProcessEventBus extends EventBus {
  requestTimeoutMs;

  constructor(options: CrossProcessEventBusOptions = {}) {
    super(<EventBusOptions>options);
    const { requestTimeoutMs = 200 } = options;
    this.requestTimeoutMs = requestTimeoutMs;
  }

  abstract request(request: EventBusRequest): Promise<EventBusResponse>;
  abstract response(response: EventBusResponse): Promise<void>;
}

export default CrossProcessEventBus;
