import React, { useState, useRef, useEffect } from 'react';
import { message, Space, Tag, Input, InputRef } from 'antd';
import * as Icons from '@ant-design/icons';
import { Data, Tag as TagType } from './types';
import { uuid, createTag } from './editor/util';
import styles from './style.less';

const preset = ['success', 'processing', 'error', 'warning', 'default'];

export default function ({ env, data, inputs, outputs, slots }: RuntimeParams<Data>) {
  const { checkable } = data;

  inputs['dynamicTags'] &&
    inputs['dynamicTags']((val: Array<TagType>) => {
      if (!Array.isArray(val)) {
        message.error('请输入列表数据');
        return;
      }
      data.tags = val.map((item) => {
        if (!item.key) {
          item.key = uuid();
        }
        if (!item.color) {
          item.color = 'default';
        }
        return item;
      });
    });

  return checkable ? (
    <CheckTag data={data} outputs={outputs} />
  ) : (
    <DefaultTag data={data} outputs={outputs} env={env} />
  );
}

const DefaultTag = ({
  data,
  outputs,
  env
}: Pick<RuntimeParams<Data>, 'data' | 'outputs' | 'env'>) => {
  const { direction, align, wrap, size, tags, tagSize, appendAble } = data;
  const [inputVisible, setInputVisible] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const onTagClose = (index: number, tag: TagType) => {
    data.tags.splice(index, 1);
    outputs['onChange']({ changed: { ...tag, index }, allTag: data.tags });
  };

  const showInput = () => {
    if (env.edit) return;
    setInputVisible(true);
  };

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleInputConfirm = (e) => {
    const inputValue = e.target.value;
    if (!!inputValue) {
      if (!!tags.find((tag) => tag.content === inputValue)) {
        message.warn('标签已存在');
        return;
      }
      const newTag = createTag(inputValue);
      data.tags.push(newTag);
      outputs['onChange']({ changed: { ...newTag, index: data.tags.length }, allTag: data.tags });
    }
    setInputVisible(false);
  };
  return (
    <Space className={styles.wrap} direction={direction} align={align} wrap={wrap} size={size}>
      {tags.map((tag, index) => {
        const { key, content, color, textColor, borderColor, icon } = tag;
        const isPreset = preset.includes(color as string);
        return (
          <Tag
            key={key}
            className={styles[tagSize]}
            data-index={index}
            data-item-tag="tag"
            color={color}
            closable={!env.edit && appendAble}
            onClose={appendAble ? () => onTagClose(index, tag) : void 0}
            icon={Icons && Icons[icon as string]?.render()}
            style={!isPreset ? { color: textColor, borderColor } : {}}
          >
            {content}
          </Tag>
        );
      })}
      {appendAble &&
        (inputVisible ? (
          <Input
            ref={inputRef}
            type="text"
            size="small"
            style={{ width: 80 }}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        ) : (
          <Tag color="default" style={{ borderStyle: 'dashed' }} onClick={showInput}>
            <Icons.PlusOutlined />
            <span style={{ marginLeft: 3 }}>新增</span>
          </Tag>
        ))}
    </Space>
  );
};

const CheckTag = ({ data, outputs }: Pick<RuntimeParams<Data>, 'data' | 'outputs'>) => {
  const { direction, align, wrap, size, tags, tagSize } = data;
  const onTagChange = (index: number) => {
    const pre = data.tags[index];
    data.tags[index] = { ...pre, checked: !pre.checked };
    outputs['onCheck']({ changed: { ...data.tags[index], index }, allTag: data.tags });
  };
  return (
    <Space className={styles.wrap} direction={direction} align={align} wrap={wrap} size={size}>
      {tags.map((tag, index) => {
        const { key, checked, content, color, textColor, borderColor } = tag;
        const isPreset = preset.includes(color as string);
        return (
          <Tag.CheckableTag
            key={key}
            className={styles[tagSize]}
            data-index={index}
            data-item-tag="tag"
            checked={checked as boolean}
            style={!isPreset ? { color: textColor, borderColor } : {}}
            onChange={() => onTagChange(index)}
          >
            {content}
          </Tag.CheckableTag>
        );
      })}
    </Space>
  );
};
