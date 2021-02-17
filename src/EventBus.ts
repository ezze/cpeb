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

  off(name: string, handler?: EventHandler): void {
    if (!handler) {
      delete this.handlers[name];
      return;
    }
    if (this.handlers[name]) {
      const index = this.handlers[name].findIndex(h => h === handler);
      if (index >= 0) {
        this.handlers[name].splice(index, 1);
        return;
      }
    }
    throw new Error(`Handler for event "${name}" is not registered therefore it can't be removed`);
  }

  async fire(name: string, ...args: any[]): Promise<EventFireResult> {
    const handlers = this.get(name);
    const { params, options } = parseEventFireArguments(args);
    const { throwError = false, skip = [] } = options;

    const done: EventHandlerExecutions = [];
    const skipped: EventHandlerExecutions = [];
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      const hash = getFiredEventHash(name, normalizeEventParams(params, this.paramTransformer), handler);
      const execution = { name, params, handler, hash };
      if (skip.includes(hash)) {
        skipped.push(execution);
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
      done.push(execution);
    }

    return { done, skipped };
  }
}

export = EventBus;
