import EventBus from '../src/EventBus';

describe('event bus', () => {
  it('register event handler and execute it when event is fired', async() => {
    const eventBus = await createEventBus();
    const fn = jest.fn();
    eventBus.on('test', fn);
    await eventBus.fire('test', 'foo');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).lastCalledWith('foo');
  });

  it('register event handler and execute it with few arguments when event is fired', async() => {
    const eventBus = await createEventBus();
    const fn = jest.fn();
    eventBus.on('test', fn);
    await eventBus.fire('test', 'foo', 'bar', 'baz');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).lastCalledWith('foo', 'bar', 'baz');
  });

  it('register event handler and don\'t execute it when another event is fired', async() => {
    const eventBus = await createEventBus();
    const fn = jest.fn();
    eventBus.on('test', fn);
    await eventBus.fire('anotherTest', 'foo');
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('register two async event handlers and execute them sequentially when event is fired', async() => {
    const eventBus = await createEventBus();
    const ms1 = 50;
    const ms2 = 50;
    let orderResult = '';
    const fn1 = jest.fn().mockImplementation(async() => {
      await delay(ms1);
      orderResult += '1';
    });
    const fn2 = jest.fn().mockImplementation(async() => {
      await delay(ms2);
      orderResult += '2';
    });
    eventBus.on('test', fn1);
    eventBus.on('test', fn2);
    const start = new Date().getTime();
    await eventBus.fire('test');
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(orderResult).toEqual('12');
    expect(new Date().getTime() - start).toBeGreaterThanOrEqual(ms1 + ms2);
  });

  it('retrieve count of registered event handlers', async() => {
    const eventBus = await createEventBus();
    const fn = jest.fn();
    eventBus.on('test', fn);
    eventBus.on('test', fn);
    eventBus.on('anotherTest', fn);
    expect(eventBus.get('test').length).toEqual(2);
    expect(eventBus.get('anotherTest').length).toEqual(1);
    expect(eventBus.get('superTest').length).toEqual(0);
  });

  it('unregister event handler and don\'t execute it when event is fired', async() => {
    const eventBus = await createEventBus();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    eventBus.on('test', fn1);
    eventBus.on('test', fn2);
    eventBus.off('test', fn1);
    await eventBus.fire('test');
    expect(fn1).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('unregister all event handlers and don\'t execute them when event is fired', async() => {
    const eventBus = await createEventBus();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    eventBus.on('test', fn1);
    eventBus.on('test', fn2);
    eventBus.off('test');
    await eventBus.fire('test');
    expect(fn1).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(0);
  });

  it('throw error when trying to unregister non-registered event handler', async() => {
    const eventBus = await createEventBus();
    const fn = jest.fn();
    eventBus.on('anotherTest', fn);
    const eventErrorMessage = (name: string) => {
      return `Handler for event "${name}" is not registered therefore it can't be removed`;
    };
    expect(() => eventBus.off('test', fn)).toThrowError(eventErrorMessage('test'));
    expect(() => eventBus.off('anotherTest', jest.fn())).toThrowError(eventErrorMessage('anotherTest'));
  });

  it('skip event handler execution by its hash', async() => {
    const eventBus = await createEventBus();
    const fn1 = jest.fn().mockImplementation(() => 1);
    const fn2 = jest.fn().mockImplementation(() => 2);
    eventBus.on('test', fn1);
    eventBus.on('test', fn2);
    const result1 = await eventBus.fire('test', 'foo');
    expect(result1.executed.length).toEqual(2);
    expect(result1.skipped.length).toEqual(0);
    const result2 = await eventBus.fire('test', 'foo', { cpeb: true, skip: [result1.executed[0]] });
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(result2.executed.length).toEqual(1);
    expect(result2.skipped.length).toEqual(1);
    expect(result2.executed[0]).toEqual(result1.executed[1]);
    expect(result2.skipped[0]).toEqual(result1.executed[0]);
  });

  describe('error handling', () => {
    const errorCallback = jest.fn();
    const errorHandler = jest.fn().mockImplementation(async() => {
      await delay(20);
      throw new Error('handler error');
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('don\'t throw error when handler execution is failed', async() => {
      const eventBus = await createEventBus();
      eventBus.on('test', errorHandler);
      const result = await eventBus.fire('test', 'foo');
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(result.executed.length).toEqual(1);
    });

    it('run error callback on event firing when handler execution is failed', async() => {
      const eventBus = await createEventBus({ errorCallback });
      eventBus.on('test', errorHandler);
      const result = await eventBus.fire('test', 'foo');
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(errorCallback.mock.calls[0][0].message).toEqual('handler error');
      expect(result.executed.length).toEqual(1);
    });

    it('throw an error and don\'t run callback on event firing when handler execution is failed', async() => {
      const eventBus = await createEventBus({ errorCallback });
      eventBus.on('test', errorHandler);
      await expect(eventBus.fire('test', 'foo', {
        cpeb: true,
        throwError: true
      })).rejects.toThrowError('handler error');
      expect(errorCallback).toHaveBeenCalledTimes(0);
    });
  });

  it('destroy instance', async() => {
    const eventBus = await createEventBus();
    await eventBus.destroy();
  });
});

async function createEventBus(options?: EventBusOptions): Promise<EventBus> {
  const eventBus = new EventBus(options);
  await eventBus.create();
  return eventBus;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
