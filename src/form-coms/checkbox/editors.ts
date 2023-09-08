import { uuid } from '../../utils';
import { RuleKeys, defaultValidatorExample, defaultRules } from '../utils/validator';
import { Option } from '../types';
import { Data } from './types';
import { createrCatelogEditor } from '../utils';

export default {
  '@resize': {
    options: ['width']
  },
  '@init': ({ style }) => {
    style.width = '100%';
  },
  ':root': {
    style: [
      {
        items: [
          ...createrCatelogEditor({
            catelog: '默认',
            items: [
              {
                title: '选项标签',
                options: [{ type: 'font', config: { disableTextAlign: true } }],
                target: 'label.ant-checkbox-wrapper > span:nth-child(2)'
              },
              {
                title: '选择框',
                options: ['border'],
                target: '.ant-checkbox-inner'
              }
            ]
          }),
          ...createrCatelogEditor({
            catelog: 'Hover',
            items: [
              {
                title: '选择框',
                options: ['border'],
                target: '.ant-checkbox:hover .ant-checkbox-inner',
                domTarget: '.ant-checkbox-inner'
              }
            ]
          }),
          ...createrCatelogEditor({
            catelog: '选中',
            items: [
              {
                title: '选择框',
                options: [
                  'border',
                  'BoxShadow',
                  { type: 'background', config: { disableBackgroundImage: true } }
                ],
                target: '.ant-checkbox-checked .ant-checkbox-inner'
              },
              {
                title: '选择框勾选符号',
                options: [
                  {
                    type: 'border',
                    config: {
                      disableBorderWidth: true,
                      disableBorderStyle: true,
                      disableBorderRadius: true
                    }
                  }
                ],
                target: '.ant-checkbox-checked:not(.ant-checkbox-disabled) .ant-checkbox-inner:after'
              }
            ]
          }),
          ...createrCatelogEditor({
            catelog: '禁用',
            items: [
              {
                title: '选项标签',
                options: [{ type: 'font', config: { disableTextAlign: true } }],
                target:
                  'label.ant-checkbox-wrapper.ant-checkbox-wrapper-disabled > span:nth-child(2)'
              },
              {
                title: '选择框',
                options: [
                  { type: 'border', config: { useImportant: true } },
                  { type: 'background', config: { disableBackgroundImage: true } }
                ],
                target: '.ant-checkbox.ant-checkbox-disabled .ant-checkbox-inner'
              },
              {
                title: '选择框勾选符号',
                options: [
                  {
                    type: 'border',
                    config: {
                      disableBorderWidth: true,
                      disableBorderStyle: true,
                      disableBorderRadius: true
                    }
                  }
                ],
                target: '.ant-checkbox.ant-checkbox-disabled .ant-checkbox-inner:after'
              }
            ]
          })
        ]
      }
    ],
    items: ({ data }: EditorResult<{ type }>, ...catalog) => {
      catalog[0].title = '常规';

      catalog[0].items = [
        {
          title: '禁用状态',
          type: 'switch',
          description: '是否禁用状态',
          value: {
            get({ data }) {
              return data.config.disabled;
            },
            set({ data }, value: boolean) {
              data.config.disabled = value;
            }
          }
        },
        {
          title: '全选框',
          type: 'switch',
          description: '是否使用全选框',
          value: {
            get({ data }) {
              return data.checkAll;
            },
            set({ data }, value: boolean) {
              data.checkAll = value;
            }
          }
        },
        {
          title: '全选框标签',
          type: 'text',
          description: '修改全选框的文案',
          ifVisible({ data }: EditorResult<Data>) {
            return data.checkAll;
          },
          value: {
            get({ data }: EditorResult<Data>) {
              return data.checkAllText;
            },
            set({ data }: EditorResult<Data>, value: string) {
              data.checkAllText = value;
            }
          }
        },
        // 选项配置
        {
          title: '静态选项配置',
          type: 'array',
          options: {
            getTitle: ({ label, checked }) => {
              return `${label}${checked ? ': 默认值' : ''}`;
            },
            onAdd: () => {
              const value = uuid('_', 2);
              const defaultOption = {
                label: `选项${value}`,
                value: `选项${value}`,
                type: 'default',
                key: uuid()
              };
              return defaultOption;
            },
            items: [
              {
                title: '默认选中',
                type: 'switch',
                value: 'checked'
              },
              {
                title: '禁用',
                type: 'switch',
                value: 'disabled'
              },
              {
                title: '选项标签',
                type: 'textarea',
                value: 'label'
              },
              {
                title: '选项值',
                type: 'valueSelect',
                options: ['text', 'number', 'boolean'],
                description: '选项的唯一标识，可以修改为有意义的值',
                value: 'value'
              }
            ]
          },
          value: {
            get({ data, focusArea }: EditorResult<Data>) {
              return data.staticOptions;
            },
            set({ data, focusArea }: EditorResult<Data>, options: Option[]) {
              const values: any[] = [];
              let renderError = false;
              options.forEach(({ checked, value }) => {
                if (checked) values.push(value);
                if (value === undefined) renderError = true;
              });

              data.renderError = renderError;
              data.value = values as any;
              data.staticOptions = options;
              data.config.options = options;
            }
          }
        },
        {
          title: '布局',
          description: '水平排列和垂直排列',
          type: 'select',
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
          value: {
            get({ data }) {
              return data.layout;
            },
            set({ data }, value: boolean) {
              data.layout = value;
            }
          }
        },
        {
          title: '校验规则',
          description: '提供快捷校验配置',
          type: 'ArrayCheckbox',
          options: {
            checkField: 'status',
            visibleField: 'visible',
            getTitle: ({ title }: any) => {
              return title;
            },
            items: [
              // {
              //   title: '提示文字',
              //   description: '提示文字的表达式（{}, =, <, >, ||, &&）, 例：${label}不能为空',
              //   type: 'EXPRESSION',
              //   options: {
              //     autoSize: true,
              //     placeholder: '例：${label}不能为空',
              //     // suggestions: getSuggestions(true),
              //   },
              //   value: 'message'
              // },
              {
                title: '提示文字',
                type: 'Text',
                value: 'message',
                ifVisible(item: any, index: number) {
                  return item.key === RuleKeys.REQUIRED;
                }
              },
              {
                title: '编辑校验规则',
                type: 'code',
                options: {
                  language: 'javascript',
                  enableFullscreen: false,
                  title: '编辑校验规则',
                  width: 600,
                  minimap: {
                    enabled: false
                  },
                  babel: true,
                  eslint: {
                    parserOptions: {
                      ecmaVersion: '2020',
                      sourceType: 'module'
                    }
                  }
                },
                ifVisible(item: any, index: number) {
                  return item.key === RuleKeys.CODE_VALIDATOR;
                },
                value: 'validateCode'
              }
            ]
          },
          value: {
            get({ data }) {
              return data?.rules?.length > 0 ? data.rules : defaultRules;
            },
            set({ data }, value: any) {
              data.rules = value;
            }
          }
        },
        {
          title: '事件',
          items: [
            {
              title: '值初始化',
              type: '_event',
              options: {
                outputId: 'onInitial'
              }
            },
            {
              title: '值更新',
              type: '_event',
              options: {
                outputId: 'onChange'
              }
            }
          ]
        }
      ];
    }
  }
};
