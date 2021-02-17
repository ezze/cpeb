import objectHash from 'object-hash';

export function parseEventFireArguments(args: any): {
  params: Array<any>;
  options: EventFireOptions;
} {
  const options: EventFireOptions = {};
  if (args.length > 0) {
    const lastArg = args[args.length - 1];
    if (lastArg && typeof lastArg === 'object' && typeof lastArg.cpeb === 'boolean') {
      const passedOptions = { ...args.pop() };
      const { cpeb } = passedOptions;
      delete passedOptions.cpeb;
      if (cpeb) {
        Object.assign(options, <EventFireOptions>passedOptions);
      }
    }
  }
  return { params: args, options };
}

export function normalizeEventParams(instance: any, customTransformer?: (instance: any) => any): any {
  if (customTransformer) {
    const transformResult = customTransformer(instance);
    if (transformResult !== undefined) {
      return transformResult;
    }
  }

  if (!instance || typeof instance !== 'object') {
    return instance;
  }

  if (instance instanceof Date) {
    return instance.toISOString();
  }

  if (Array.isArray(instance)) {
    const array: Array<any> = [];
    instance.forEach(item => {
      array.push(normalizeEventParams(item, customTransformer));
    });
    return array;
  }

  const obj: Record<string, any> = {};
  Object.keys(instance).forEach((name: string) => {
    obj[name] = normalizeEventParams(instance[name], customTransformer);
  });
  return obj;
}

export function getFiredEventHash(name: string, params: Array<any>, handler: EventHandler | any): string {
  const isMockHandler = handler && typeof handler.getMockImplementation === 'function';
  if (isMockHandler) {
    return objectHash({ name, params, handler: handler.getMockImplementation() });
  }
  return objectHash({ name, params, handler });
}
