/**
 * 使用树形选择器完成字段映射
 */
import React, { useCallback, useState } from 'react';
import { Tag, Input, TreeSelect, Button } from 'antd';
import classnames from 'classnames';
import css from './index.less';

const typeMap = {
  array: '列表',
  object: '对象',
  number: '数字',
  string: '字符串',
  boolean: '布尔值'
};

export function schema2Options(schema: any = {}, parentKey = '', config: any = {}) {
  const { isRoot = false, noType } = config;
  const { type } = schema;
  const list: any = [];
  if (type !== 'object' && type !== 'array') return;
  const properties = (type === 'object' ? schema.properties : schema.items?.properties) || {};
  Object.keys(properties).forEach((key) => {
    const subSchema = properties[key];
    const item: any = {};
    item.label = key;
    // item.label = noType ? (
    //   key
    // ) : (
    //   <div>
    //     <span className={css.gap}>{key}</span>
    //     <Tag>{typeMap[subSchema.type]}</Tag>
    //   </div>
    // );
    item.value = isRoot ? key : `${parentKey}.${key}`;
    item.type = subSchema.type;
    if (properties[key]?.type === 'object') {
      item.children = schema2Options(properties[key], item.value, { ...config, isRoot: false });
    }
    list.push(item);
  });
  return list;
}

const isUseSelect = (options, val) => {
  if (Array.isArray(options) && options.length) {
    return options.some((item) => {
      if (item.value === val) {
        return true;
      }
      return isUseSelect(item.children, val);
    });
  } else {
    return false;
  }
};
export default function Tree({ editConfig }: any) {
  const { value, schema = {}, placeholder, disabled } = editConfig.value.get() || {};
  const options = schema2Options(schema, '', { isRoot: true, useArray: false });
  const [useTreeSelect, setUseTreeSelect] = useState(isUseSelect(options, value));

  const onChange = useCallback((val) => {
    if (value !== val) {
      editConfig.value.set(val);
    }
  }, []);

  return (
    <div className={classnames(css.wrap, 'fangzhou-theme')}>
      {useTreeSelect && !!options?.length ? (
        <TreeSelect
          defaultValue={value}
          className={css.treeSelect}
          treeData={options}
          onChange={onChange}
          showSearch
          treeDefaultExpandAll
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <Input
          className={css.input}
          defaultValue={value}
          onBlur={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {!!options?.length ? (
        <Button
          size="small"
          onClick={() => {
            setUseTreeSelect(!useTreeSelect);
          }}
          className={css.btn}
          disabled={disabled}
        >
          {useTreeSelect ? '选择' : '输入'}
        </Button>
      ) : null}
    </div>
  );
}
