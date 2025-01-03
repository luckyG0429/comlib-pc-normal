import React from 'react';
import visibleOpt from '../../../components/editorRender/visibleOpt';
import { setDataSchema } from '../../schema';
import { ContentTypeEnum, Data, IColumn, TableLayoutEnum, WidthTypeEnum } from '../../types';
import { getNewColumn, setColumns } from '../../utils';
import { message } from 'antd';
import { ColorMap } from '../../constants';
import { uuid } from '../../../utils';

const getAddColumnEditor = ({ data, env }: EditorResult<Data>) => {
  return {
    title: '列',
    items: [
      {
        title: '显示列名',
        type: 'switch',
        description: '控制是否显示每列的列名，关闭后，只显示表格内容区域',
        value: {
          get({ data }: EditorResult<Data>) {
            return data.showHeader === false ? false : true;
          },
          set({ data }: EditorResult<Data>, value: boolean) {
            data.showHeader = value;
          }
        }
      },
      {
        title: '列宽分配',
        type: 'Select',
        options: [
          { label: '固定列宽(不自动适配)', value: TableLayoutEnum.FixedWidth },
          { label: '按比例分配多余宽度', value: TableLayoutEnum.Fixed },
          { label: '按比例适配（无横向滚动条）', value: TableLayoutEnum.Auto }
        ],
        value: {
          get({ data }: EditorResult<Data>) {
            return data.tableLayout || TableLayoutEnum.Fixed;
          },
          set({ data }: EditorResult<Data>, value: TableLayoutEnum) {
            data.tableLayout = value;
          }
        }
      },
      {
        title: '',
        type: 'array',
        description: '手动添加表格列',
        options: {
          addText: '添加列',
          editable: true,
          customOptRender: visibleOpt,
          handleDelete: (item: IColumn) => item?.isRowKey,
          tagsRender: (item: IColumn) => (item?.isRowKey ? [{ text: 'Key' }] : []),
          getTitle: (item: IColumn) => {
            const path = Array.isArray(item.dataIndex) ? item.dataIndex.join('.') : item.dataIndex;
            const { color, text } = ColorMap[item.dataSchema?.type] || ColorMap.string;
            if (item.visible) {
              return (
                <>
                  <span style={{ color }}>{text}</span>
                  <span>
                    【{item.width === WidthTypeEnum.Auto ? '自适应' : `${item.width}px`}】
                    {env.i18n(item.title)}
                    {path ? `(${path})` : ''}
                  </span>
                </>
              );
            } else {
              return (
                <>
                  <span style={{ color }}>{text}</span>
                  <span>
                    【隐藏】{env.i18n(item.title)}({path})
                  </span>
                </>
              );
            }
          },
          onAdd: () => {
            return getNewColumn(data);
          },
          items: [
            {
              title: '列名',
              type: 'TextArea',
              options: {
                locale: true,
                autoSize: { minRows: 2, maxRows: 2 }
              },
              value: 'title'
            },
            {
              title: '字段',
              type: 'Text',
              value: 'dataIndex',
              options: {
                placeholder: '不填默认使用 列名 作为字段'
              }
            },
            {
              title: '设置为唯一key',
              type: 'switch',
              value: 'isRowKey',
              description:
                '当表格数据太大导致卡顿时，可以通过添加【行标识字段】进行性能优化。该标识字段的值需要全局唯一。此外也可以当作设置勾选数据时的标识',
              ifVisible() {
                // 存量升级前不展示
                return typeof data?.hasUpdateRowKey !== 'undefined';
              }
            },
            {
              title: '适应剩余宽度',
              type: 'switch',
              // 添加额外字段用来标记是否自动
              value: 'isAutoWidth',
              ifVisible(item: IColumn) {
                return item.contentType !== ContentTypeEnum.Group;
              },
              options: {
                type: 'number'
              }
            },
            {
              title: '宽度',
              type: 'Text',
              value: 'width',
              ifVisible(item: IColumn) {
                return (
                  item.contentType !== ContentTypeEnum.Group && item.width !== WidthTypeEnum.Auto
                );
              },
              options: {
                type: 'number'
              }
            }
          ]
        },
        value: {
          get({ data }: EditorResult<Data>) {
            return [
              ...data.columns.map((item) => ({
                ...item,
                isAutoWidth: item.width === WidthTypeEnum.Auto
              }))
            ];
          },
          set({ data, output, input, slot, ...res }: EditorResult<Data>, val: IColumn[]) {
            let newRowKey = data?.rowKey;
            for (let item of val) {
              if (item.dataIndex === '') {
                item.dataIndex = item.title;
                message.warn(`表格列字段不能为空！`);
              }

              // 保证每次只有一个isRowKey是true
              if (item?.isRowKey && data.rowKey !== item.dataIndex) {
                newRowKey = String(item.dataIndex);
              }
              // 开启唯一key之后不能取消
              else if (data.rowKey === item.dataIndex && !item?.isRowKey) {
                // @ts-ignore
                item._renderKey = uuid(); // 新增一个随机的值renderKey刷新防止不更新
                message.warn(`必须设置一个唯一key`);
              }
            }

            data.rowKey = newRowKey;

            const cols = val.map((item) => ({
              ...item,
              // width: item.isAutoWidth
              //   ? WidthTypeEnum.Auto
              //   : item.width === WidthTypeEnum.Auto
              //     ? 'auto'
              //     : Number(item.width),
              width: item.isAutoWidth ? WidthTypeEnum.Auto : Number(item.width) || 140,
              isAutoWidth: undefined,
              isRowKey: data?.rowKey && item?.dataIndex === data?.rowKey
            }));
            setColumns({ data, slot }, cols);
            setDataSchema({ data, output, input, slot, ...res });
          }
        }
      }
    ]
  };
};

export default getAddColumnEditor;
