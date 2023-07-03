import { message } from 'antd';
import { Data, FormItemColonType, LabelWidthType, FormItems } from '../types';
import { FormLayout } from 'antd/es/form/Form';
import { ButtonType } from 'antd/es/button/button';
import { actionsEditor } from './actions';
import { inputIds, outputIds } from '../constants';
import { refreshSchema, refreshParamsSchema, refreshFormItemPropsSchema } from '../schema';
import { getFormItem } from '../utils';
import { uuid } from '../../../utils';

import DomainFieldEditor from './DomainFieldEditor';

function fieldNameCheck(data: Data, name: string) {
  const fieldNameList = data.items.map((item) => item.name);
  if (fieldNameList.includes(name)) {
    return true;
  } else {
    return false;
  }
}

function getFormItemProp(
  { data, ...com }: { data: Data; id: string; name: string },
  name: keyof FormItems
) {
  try {
    const item = getFormItem(data.items, { id: com.id, name: com.name });

    return item?.[name];
  } catch (e) {
    console.error(e);
  }
}
function setFormItemProps(
  { data, ...com }: { data: Data; id: string; name: string },
  name: keyof FormItems,
  value: any
) {
  try {
    const item = getFormItem(data.items, { id: com.id, name: com.name }) || {};

    item[name] = value;
  } catch (e) {
    console.error(e);
  }
}

export default {
  // '@init' ({ data, inputs, outputs, slots }) {
  //   console.log(data.domainModel, slots)
  // },
  '@inputConnected'({ data, outputs }, fromPin, toPin) {
    if (toPin.id === inputIds.SUBMIT_AND_MERGE) {
      if (fromPin.schema.type === 'object') {
        data.paramsSchema = fromPin.schema;
      } else {
        data.paramsSchema = {};
      }
      refreshParamsSchema(data, outputs);
    }
  },
  '@inputDisConnected'({ data, outputs }, fromPin, toPin) {
    if (toPin.id === inputIds.SUBMIT_AND_MERGE) {
      data.paramsSchema = {};
      refreshParamsSchema(data, outputs);
    }
  },
  '@childAdd'({ data, inputs, outputs, logs, slots }, child, curSlot) {
    if (curSlot.id === 'content') {
      const { id, inputDefs, outputDefs, name } = child;
      const item = data.items.find((item) => item.id === id);
      const com = outputDefs.find((item) => item.id === 'returnValue');

      if (item) {
        item.schema = com.schema;
      } else {
        const nowC = data.nameCount++;

        data.items.push({
          id,
          comName: name,
          schema: com.schema,
          name: '',
          label: `表单项${nowC}`,
          widthOption: 'span',
          span: 24 / data.formItemColumn,
          colon: 'default',
          labelAlign: 'default',
          labelAutoWrap: 'default',
          hiddenLabel: false,
          descriptionStyle: {
            whiteSpace: 'pre-wrap',
            lineHeight: '12px',
            letterSpacing: '0px',
            fontSize: '12px',
            fontWeight: 400,
            color: 'rgba(0, 0, 0, 0.45)',
            fontStyle: 'normal'
          },
          labelStyle: {
            lineHeight: '14px',
            letterSpacing: '0px',
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(0, 0, 0, 0.85)',
            fontStyle: 'normal'
          },
          inlineMargin: [0, 16, 24, 0],
          visible: true
        });
      }

      refreshSchema({ data, inputs, outputs, slots });
    }
  },
  '@childRemove'({ data, inputs, outputs, logs, slots }, child) {
    const { id, name, title } = child;

    data.items = data.items.filter((item) => {
      if (item?.comName) {
        return item.comName !== name;
      }

      return item.id !== id;
    });

    refreshSchema({ data, inputs, outputs, slots });
  },
  // '@_setFormItem'({data, inputs, outputs, children, logs, slots}, {id, schema}) {//As schema
  //   const item = data.items.find(item => item.id === id)
  //   // console.log('_setFormItem', id)
  //   if (item) {
  //     // console.log('_setFormItem item')
  //     item.schema = schema
  //   } else {
  //     const nowC = data.nameCount++

  //     data.items.push({
  //       id,
  //       schema,
  //       name: `item${nowC}`,
  //       label: `表单项${nowC}`,
  //       span: 24,
  //       visible: true,
  //     })
  //   }
  //   refreshSchema({data, inputs, outputs, slots})
  // },
  '@parentUpdated'({ id, data, parent }, { schema }) {
    if (schema === 'mybricks.normal-pc.form-container/form-item') {
      // parent['@_setFormItem']({id, schema: { type: 'object', properties: {} }})
      data.isFormItem = true;
      data.actions.visible = false;
    } else {
      data.isFormItem = false;
    }

    if (
      schema !== 'mybricks.domain-pc.crud/query' &&
      schema !== 'mybricks.domain-pc.crud/createModal' &&
      schema !== 'mybricks.domain-pc.crud/editModal'
    ) {
      if (data.domainModel.entity) {
        data.domainModel = {
          entity: undefined,
          type: '',
          queryFieldRules: undefined
        };
      }
    }
  },
  // '@init': ({ data, setDesc, setAutoRun, isAutoRun, slot }) => {
  //   console.log('@init', slot.get('content'))
  // },
  ':root': ({ data, output }: EditorResult<Data>, cate1, cate2) => {
    cate1.items = [
      {
        title: '布局',
        items: [
          {
            title: '类型',
            type: 'Select',
            options: [
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' },
              { label: '内联', value: 'inline' }
              // { label: '自由', value: 'absolute' },
            ],
            value: {
              get({ data }: EditorResult<Data>) {
                return data.config?.layout || data.layout;
              },
              set({ data, inputs }: EditorResult<Data>, value: FormLayout) {
                data.config.layout = value;
                // refreshFormItemPropsSchema({ data, inputs });
              }
            }
          },
          {
            title: '每行列数',
            type: 'Slider',
            description:
              '每行的表单项个数，可以实现平均分布各表单项及操作项，仅对“宽度配置”为“24栅格”的表单项及操作项生效',
            options: [{ max: 6, min: 1, steps: 1, formatter: '个/行' }],
            value: {
              get({ data }: EditorResult<Data>) {
                return data.formItemColumn;
              },
              set({ data }: EditorResult<Data>, value: number) {
                data.formItemColumn = value;
                data.actions.span = 24 / value;
                data.items.forEach((item) => {
                  item.span = 24 / value;
                });
              }
            }
          }
          // {
          //   title: '表单项',
          //   items: [

          //   ]
          // }
        ]
      },
      {
        title: '添加表单项',
        type: 'comSelector',
        options: {
          schema: 'mybricks.normal-pc.form-container/*',
          type: 'add'
        },
        value: {
          set({ data, slot }: EditorResult<Data>, namespace: string) {
            slot.get('content').addCom(namespace, false, { deletable: true, movable: true });
          }
        }
      },
      {
        title: '提交隐藏表单项',
        type: 'Switch',
        description: '提交时收集被隐藏的表单项字段并进行校验',
        value: {
          get({ data }: EditorResult<Data>) {
            return data.submitHiddenFields;
          },
          set({ data }: EditorResult<Data>, val: boolean) {
            data.submitHiddenFields = val;
          }
        }
      },
      {
        title: '标题',
        ifVisible({ data }: EditorResult<Data>) {
          return (data.config?.layout || data.layout) === 'horizontal';
        },
        items: [
          {
            title: '宽度类型',
            type: 'Select',
            options: [
              { label: '固定像素', value: 'px' },
              { label: '24 栅格', value: 'span' }
            ],
            value: {
              get({ data }: EditorResult<Data>) {
                return data.labelWidthType;
              },
              set({ data }: EditorResult<Data>, value: LabelWidthType) {
                data.labelWidthType = value;
              }
            }
          },
          {
            title: '标题宽度(px)',
            type: 'inputNumber',
            options: [{ min: 1 }],
            ifVisible({ data }: EditorResult<Data>) {
              return data.labelWidthType === 'px';
            },
            value: {
              get({ data }: EditorResult<Data>) {
                return [data.labelWidth];
              },
              set({ data }: EditorResult<Data>, value: number) {
                data.labelWidth = value[0];
              }
            }
          },
          {
            title: '标题宽度(栅格)',
            type: 'Slider',
            options: [{ max: 24, min: 1, steps: 1, formatter: '格' }],
            ifVisible({ data }: EditorResult<Data>) {
              return data.labelWidthType === 'span';
            },
            value: {
              get({ data }: EditorResult<Data>) {
                return data.labelCol;
              },
              set({ data }: EditorResult<Data>, value: number) {
                data.labelCol = value;
              }
            }
          },
          {
            title: '显示冒号',
            type: 'Switch',
            value: {
              get({ data }: EditorResult<Data>) {
                return data.config?.colon || data.colon;
              },
              set({ data }: EditorResult<Data>, value: boolean) {
                data.config.colon = value;
              }
            }
          },
          {
            title: '自动换行',
            type: 'Switch',
            value: {
              get({ data }: EditorResult<Data>) {
                return data.config?.labelWrap;
              },
              set({ data }: EditorResult<Data>, value: boolean) {
                data.config.labelWrap = value;
              }
            }
          },
          {
            title: '对齐方式',
            type: 'Radio',
            options: [
              { label: '左对齐', value: 'left' },
              { label: '右对齐', value: 'right' }
            ],
            value: {
              get({ data }: EditorResult<Data>) {
                return data.config?.labelAlign;
              },
              set({ data }: EditorResult<Data>, value: 'left' | 'right') {
                data.config.labelAlign = value;
              }
            }
          }
        ]
      },
      // {
      //   title: '禁用状态',
      //   type: 'Switch',
      //   description: '开启后，所以表单项和操作项都会被禁用',
      //   value: {
      //     get({ data }: EditorResult<Data>) {
      //       return data.config.disabled
      //     },
      //     set({ data }: EditorResult<Data>, val: boolean) {
      //       data.config.disabled = val
      //     }
      //   }
      // },
      {
        title: '事件',
        items: [
          {
            title: '字段值更新',
            type: '_event',
            options({ data }) {
              return {
                outputId: outputIds.ON_VALUES_CHANGE
              };
            }
          }
        ]
      }
    ];

    if (!data.isFormItem) {
      cate2.title = actionsEditor(data, output).title;
      cate2.items = actionsEditor(data, output).items;
    }
  },
  ':child(mybricks.normal-pc.form-container/form-item)': {
    title: '表单项',
    style: [
      {
        title: '标题样式',
        options: ['font'],
        target: ({ comId, comName, ...arg }) => {
          const selector = `#${comId} > div.ant-row.ant-form-item > div.ant-col.ant-form-item-label`;
          console.log(selector, 'selector');
          return selector;
          return `div.ant-row.ant-form-item > div.ant-col.ant-form-item-label`;
        }
      }
    ],
    items: [
      {
        title: '显示标题',
        type: 'Switch',
        value: {
          get({ id, data, name }: EditorResult<Data>) {
            return !getFormItemProp({ data, id, name }, 'hiddenLabel');
          },
          set({ id, data, name }: EditorResult<Data>, val) {
            setFormItemProps({ data, id, name }, 'hiddenLabel', !val);
          }
        }
      },
      {
        title: '标题',
        type: 'text',
        ifVisible({ id, data, name }: EditorResult<Data>) {
          return !getFormItemProp({ data, id, name }, 'hiddenLabel');
        },
        value: {
          get({ id, data, name }: EditorResult<Data>) {
            return getFormItemProp({ data, id, name }, 'label');
          },
          set({ id, name, data, slot }: EditorResult<Data>, val) {
            const item = getFormItem(data.items, { id, name });

            if (item) {
              if (item?.slotAfter) {
                slot.setTitle(item?.slotAfter, getSlotAfterTitle(val));
              }

              item['label'] = val;
              // setFormItemProps({ data, id }, 'label', val);
            }
          }
        }
      },
      {
        title: '字段',
        type: 'text',
        ifVisible({ id, name, data }: EditorResult<Data>) {
          return !data.domainModel?.entity?.fieldAry;
        },
        value: {
          get({ id, data, name }: EditorResult<Data>) {
            const item = getFormItem(data.items, { id, name });

            return item?.name || item?.label;
          },
          set({ id, data, name, input, output, slots }: EditorResult<Data>, val: string) {
            val = val.trim();
            if (!val) {
              return message.warn('字段名不能为空');
            }

            const item = getFormItem(data.items, { id, name });

            if (item && item.name !== val) {
              if (fieldNameCheck(data, val)) {
                return message.warn('字段名不能重复');
              }
              item.name = val;

              refreshSchema({ data, inputs: input, outputs: output, slots });
            }
          }
        }
      },
      {
        title: '字段',
        type: 'EditorRender',
        ifVisible({ id, name, data }: EditorResult<Data>) {
          return !!data.domainModel?.entity?.fieldAry;
        },
        options: ({ data }: EditorResult<Data>) => {
          return {
            render: DomainFieldEditor,
            domainModel: data.domainModel
          };
        },
        value: {
          get({ id, data, name }: EditorResult<Data>) {
            const item = getFormItem(data.items, { id, name });

            return item?.name ? item?.name : undefined;
          },
          set({ id, data, name, input, output, slots }: EditorResult<Data>, val: string) {
            val = val.trim();
            if (!val) {
              return message.warn('字段名不能为空');
            }

            const item = getFormItem(data.items, { id, name });

            if (item && item.name !== val) {
              if (fieldNameCheck(data, val)) {
                return message.warn('字段名不能重复');
              }
              const oldRules = data.domainModel?.queryFieldRules?.[item.name || item.label];

              if (oldRules) {
                data.domainModel.queryFieldRules[val] = oldRules;
                delete data.domainModel.queryFieldRules[item.name || item.label];
              }

              item.name = val;
              item['label'] = val;

              refreshSchema({ data, inputs: input, outputs: output, slots });
            }
          }
        }
      },
      {
        title: '检索规则',
        type: 'Select',
        ifVisible({ id, name, data }: EditorResult<Data>) {
          return (
            data.domainModel?.entity?.fieldAry?.length > 0 &&
            data.domainModel?.isQuery &&
            data.domainModel?.type === 'domain'
          );
        },
        options() {
          return {
            options: [
              { label: '等于(=)', value: '=' },
              { label: '不等于(<>)', value: '<>' },
              { label: '匹配(LIKE)', value: 'LIKE' },
              { label: '不匹配(NOT LIKE)', value: 'NOT LIKE' },
              { label: '包含(IN)', value: 'IN' },
              { label: '不包含(NOT IN)', value: 'NOT IN' }
            ],
            placeholder: '请选择检索规则'
          };
        },
        value: {
          get({ id, name, data }: EditorResult<Data>) {
            const item = data.domainModel?.queryFieldRules?.[name];

            return item?.operator;
          },
          set({ id, name, data }: EditorResult<Data>, value: string) {
            const item = getFormItem(data.items, { id, name });

            if (item) {
              if (!data.domainModel.queryFieldRules) {
                data.domainModel.queryFieldRules = {};
              }

              data.domainModel.queryFieldRules[item?.name || item.label] = {
                operator: value
              };
            }
            // console.log(data.domainModel.queryFieldRules)
          }
        }
      },
      {
        title: '标题提示',
        type: 'Text',
        ifVisible({ id, name, data }: EditorResult<Data>) {
          return !getFormItemProp({ data, id, name }, 'hiddenLabel');
        },
        description: '展示在标题后面的悬浮提示内容',
        value: {
          get({ id, name, data }: EditorResult<Data>) {
            return getFormItemProp({ data, id, name }, 'tooltip');
          },
          set({ id, name, data }: EditorResult<Data>, value: string) {
            setFormItemProps({ data, id, name }, 'tooltip', value);
          }
        }
      },
      {
        title: '提示语',
        type: 'Text',
        description: '展示在表单项下方的提示内容',
        value: {
          get({ id, name, data }: EditorResult<Data>) {
            return getFormItemProp({ data, id, name }, 'description');
          },
          set({ id, name, data }: EditorResult<Data>, value: string) {
            setFormItemProps({ data, id, name }, 'description', value);
          }
        }
      },
      {
        title: '后置插槽',
        type: 'Switch',
        value: {
          get({ id, name, data }: EditorResult<Data>) {
            return getFormItemProp({ data, id, name }, 'slotAfter');
          },
          set({ id, name, data, slot }: EditorResult<Data>, value) {
            const item = getFormItem(data.items, { id, name });
            if (value && item) {
              const slotId = uuid();
              item['slotAfter'] = slotId;
              // setFormItemProps({ data, id }, 'slotAfter', slotId);
              slot.add({ id: slotId, title: getSlotAfterTitle(item?.label) });
            } else {
              const slotAfter = getFormItemProp({ data, id, name }, 'slotAfter');

              if (slot.get(slotAfter)) {
                slot.remove(slotAfter);
                setFormItemProps({ data, id, name }, 'slotAfter', '');
              }
            }
          }
        }
      },
      {
        title: '样式',
        items: [
          {
            title: '宽度模式',
            type: 'Select',
            options: [
              {
                label: '24栅格',
                value: 'span'
              },
              {
                label: '固定宽度(px)',
                value: 'px'
              }
            ],
            value: {
              get({ data, name, id }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'widthOption');
              },
              set({ data, id, name, inputs }: EditorResult<Data>, value: LabelWidthType) {
                setFormItemProps({ data, id, name }, 'widthOption', value);
                refreshFormItemPropsSchema({ data, inputs });
              }
            }
          },
          {
            title: '宽度配置(共24格)',
            type: 'Slider',
            options: [
              {
                max: 24,
                min: 1,
                step: 1,
                formatter: '/24'
              }
            ],
            ifVisible({ data, id, name }: EditorResult<Data>) {
              const item = getFormItem(data.items, { id, name });

              return item?.widthOption !== 'px';
            },
            value: {
              get({ data, id, name }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'span');
              },
              set({ data, id, name }: EditorResult<Data>, value: number) {
                setFormItemProps({ data, id, name }, 'span', value);
              }
            }
          },
          {
            title: '宽度配置(px)',
            type: 'text',
            options: {
              type: 'number'
            },
            ifVisible({ data, id, name }: EditorResult<Data>) {
              const item = getFormItem(data.items, { id, name });
              return item?.widthOption === 'px';
            },
            value: {
              get({ data, id, name }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'width');
              },
              set({ data, id, name }: EditorResult<Data>, value: number) {
                setFormItemProps({ data, id, name }, 'width', value);
              }
            }
          },
          {
            title: '边距',
            type: 'inputNumber',
            options: [
              { min: 0, title: '上' },
              { min: 0, title: '右' },
              { min: 0, title: '下' },
              { min: 0, title: '左' }
            ],
            ifVisible({ data }: EditorResult<Data>) {
              /**
               * 领域模型查询区内，为保持样式统一 暂时不支持边距自定义
               */
              return (
                (data.config?.layout || data.layout) !== 'horizontal' &&
                !(data.domainModel?.entity?.fieldAry?.length > 0 && data.domainModel?.isQuery)
              );
            },
            value: {
              get({ id, data, name }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'inlineMargin');
              },
              set({ id, data, name }: EditorResult<Data>, value: number[]) {
                setFormItemProps({ data, id, name }, 'inlineMargin', value);
              }
            }
          },
          {
            title: '边距应用其它表单项及操作项',
            type: 'Button',
            ifVisible({ data }: EditorResult<Data>) {
              return (data.config?.layout || data.layout) !== 'horizontal';
            },
            value: {
              set({ id, data, name }: EditorResult<Data>) {
                const curItem = getFormItem(data.items, { id, name });

                const margin = curItem?.inlineMargin || [0, 16, 24, 0];
                data.items.forEach((item) => (item.inlineMargin = [...margin]));
                data.actions.inlinePadding = [...margin];
              }
            }
          },
          {
            title: '标题自动换行',
            type: 'Radio',
            ifVisible({ id, name, data }: EditorResult<Data>) {
              return !getFormItemProp({ data, id, name }, 'hiddenLabel');
            },
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
              { label: '跟随容器', value: 'default' }
            ],
            value: {
              get({ id, name, data }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'labelAutoWrap');
              },
              set({ id, name, data }: EditorResult<Data>, value: boolean) {
                setFormItemProps({ data, id, name }, 'labelAutoWrap', value);
              }
            }
          },
          {
            title: '标题对齐方式',
            type: 'Radio',
            ifVisible({ id, name, data }: EditorResult<Data>) {
              return !getFormItemProp({ data, id, name }, 'hiddenLabel');
            },
            options: [
              { label: '左对齐', value: 'left' },
              { label: '右对齐', value: 'right' },
              { label: '跟随容器', value: 'default' }
            ],
            value: {
              get({ id, name, data }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'labelAlign');
              },
              set({ id, name, data }: EditorResult<Data>, value: 'left' | 'right') {
                setFormItemProps({ data, id, name }, 'labelAlign', value);
              }
            }
          },
          {
            title: '标题冒号',
            type: 'Radio',
            ifVisible({ id, name, data }: EditorResult<Data>) {
              return !getFormItemProp({ data, id, name }, 'hiddenLabel');
            },
            description: '当标题配置为空时，始终不展示冒号',
            options: [
              { label: '显示', value: true },
              { label: '隐藏', value: false },
              { label: '跟随容器', value: 'default' }
            ],
            value: {
              get({ id, name, data }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'colon');
              },
              set({ id, name, data }: EditorResult<Data>, value: FormItemColonType) {
                setFormItemProps({ data, id, name }, 'colon', value);
              }
            }
          },
          {
            title: '标题样式',
            type: 'Style',
            options: {
              plugins: ['Font'],
              fontProps: {
                fontFamily: false,
                verticalAlign: false
              }
            },
            ifVisible({ id, name, data }: EditorResult<Data>) {
              return !getFormItemProp({ data, id, name }, 'hiddenLabel');
            },
            description: '表单项标题的字体样式',
            value: {
              get({ id, name, data }: EditorResult<Data>) {
                const item = getFormItem(data.items, { id, name });

                if (!item?.labelStyle) {
                  setFormItemProps({ data, id, name }, 'labelStyle', {
                    lineHeight: '14px',
                    letterSpacing: '0px',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'rgba(0, 0, 0, 0.85)',
                    fontStyle: 'normal'
                  });
                }
                return item?.labelStyle;
              },
              set({ id, name, data }: EditorResult<Data>, value: any) {
                const { styleEditorUnfold, ...style } = value;
                setFormItemProps({ data, id, name }, 'labelStyle', style);
              }
            }
          },
          {
            title: '标题样式应用所有表单项',
            type: 'Button',
            ifVisible({ id, name, data }: EditorResult<Data>) {
              return !getFormItemProp({ data, id, name }, 'hiddenLabel');
            },
            value: {
              set({ id, name, data }: EditorResult<Data>, value: {}) {
                const item = getFormItem(data.items, { id, name });

                const labelStyle = item?.labelStyle || {
                  lineHeight: '14px',
                  letterSpacing: '0px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'rgba(0, 0, 0, 0.85)',
                  fontStyle: 'normal'
                };

                data.items.forEach((item) => (item.labelStyle = labelStyle));
              }
            }
          },
          {
            title: '提示语样式',
            type: 'Style',
            options: {
              plugins: ['Font'],
              fontProps: {
                fontFamily: false,
                verticalAlign: false
              }
            },
            description: '表单项提示语的字体样式',
            value: {
              get({ id, name, data }: EditorResult<Data>) {
                const item = getFormItem(data.items, { id, name });

                if (!item?.descriptionStyle) {
                  setFormItemProps({ data, id, name }, 'descriptionStyle', {
                    whiteSpace: 'pre-wrap',
                    lineHeight: '12px',
                    letterSpacing: '0px',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'rgba(0, 0, 0, 0.45)',
                    fontStyle: 'normal'
                  });
                }
                return item?.descriptionStyle;
              },
              set({ id, name, data }: EditorResult<Data>, value: any) {
                const { styleEditorUnfold, ...style } = value;
                setFormItemProps({ data, id, name }, 'descriptionStyle', style);
              }
            }
          },
          {
            title: '提示语样式应用所有表单项',
            type: 'Button',
            value: {
              set({ id, name, data }: EditorResult<Data>) {
                const item = getFormItem(data.items, { id, name });

                const descriptionStyle = item?.descriptionStyle || {
                  whiteSpace: 'pre-wrap',
                  lineHeight: '12px',
                  letterSpacing: '0px',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'rgba(0, 0, 0, 0.45)',
                  fontStyle: 'normal'
                };

                data.items.forEach((item) => (item.descriptionStyle = descriptionStyle));
              }
            }
          },
          {
            title: '必填样式',
            type: 'Switch',
            value: {
              get({ id, name, data }: EditorResult<Data>) {
                return getFormItemProp({ data, id, name }, 'required');
              },
              set({ id, name, data }: EditorResult<Data>, value) {
                setFormItemProps({ data, id, name }, 'required', value);
              }
            }
          }
        ]
      }
    ]
  },
  '[data-form-actions]': {
    title: '操作区',
    items: ({ data, output }: EditorResult<Data>, cate1) => {
      cate1.title = actionsEditor(data, output).title;
      cate1.items = actionsEditor(data, output).items;
    }
  },
  '[data-form-actions-item]': {
    title: '操作',
    items: [
      {
        title: '显示',
        type: 'Switch',
        value: {
          get({ data, focusArea }: EditorResult<Data>) {
            const comId = focusArea.dataset.formActionsItem as string;
            return data.actions.items.find((item) => item.key === comId)?.visible;
          },
          set({ data, focusArea, output }: EditorResult<Data>, val) {
            const comId = focusArea.dataset['formActionsItem'];
            const item = data.actions.items.find((item) => item.key === comId);
            if (item) {
              item.visible = val;
            }
          }
        }
      },
      {
        title: '标题',
        type: 'text',
        value: {
          get({ data, focusArea }: EditorResult<Data>) {
            const comId = focusArea.dataset.formActionsItem as string;
            return comId && data.actions.items.find((item) => item.key === comId)?.title;
          },
          set({ data, focusArea, output }: EditorResult<Data>, val) {
            if (!val) {
              return message.warn('操作标题不能为空');
            }

            const comId = focusArea.dataset['formActionsItem'];
            const item = data.actions.items.find((item) => item.key === comId);
            if (item) {
              item.title = val;
              output.setTitle(item.outputId, `点击${item.title}`);
            }
          }
        }
      },
      {
        title: '风格',
        type: 'Select',
        options() {
          return [
            { value: 'primary', label: '主按钮' },
            { value: 'default', label: '次按钮' },
            { value: 'dashed', label: '虚线按钮' },
            { value: 'link', label: '链接按钮' },
            { value: 'text', label: '文字按钮' }
          ];
        },
        value: {
          get({ data, focusArea }: EditorResult<Data>) {
            const comId = focusArea.dataset.formActionsItem as string;

            return data.actions.items.find((item) => item.key === comId)?.type || 'default';
          },
          set({ data, focusArea }: EditorResult<Data>, value: ButtonType) {
            const comId = focusArea.dataset['formActionsItem'];
            const item = data.actions.items.find((item) => item.key === comId);

            if (item) {
              item.type = value;
            }
          }
        }
      },
      {
        title: '危险按钮',
        type: 'Switch',
        value: {
          get({ data, focusArea }: EditorResult<Data>) {
            const comId = focusArea.dataset.formActionsItem as string;

            return data.actions.items.find((item) => item.key === comId)?.danger;
          },
          set({ data, focusArea }: EditorResult<Data>, value: boolean) {
            const comId = focusArea.dataset['formActionsItem'];
            const item = data.actions.items.find((item) => item.key === comId);

            if (item) {
              item.danger = value;
            }
          }
        }
      },
      {
        title: '事件',
        items: [
          {
            title: '点击',
            type: '_event',
            options({ data, focusArea }) {
              const comId = focusArea.dataset['formActionsItem'];
              const item = data.actions.items.find((item) => item.key === comId);
              if (!item) return;

              return {
                outputId: item.outputId
              };
            }
          }
        ]
      },
      {
        title: '删除',
        type: 'Button',
        ifVisible({ data, focusArea }) {
          const actions = data.actions.items;
          const itemId = focusArea.dataset['formActionsItem'];
          const item = actions.find((item) => item.key === itemId);

          return item && !item?.isDefault;
        },
        value: {
          set({ data, output, focusArea }: EditorResult<Data>) {
            const actions = data.actions.items;
            const itemId = focusArea.dataset['formActionsItem'];
            const index = actions.findIndex((item) => item.key === itemId);
            const item = data.actions.items[index];

            output.remove(item.outputId);
            actions.splice(index, 1);
          }
        }
      }
    ]
  }
};

const getSlotAfterTitle = (label: string) => {
  return `${label}后置内容区`;
};
