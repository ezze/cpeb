import {
  parseEventFireArguments,
  normalizeEventParams,
  getFiredEventHash
} from './utils';

class EventBus {
  handlers: Record<string, EventHandlers> = {};
  paramTransformer?: EventParamTransformer;
  errorCallback?: ErrorCallback;

  constructor(options: EventBusOptions = {}) {
    const { paramTransformer, errorCallback } = options;
    this.paramTransformer = paramTransformer;
    this.errorCallback = errorCallback;
  }

  create(): Promise<void> {
    return Promise.resolve();
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }

  get(name: string): EventHandlers {
    return this.handlers[name] || [];
  }

  on(name: string, handler: EventHandler): void {
    if (!this.handlers[name]) {
      this.handlers[name] = [];
    }
    this.handlers[name].push(handler);
  }

  off(name: string, handler: EventHandler): void {
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

  async fire(name: string, ...args: any[]): Promise<EventFireResult> {
    const handlers = this.get(name);
    const { params, options } = parseEventFireArguments(args);
    const { throwError = false, skip = [] } = options;

    const executed: EventHashes = [];
    const skipped: EventHashes = [];
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      const firedEventHash = getFiredEventHash(name, normalizeEventParams(params), handler);
      if (skip.includes(firedEventHash)) {
        skipped.push(firedEventHash);
        continue;
      }

      try {
        await handler(...params);
      }
      catch (e) {
        if (throwError) {
          throw e;
        }
        if (this.errorCallback) {
          this.errorCallback(e);
        }
      }
      executed.push(firedEventHash);
    }

    return { executed, skipped };
  }
}

export = EventBus;
