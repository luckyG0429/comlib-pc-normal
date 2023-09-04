import { BtnItemDataSetKey } from '../../constants';
import { AlignEnum, Data } from '../../types';
import IndexEditor from './indexEditor';
import DynamicEventEditor from './dynamicEventEditor';
import IconEditor from './iconEditor';
import PermissionEditor from './permissionEditor';
import StyleEditor from './styleEditor';
import EventEditor from './eventEditor';
import BaseEditor from './baseEditor';
import OutputValEditor from './outputValEditor';

const itemEditor = {
  [`[${BtnItemDataSetKey}]`]: {
    title: '按钮',
    style: [
      ...StyleEditor,
      {
        options: ['size'],
        target({ focusArea }) {
          return `div[data-btn-idx="${focusArea.dataset.btnIdx}"]`;
        }
      },
      {
        items: [
          {
            title: '按钮样式',
            catelog: '默认',
            options: ['border', { type: 'font', config: { disableTextAlign: true } }, 'background'],
            target({ focusArea }) {
              return `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button`;
            }
          },
          {
            title: '按钮样式',
            catelog: 'Hover',
            options: ['border', { type: 'font', config: { disableTextAlign: true } }, 'background'],
            target({ focusArea }) {
              return `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button:hover`;
            }
          },
          {
            title: '按钮样式',
            catelog: '激活',
            options: ['border', { type: 'font', config: { disableTextAlign: true } }, 'background'],
            target({ focusArea }) {
              return `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button.ant-btn:not([disabled]):active`;
            }
          },
          {
            title: '按钮样式',
            catelog: '禁用',
            options: ['border', { type: 'font', config: { disableTextAlign: true } }, 'background'],
            target({ focusArea }) {
              return [
                `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button.ant-btn[disabled]`,
                `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button.ant-btn[disabled]:active`,
                `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button.ant-btn[disabled]:focus`,
                `div[data-btn-idx="${focusArea.dataset.btnIdx}"] > button.ant-btn[disabled]:hover`
              ];
            }
          }
        ]
      },
      ...IconEditor
    ],
    items: ({}: EditorResult<Data>, cate1, cate2, cate3) => {
      cate1.title = '常规';
      cate1.items = [...BaseEditor, ...OutputValEditor, ...EventEditor, ...IndexEditor];

      cate2.title = '高级';
      cate2.items = [...DynamicEventEditor, ...PermissionEditor];

      return {
        title: '按钮'
      };
    }
  }
};

export default itemEditor;
