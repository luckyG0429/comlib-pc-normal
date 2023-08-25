import { Data } from './constants';

export default {
  '@init'({ style }) {
    style.width = '100%';
    style.height = '100%';
  },
  '@resize': {
    options: ['width', 'height']
  },
  ':root': {
    items: ({}, cate1) => {
      cate1.title = '常规';
      cate1.items = [
        {
          title: '保存文件名',
          description: '设置保存为文件时文件名',
          type: 'text',
          value: {
            get({ data }: EditorResult<Data>) {
              return data.documentTitle;
            },
            set({ data }, value: string) {
              data.documentTitle = value;
            }
          }
        },
        {
          title: '打印完成后关闭窗口',
          description: '打印对话框关闭后是否关闭对话窗口',
          type: 'switch',
          value: {
            get({ data }: EditorResult<Data>) {
              return data.closeScene;
            },
            set({ data }, value: boolean) {
              data.closeScene = value;
            }
          }
        },
        {
          title: '显示底部操作区',
          type: 'Switch',
          value: {
            get({ data }: EditorResult<Data>) {
              return data.useFooter;
            },
            set({ data }, value: boolean) {
              data.useFooter = value;
            }
          }
        },
        {
          title: '显示关闭按钮',
          type: 'Switch',
          value: {
            get({ data }: EditorResult<Data>) {
              return data.closable;
            },
            set({ data }, value: boolean) {
              data.closable = value;
            }
          }
        }
      ];
    }
  }
};
