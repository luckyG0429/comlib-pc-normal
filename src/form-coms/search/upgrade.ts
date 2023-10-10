import { inputIds, outputIds } from '../form-container/constants';
import { Data } from './runtime';

export default function ({ data, input, output }: UpgradeParams<Data>): boolean {
  /**
   * @description v1.0.7->1.0.8 增加前置下拉框，isSelect、selectWidth、staticOptions
   */
  if (typeof data.isSelect === "undefined") {
    data.isSelect = false;
  };
  if (typeof data.selectWidth === "undefined") {
    data.selectWidth = "150px";
  };
  if (typeof data.staticOptions === "undefined") {
    data.staticOptions = [];
  };

  /**
   * @description v1.1.0 新增自定义校验事件
   */

  if (!input.get(inputIds.SET_VALIDATE_INFO)) {
    input.add(inputIds.SET_VALIDATE_INFO, '设置校验状态', {
      type: 'object',
      properties: {
        validateStatus: {
          type: 'enum',
          items: [
            {
              type: 'string',
              value: 'success',
            },
            {
              type: 'string',
              value: 'error',
            },
          ],
        },
        help: {
          type: 'string',
        },
      },
    });
  }
  if (!output.get(outputIds.ON_VALIDATE)) {
    output.add(outputIds.ON_VALIDATE, '校验触发', {
      type: 'string'
    });
  }

  //=========== v1.1.0 end ===============

  return true;
}