import { Data, Tag } from '../types';
import { getTagItem, arrayMove } from './util';
export const TagSchema = {
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
      title: '背景颜色',
      type: 'string'
    },
    textColor: {
      title: '文本颜色',
      type: 'string'
    },
    borderColor: {
      title: '边框颜色',
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
};

export default {
  '.ant-space-item': {
    title: "标签",
    items: ({ data, focusArea, slot }: EditorResult<Data>, cate1, cate2) => {
      if (!focusArea) return;
      const tag: Tag = getTagItem(data, focusArea);
      cate1.title = '基础配置';
      cate1.items = [
        {
          title: '属性',
          items: [
            {
              title: '标签内容',
              type: 'text',
              value: {
                get({}: EditorResult<Data>) {
                  return tag.content;
                },
                set({}: EditorResult<Data>, val: string) {
                  tag.content = val;
                }
              }
            },
            {
              title: '图标',
              type: 'icon',
              value: {
                get({}: EditorResult<Data>) {
                  return tag.icon;
                },
                set({}: EditorResult<Data>, val: string) {
                  tag.icon = val;
                }
              }
            }
          ]
        },
        {
          title: '样式',
          items: [
            {
              title: '背景色',
              type: 'colorPicker',
              value: {
                get({}: EditorResult<Data>) {
                  return tag.color;
                },
                set({}: EditorResult<Data>, val: string) {
                  tag.color = val;
                }
              }
            },
            {
              title: '文本颜色',
              type: 'colorPicker',
              value: {
                get({}: EditorResult<Data>) {
                  return tag.textColor;
                },
                set({}: EditorResult<Data>, val: string) {
                  tag.textColor = val;
                }
              }
            },
            {
              title: '边框颜色',
              type: 'colorPicker',
              value: {
                get({}: EditorResult<Data>) {
                  return tag.borderColor;
                },
                set({}: EditorResult<Data>, val: string) {
                  tag.borderColor = val;
                }
              }
            }
          ]
        },
        {
          title: '操作',
          items: [
            {
              title: '向前移动',
              type: 'button',
              value: {
                get({ focusArea }: EditorResult<Data>) {
                  return focusArea.index;
                },
                set({ data, focusArea }: EditorResult<Data>) {
                  const { index } = focusArea;
                  if (index === 0) return;
                  data.tags = arrayMove<Tag>(data.tags, index, index - 1);
                }
              }
            },
            {
              title: '向后移动',
              type: 'button',
              value: {
                get({ focusArea }: EditorResult<Data>) {
                  return focusArea.index;
                },
                set({ data }: EditorResult<Data>) {
                  const { index } = focusArea;
                  if (index === data.tags.length - 1) return;
                  data.tags = arrayMove<Tag>(data.tags, index, index + 1);
                }
              }
            },
            {
              title: '删除',
              type: 'button',
              ifVisible({ data }: EditorResult<Data>) {
                return data.tags.length > 1;
              },
              value: {
                get({ focusArea }: EditorResult<Data>) {
                  return focusArea.index;
                },
                set({ data, focusArea }: EditorResult<Data>, val: string) {
                  const { index } = focusArea;
                  data.tags.splice(index, 1);
                }
              }
            }
          ]
        }
      ];
      cate2.title = '高级配置';
      cate2.items = [
        {
          title: '可选择',
          type: 'switch',
          description: '标签选择功能与关闭功能互斥',
          ifVisible({}: EditorResult<Data>) {
            return !tag.closable;
          },
          value: {
            get({}: EditorResult<Data>) {
              return !!tag.checkable;
            },
            set({ output }: EditorResult<Data>, val: boolean) {
              tag.checkable = val;
              if (val) {
                output.add('onChange', '选中状态改变时', { type: 'boolean' });
              } else if (output.get('onChange')) {
                output.remove('onChange');
              }
            }
          }
        },
        {
          title: '选中状态改变',
          type: '_Event',
          ifVisible({}: EditorResult<Data>) {
            return tag.checkable;
          },
          options: () => {
            return {
              outputId: 'onChange'
            };
          }
        },
        {
          title: '可关闭',
          type: 'switch',
          description: '标签关闭功能与选择功能互斥',
          ifVisible({}: EditorResult<Data>) {
            return !tag.checkable;
          },
          value: {
            get({}: EditorResult<Data>) {
              return !!tag.closable;
            },
            set({ output }: EditorResult<Data>, val: boolean) {
              tag.closable = val;
              if (val) {
                output.add('onClose', '标签关闭时', TagSchema);
              } else if (output.get('onClose')) {
                output.remove('onClose');
              }
            }
          }
        },
        {
          title: '标签关闭时',
          type: '_Event',
          ifVisible({}: EditorResult<Data>) {
            return tag.closable;
          },
          options: () => {
            return {
              outputId: 'onClose'
            };
          }
        }
      ];
    }
  }
};
