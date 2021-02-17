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

export function normalizeEventParams(params: any, customTransformer?: (params: any) => any): any {
  if (!params || typeof params !== 'object') {
    return params;
  }

  if (customTransformer) {
    const transformResult = customTransformer(params);
    if (transformResult !== undefined) {
      return transformResult;
    }
  }

  if (params instanceof Date) {
    return params.toISOString();
  }

  if (Array.isArray(params)) {
    const array: Array<any> = [];
    params.forEach(param => array.push(normalizeEventParams(param)));
    return array;
  }

  const obj: Record<string, any> = {};
  Object.keys(params).forEach((name: string) => {
    obj[name] = normalizeEventParams(params[name]);
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
