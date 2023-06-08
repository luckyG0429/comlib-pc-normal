declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module "*.svg" {
  const resource: any;
  export = resource;
}

interface Env {
  ajax: (url: string, opt: Record<string, any>) => Promise<any>
  events: any[]
  vars?: {
    getQuery: () => any;
    getCookies: () => any;
    getRouter: () => Record<string, Function>
  }
  [x: string]: any
}
interface RuntimeParams<T> {
  /** 组件ID **/
  id: string
  name: string
  data: T
  env: Env
  style: any
  slots: {
    [key: string]: {
      render: (props?: { wrap?: any, inputValues?: any, key?: number | string, style?: React.CSSProperties, outputs?: { [key: string]: Function } }) => React.ReactNode
      inputs: any
      [key: string]: any
    }
  }
  inputs: any
  outputs: any
  _inputs: any
  _outputs: any
  logger: any
  createPortal: any
  /** 父容器插槽 **/
  parentSlot: any
  title?: string
  onError: (params: Error | string) => null
}

interface EditorResult<T> {
  id: string
  name: string
  data: T
  focusArea: any
  output: any
  input: any
  inputs: any
  outputs: any
  slot: any,
  diagram: any
  style: React.CSSProperties
  catelog: any
  slots?: any
  env: Env
  setAutoRun: (auto?: boolean) => void
  isAutoRun: () => boolean
  setDesc: (desc?: string) => void
  /** 获取子组件data，引擎 v1.2.69 **/
  getChildByName: (name: string) => any
}

interface UpgradeParams<T> {
  data: T
  output: any
  input: any
  slot: any
  style: any
  setAutoRun: (auto?: boolean) => void
  isAutoRun: () => boolean
  setDeclaredStyle: (selector: string, style: React.CSSProperties) => void
}

type AnyMap = {
  [key in string | number]: any
}

interface Env { preview?: {}, edit?: {}, runtime?: any, mock?: {} }

type StyleTargetType<T> = Partial<{ target: string | ((props: EditorResult<T>) => string) | undefined }>;