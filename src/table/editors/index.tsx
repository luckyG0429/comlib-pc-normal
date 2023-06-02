import { InputIds } from '../constants';
import { Data } from '../types';
import { uuid } from '../../utils';
import { setDataSchema } from '../schema';
import columnEditor from './table-item';
import HeaderEditor from './table/header';
import TableStyleEditor from './table/tableStyle';
import getAddColumnEditor from './table/addColumn';
import ExpandEditor from './table/expand';
import EventEditor from './table/event';
import LoadingEditor from './table/loading';
import { getRowSelectionEditor } from './table/rowSelection';
import UsePaginatorEditor from './table/paginator';
import PaginatorEditor from './paginator';
import DynamicColumnEditor from './table/dynamicColumn';
import DynamicTitleEditor from './table/dynamicTitle';
import {
  InputIds as PaginatorInputIds,
  OutputIds as PaginatorOutputIds
} from '../components/Paginator/constants';
import { PageSchema } from './table/paginator';
import { getColumnsSchema } from '../utils';

export function getColumnsFromSchema(schema: any) {
  function getColumnsFromSchemaProperties(properties) {
    const columns: any = [];
    Object.keys(properties).forEach((key) => {
      if (
        properties[key].type === 'number' ||
        properties[key].type === 'string' ||
        properties[key].type === 'boolean'
      ) {
        columns.push({
          title: key,
          dataIndex: key,
          key: uuid(),
          width: 140,
          visible: true,
          ellipsis: true,
          contentType: 'text'
        });
      }
    });
    return columns;
  }
  let columnSchema: any = {};
  if (schema.type === 'array') {
    columnSchema = schema.items.properties;
  } else if (schema.type === 'object') {
    const dataSourceKey = Object.keys(schema.properties).find(
      (key) => schema.properties[key].type === 'array'
    );
    if (dataSourceKey) {
      columnSchema = schema.properties[dataSourceKey].items.properties;
    }
  }
  return getColumnsFromSchemaProperties(columnSchema);
}

export default {
  '@parentUpdated'({ id, data, parent, inputs, outputs }, { schema }) {
    if (schema === 'mybricks.domain-pc.crud/table') {
      if (data?.domainModel?.entity && data.columns?.length === 0) {
        const schema = getColumnsSchema(data);
        data.columns = getColumnsFromSchema(schema);
      }
      if (!data.usePagination) {
        data.usePagination = true;
        inputs.add(PaginatorInputIds.SetTotal, '设置数据总数', { type: 'number' });
        inputs.add(PaginatorInputIds.SetPageNum, '设置当前页码', { type: 'number' });
        inputs.add(PaginatorInputIds.GetPageInfo, '获取分页数据', { type: 'any' });
        outputs.add(PaginatorOutputIds.GetPageInfo, '分页数据', PageSchema);
        inputs.get(PaginatorInputIds.GetPageInfo).setRels([PaginatorOutputIds.GetPageInfo]);
        outputs.add(PaginatorOutputIds.PageChange, '点击分页', PageSchema);
      }
    }
  },
  '@inputConnected'({ data, output, input, ...res }: EditorResult<Data>, fromPin, toPin) {
    if (toPin.id === InputIds.SET_DATA_SOURCE) {
      if (data.columns.length === 0) {
        let tempSchema;
        if (!data.usePagination && fromPin.schema.type === 'array') {
          tempSchema = fromPin.schema;
        }
        /**
         * 分页模式下特殊处理逻辑
         * 当存在dataSource字段且为数组类型数据时，直接使用
         * 当不存在dataSource字段且仅有一个数组类型数据时，直接使用
         */
        if (data.usePagination && fromPin.schema.type === 'object') {
          if (fromPin.schema.properties?.dataSource?.type === 'array') {
            tempSchema = fromPin.schema.properties?.dataSource;
          } else {
            const dsKey = Object.keys(fromPin.schema?.properties || {});
            const arrayItemKey = dsKey.filter(
              (key) => fromPin.schema.properties?.[key]?.type === 'array'
            );
            if (arrayItemKey.length === 1) {
              tempSchema = fromPin.schema.properties?.[arrayItemKey[0]];
            }
          }
        }

        if (tempSchema) {
          data.columns = getColumnsFromSchema(tempSchema);
          input.get(InputIds.SET_DATA_SOURCE).setSchema(tempSchema);
          data[`input${InputIds.SET_DATA_SOURCE}Schema`] = tempSchema;
        }
      }
      setDataSchema({ data, output, input, ...res });
    }
  },
  '@inputDisConnected'({ data, output, input, ...res }: EditorResult<Data>, fromPin, toPin) {
    if (toPin.id === InputIds.SET_DATA_SOURCE && data.columns.length === 0) {
      setDataSchema({ data, output, input, ...res });
    }
  },
  ':root': (props: EditorResult<Data>, ...cateAry) => {
    cateAry[0].title = '常规';
    cateAry[0].items = [getAddColumnEditor(props), ...UsePaginatorEditor];

    cateAry[1].title = '样式';
    cateAry[1].items = [...LoadingEditor, TableStyleEditor];

    cateAry[2].title = '高级';
    cateAry[2].items = [
      ...EventEditor,
      HeaderEditor,
      ...ExpandEditor,
      ...DynamicColumnEditor,
      ...DynamicTitleEditor,
      ...getRowSelectionEditor(props)
    ];
  },
  ...columnEditor,
  ...PaginatorEditor
};
