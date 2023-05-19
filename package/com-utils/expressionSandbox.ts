type Str = string | undefined;

type Options = Partial<{
  prefix: string;
  context: Record<string, any>;
}>;

export default class Sandbox {
  private options: Options = {};
  constructor(options: Options) {
    this.options = options;
  }
  private unscopeCompileCode(prefix: Str = 'context', expression: Str) {
    return new Function(
      prefix,
      `with(${prefix}){
            return ${expression}
        }`
    );
  }
  private scopeCompileCode(expression: Str) {
    const fn = this.unscopeCompileCode(this.options.prefix, expression);
    return (sandbox) => {
      const _target = this.options.prefix ? { [this.options.prefix]: sandbox } : sandbox;
      const proxy = new Proxy(_target, {
        // 拦截所有属性，防止到 Proxy 对象以外的作用域链查找
        has(target, key) {
          return true;
        },
        get(target, key, receiver) {
          // 防止沙箱逃逸逃逸
          if (key === Symbol.unscopables) {
            return undefined;
          }
          return Reflect.get(target, key, receiver);
        }
      });
      return fn(proxy);
    };
  }
  execute(expression: Str) {
    const fn = this.scopeCompileCode(expression);
    const _context = this.options.context ?? {};
    return fn.call(this, _context);
  }
}
