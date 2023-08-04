import { Data, FormItems, ExtralFormItem } from './types'
import { labelWidthTypes } from './constants'
import { typeCheck } from '../../utils'

export function getLabelCol(data: Data) {
  const labelCol = data.labelWidthType === labelWidthTypes.SPAN
    ? { span: data.labelCol }
    : { flex: `0 0 ${data.labelWidth ? data.labelWidth : 98}px` }

  return labelCol
}

export function isObject(val: any) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
  * 设置表单项公共配置
  * @param formItemsProps 表单项配置对象
  */
export const setFormItemsProps = (formItemsProps: { string: FormItems }, { data }: { data: Data }) => {
  if (typeCheck(formItemsProps, ['Object'])) {
    Object.entries(formItemsProps).map(([name, props]) => {
      if (!typeCheck(props, ['Object'])) {
        console.warn(`表单项配置不是对象类型`);
        return;
      }

      const formItemIndex = data.items.findIndex((item) => (item.name || item.label) === name);
      if (formItemIndex < 0) {
        console.warn(`表单项${name}不存在`);
        return;
      }

      const formItem = data.items[formItemIndex];
      const newFormItem = { ...props };
      const { descriptionStyle, labelStyle } = formItem;
      if (!newFormItem.descriptionStyle) newFormItem.descriptionStyle = {};
      if (!newFormItem.labelStyle) newFormItem.labelStyle = {};
      Object.assign(newFormItem.descriptionStyle, descriptionStyle);
      Object.assign(newFormItem.labelStyle, labelStyle);

      const temp = {
        ...formItem,
        ...props
      };
      data.items[formItemIndex] = temp;
    });
  }
};

export const getFormItem = (data: Data, com): { item: FormItems, isFormItem: true } | { item: ExtralFormItem, isFormItem: false } => {
  const { items, extralItems } = data;
  console.log(items,extralItems)
  const item = items.find((item) => {
    if (item.comName) {
      return item.comName === com.name
    }

    return item.id === com.id
  });
  if (item) return { item, isFormItem: true };

  const extralItem = extralItems.find((item) => {
    if (item.comName) {
      return item.comName === com.name
    }
    return item.id === com.id
  });
  return { item: extralItem, isFormItem: false };
}