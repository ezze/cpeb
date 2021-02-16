abstract class EventBus {
  abstract create(): Promise<void>
  abstract destroy(): Promise<void>

  handlers: Record<string, EventHandlers> = {};
  errorCallback?: ErrorCallback;

  constructor(options: EventBusOptions = {}) {
    const { errorCallback } = options;
    this.errorCallback = errorCallback;
  }

  on(name: string, handler: Function): void {
    if (!this.handlers[name]) {
      this.handlers[name] = [];
    }
    this.handlers[name].push(handler);
  }

  off(name: string, handler: Function): void {
    if (!handler) {
      delete this.handlers[name];
      return;
    }
    if (!this.handlers[name]) {
      return;
    }
    const index = this.handlers[name].findIndex(h => h === handler);
    if (index >= 0) {
      this.handlers[name].splice(index, 1);
    }
  }
}

export = EventBus;
