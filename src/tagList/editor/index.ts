import { Data } from '../types';
import TagEditor from './tag';
import { createTag } from './util';
export default {
  ':root'({ data }: EditorResult<Data>, ...cate) {
    cate[0].title = '配置';
    cate[0].items = [
      {
        title: '属性',
        items: [
          {
            title: '方向',
            type: 'select',
            options: {
              options: [
                {
                  label: '水平',
                  value: 'horizontal'
                },
                {
                  label: '垂直',
                  value: 'vertical'
                }
              ],
              defaultValue: 'horizontal'
            },
            value: {
              get({ data }: EditorResult<Data>) {
                return data.direction || 'horizontal';
              },
              set({ data }: EditorResult<Data>, val: 'horizontal' | 'vertical') {
                data.direction = val;
              }
            }
          },
          {
            title: '标签间距',
            type: 'inputNumber',
            options: [{ min: 0, max: 50, width: 100 }],
            value: {
              get({ data }: EditorResult<Data>) {
                return [data.size || 8];
              },
              set({ data }: EditorResult<Data>, val: number[]) {
                data.size = val[0];
              }
            }
          }
        ]
      },
      {
        title: '操作',
        items: [
          {
            title: '添加标签',
            type: 'button',
            value: {
              set({ data }: EditorResult<Data>, val: string) {
                const tag = createTag();
                data.tags.push(tag);
              }
            }
          }
        ]
      }
      // {
      //     title: '对齐方式',
      //     type: 'select',
      //     options: {
      //         options: [
      //             {
      //                 label: '左对齐',
      //                 value: 'start'
      //             },
      //             {
      //                 label: '右对齐',
      //                 value: 'end'
      //             },
      //             {
      //                 label: '中间对齐',
      //                 value: 'center'
      //             },
      //             {
      //                 label: '下边对齐',
      //                 value: 'baseline'
      //             }
      //         ],
      //         defaultValue: 'start'
      //     },
      //     value: {
      //         get({ data }: EditorResult<Data>) {
      //             return data.align || 'start';
      //         },
      //         set({ data }: EditorResult<Data>, val: 'start' | 'end' | 'center' | 'baseline') {
      //             data.align = val;
      //         }
      //     }
      // },
    ];
    cate[1].title = '高级';
    cate[1].items = [
      {
        title: '动态数据',
        type: 'switch',
        value: {
          get({ data }: EditorResult<Data>) {
            return !!data.dynamic;
          },
          set({ data, input }: EditorResult<Data>, val: boolean) {
            data.dynamic = val;
            if (val) {
              input.add('dynamicTags', '输入动态标签列表', {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    icon: {
                      title: '图标',
                      type: 'string'
                    },
                    content: {
                      title: '标签内容',
                      type: 'string'
                    },
                    color: {
                      title: '颜色',
                      type: 'string'
                    },
                    checkable: {
                      title: '是否可选',
                      type: 'boolean'
                    },
                    closable: {
                      title: '是否可关闭',
                      type: 'boolean'
                    }
                  }
                }
              });
            } else {
              input.remove('dynamicTags');
            }
          }
        }
      }
    ];
  },
  ...TagEditor
};
