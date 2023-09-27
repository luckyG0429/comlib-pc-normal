import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { validateFormItem } from '../utils/validator';
import css from './runtime.less';
import { OutputIds } from '../types';
import { validateTrigger } from '../form-container/models/validate';
import { onChange as onChangeForFc } from '../form-container/models/onChange';
import ConfigProvider from '../../components/ConfigProvider';
import { SlotIds, InputIds } from './constant';

export interface Data {
  options: any[];
  rules: any[];
  showTime: Record<string, unknown> | boolean;
  contentType: string;
  formatter: string;
  useCustomDateCell: boolean;
  config: {
    disabled: boolean;
    placeholder: string;
    picker: 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined;
  };
}

export default function Runtime(props: RuntimeParams<Data>) {
  const { data, inputs, outputs, env, parentSlot, name, id, slots } = props;
  const [value, setValue] = useState();
  const { edit, runtime } = env;
  const debug = !!(runtime && runtime.debug);
  const ref = useRef(null);

  //输出数据变形函数
  const transCalculation = (val, type, props) => {
    let transValue;
    switch (type) {
      //1. 年-月-日 时:分:秒
      case 'Y-MM-DD HH:mm:ss':
        transValue = moment(val).format('YYYY-MM-DD HH:mm:ss');
        break;
      //2. 年-月-日 时:分
      case 'Y-MM-DD HH:mm':
        transValue = moment(val).format('Y-MM-DD HH:mm');
        break;
      //3. 年-月-日
      case 'Y-MM-DD':
        transValue = moment(val).format('Y-MM-DD');
        break;
      //4. 年-月
      case 'Y-MM':
        transValue = moment(val).format('Y-MM');
        break;
      //5. 年
      case 'Y':
        transValue = moment(val).format('Y');
        break;
      //6. 时间戳
      case 'timeStamp':
        transValue = Number(val);
        break;
      //7. 自定义
      case 'custom':
        let customDate = moment(val).format(props.data.formatter);
        if (customDate.indexOf('Su')) {
          customDate = customDate.replace('Su', '天');
        }
        if (customDate.indexOf('Mo')) {
          customDate = customDate.replace('Mo', '一');
        }
        if (customDate.indexOf('Tu')) {
          customDate = customDate.replace('Tu', '二');
        }
        if (customDate.indexOf('We')) {
          customDate = customDate.replace('We', '三');
        }
        if (customDate.indexOf('Th')) {
          customDate = customDate.replace('Th', '四');
        }
        if (customDate.indexOf('Fr')) {
          customDate = customDate.replace('Fr', '五');
        }
        if (customDate.indexOf('Sa')) {
          customDate = customDate.replace('Sa', '六');
        }
        transValue = customDate;
        break;
    }
    return transValue;
  };

  useLayoutEffect(() => {
    inputs['setValue']((val) => {
      //时间戳转换
      const num = Number(val);
      const result: any = isNaN(num) ? moment(val) : moment(num);
      val = !result?._isValid ? undefined : result;
      setValue(val);
      onChange(val);
    });

    inputs['setInitialValue'] &&
      inputs['setInitialValue']((val) => {
        //时间戳转换
        const num = Number(val);
        const result: any = isNaN(num) ? moment(val) : moment(num);
        val = !result?._isValid ? undefined : result;
        setValue(val);
        //自定义转换
        let transValue;
        if (val === null || val === undefined) {
          transValue = undefined;
        } else {
          transValue = transCalculation(val, data.contentType, props);
        }
        outputs[OutputIds.OnInitial](transValue);
      });

    inputs['validate']((model, outputRels) => {
      validateFormItem({
        value: value,
        env,
        model,
        rules: data.rules
      })
        .then((r) => {
          outputRels['returnValidate'](r);
        })
        .catch((e) => {
          outputRels['returnValidate'](e);
        });
    });

    inputs['disabledDate']((val) => {
      if (typeof val === 'function') {
        data.disabledDate = val;
      }
    });

    inputs['getValue']((val, outputRels) => {
      let transValue;
      //1.null是从日期选择框不选日期的情况；
      //2.undefined是手动设置值为空或者不正确的情况
      if (value === null || value === undefined) {
        transValue = undefined;
      } else {
        transValue = transCalculation(value, data.contentType, props);
      }
      outputRels['returnValue'](transValue);
    });
  }, [value]);

  //重置，
  inputs['resetValue'](() => {
    setValue(void 0);
  });
  //设置禁用
  inputs['setDisabled'](() => {
    data.config.disabled = true;
  });
  //设置启用
  inputs['setEnabled'](() => {
    data.config.disabled = false;
  });

  const onValidateTrigger = () => {
    validateTrigger(parentSlot, { id: props.id, name: name });
  };

  const onChange = (value) => {
    //自定义转换
    let transValue;
    if (value === null || value === undefined) {
      transValue = undefined;
    } else {
      transValue = transCalculation(value, data.contentType, props);
    }
    setValue(value);
    onChangeForFc(parentSlot, { id: props.id, name: name, value: transValue });
    outputs['onChange'](transValue);
    onValidateTrigger();
  };

  const getShowTime = () => {
    if (!data.showTime || typeof data.showTime === 'boolean') {
      return data.showTime;
    }
    return {
      defaultValue:
        typeof data.showTime?.defaultValue === 'string'
          ? moment(data.showTime.defaultValue, 'HH:mm:ss')
          : undefined
    };
  };

  const customDateRender = useCallback(
    (currentDate, today) => {
      return (
        <div className="ant-picker-cell-inner">
          {currentDate.date()}
          {runtime || currentDate.isSame(today, 'day')
            ? slots[SlotIds.DateCell].render({
                inputValues: {
                  [InputIds.CurrentDate]: currentDate,
                  [InputIds.Today]: today
                },
                key: currentDate
              })
            : null}
        </div>
      );
    },
    [data.useCustomDateCell]
  );

  return (
    <ConfigProvider locale={env.vars?.locale}>
      <div className={css.datePicker} ref={ref}>
        <DatePicker
          value={value}
          {...data.config}
          dateRender={data.useCustomDateCell ? customDateRender : undefined}
          showTime={getShowTime()}
          onChange={onChange}
          disabledDate={data.disabledDate || undefined}
          getPopupContainer={(triggerNode: HTMLElement) => {
            return ref.current || document.body;
            // return edit || debug ? env?.canvasElement : document.body;
          }}
          dropdownClassName={`${id} ${css.datePicker}`}
          open={(edit && data.useCustomDateCell) || env.design}
        />
      </div>
    </ConfigProvider>
  );
}
