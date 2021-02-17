import EventBus from '../src/EventBus';

describe('event bus', () => {
  it('register and call event listener', async() => {
    const eventBus = new EventBus();
    await eventBus.create();
    const fn = jest.fn();
    eventBus.on('test', fn);
    await eventBus.fire('test', 'bar');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).lastCalledWith('bar');
  });
});
