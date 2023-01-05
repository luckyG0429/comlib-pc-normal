import React, { useEffect, useMemo, useCallback, useLayoutEffect, Fragment, useState } from 'react';
import { Form, Button, Row, Col } from 'antd';
import { Data, FormControlInputId } from './types';
import SlotContent from './SlotContent';
import { getLabelCol, isObject, objectFilter } from './utils';
import { slotInputIds, inputIds, outputIds, SLOT_ID } from './constants';
import { ValidateInfo } from '../types';

type FormControlInputRels = {
  validate: (val?: any) => {
    returnValidate: (cb: (val: ValidateInfo) => void) => void;
  };
  getValue: (val?: any) => {
    returnValue: (val) => {};
  };
  [key: string]: (val?: any) => void;
};

type FormControlInputType = {
  [key in FormControlInputId]: FormControlInputRels[key];
};

export default function Runtime(props: RuntimeParams<Data>) {
  const { data, env, outputs, inputs, slots, _inputs } = props;
  const [formRef] = Form.useForm();

  const childrenInputs = useMemo<{
    [id: string]: FormControlInputType;
  }>(() => {
    return {};
  }, [env.edit]);

  useLayoutEffect(() => {
    inputs[inputIds.SET_FIELDS_VALUE]((val) => {
      // resetFields();

      setFieldsValue(val);
      slots[SLOT_ID].inputs[slotInputIds.SET_FIELDS_VALUE](val);
    });

    inputs[inputIds.SET_INITIAL_VALUES]((val) => {
      setInitialValues(val);
      slots[SLOT_ID].inputs[slotInputIds.SET_FIELDS_VALUE](val);
    });

    inputs[inputIds.RESET_FIELDS]((val, outputRels) => {
      resetFields();
      outputRels[outputIds.ON_RESET_FINISH]();
    });

    inputs[inputIds.SUBMIT]((val, outputRels) => {
      submit(outputRels);
    });

    inputs[inputIds.SUBMIT_AND_MERGE]((val, outputRels) => {
      if (isObject(val)) {
        submitMethod(outputIds.ON_MERGE_FINISH, outputRels, val);
      } else {
        submitMethod(outputIds.ON_MERGE_FINISH, outputRels);
      }
    });

    //------ For 表单项私有 start ---------
    _inputs['validate']((val, outputRels) => {
      validate().then((r) => {
        outputRels['returnValidate']({
          validateStatus: 'success'
        });
      });
    });

    _inputs['getValue']((val, outputRels) => {
      getValue().then((v) => {
        outputRels['returnValue'](v);
      });
    });

    _inputs['setValue']((val) => {
      setFieldsValue(val);
    });
    //------ For 表单项私有 end---------

    /**
     * @description 响应触发对应表单项校验
     */
    slots[SLOT_ID]._inputs[slotInputIds.VALIDATE_TRIGGER](({ id }) => {
      const item = data.items.find((item) => item.id === id);
      if (item) {
        const input = childrenInputs[item.id];
        validateForInput({ item, input });
      }
    });
  }, []);

  useLayoutEffect(() => {
    const formItemConfig = data.configs?.formItem;
    if (formItemConfig) {
      Object.keys(formItemConfig).forEach((nameKey) => {
        data.items = data.items.map((item) => {
          if (item.name === nameKey) {
            if (formItemConfig[nameKey]) {
              const { label, name, required, tooltip } = formItemConfig[nameKey];
              const newItem = objectFilter({ label, name, required, tooltip });
              item = { ...item, ...newItem };
            }
          }
          return item;
        });
      });
    }
  }, []);

  const setFieldsValue = (val) => {
    if (val) {
      Object.keys(val).forEach((key) => {
        setValuesForInput({ childrenInputs, formItems: data.items, name: key }, 'setValue', val);
      });
    }
  };

  const setInitialValues = (val) => {
    if (val) {
      Object.keys(val).forEach((key) => {
        setValuesForInput(
          { childrenInputs, formItems: data.items, name: key },
          'setInitialValue',
          val
        );
      });
    }
  };

  const resetFields = () => {
    data.items.forEach((item) => {
      const id = item.id;
      const input = childrenInputs[id];
      input?.resetValue();
      item.validateStatus = undefined;
      item.help = undefined;
    });
  };

  const validate = useCallback(() => {
    return new Promise((resolve, reject) => {
      Promise.all(
        data.items.map((item) => {
          if (!data.submitHiddenFields) {
            // 隐藏的表单项，不再校验
            if (!item.visible) return { validateStatus: 'success' };
          }

          const id = item.id;
          const input = childrenInputs[id];

          return new Promise((resolve, reject) => {
            validateForInput({ item, input }, resolve);
          });
        })
      )
        .then((values) => {
          let rtn = false;
          values.forEach((item) => {
            if (item.validateStatus !== 'success') {
              reject(item);
            }
          });

          resolve(rtn);
        })
        .catch((e) => reject(e));
    });
  }, []);

  const getValue = useCallback(() => {
    return new Promise((resolve, reject) => {
      /** 隐藏的表单项，不收集数据 **/
      const formItems = data.submitHiddenFields
        ? data.items
        : data.items.filter((item) => item.visible);

      Promise.all(
        formItems.map((item) => {
          const id = item.id;
          const input = childrenInputs[id];

          return new Promise((resolve, reject) => {
            let count = 0;
            let value = {};
            input?.getValue().returnValue((val, key) => {
              //调用所有表单项的 getValue/returnValue
              if (typeof data.fieldsLength !== 'undefined') {
                value[key] = {
                  name: item.name,
                  value: val
                };
                count++;
                if (count == data.fieldsLength) {
                  resolve(value);
                }
              } else {
                value = {
                  name: item.name,
                  value: val
                };

                resolve(value);
              }
            });
          });
        })
      )
        .then((values) => {
          if (data.dataType === 'list') {
            const arr = [];
            values.forEach((valItem) => {
              Object.keys(valItem).map((key) => {
                if (!arr[key]) {
                  arr[key] = {};
                }
                arr[key][valItem[key].name] = valItem[key].value;
              });
            });
            resolve(arr);
          } else {
            const rtn = {};
            values.forEach((item) => {
              rtn[item.name] = item.value;
            });
            resolve(rtn);
          }
        })
        .catch((e) => reject(e));
    });
  }, []);

  const submit = (outputRels?: any) => {
    submitMethod(outputIds.ON_FINISH, outputRels);
  };

  const submitMethod = (outputId: string, outputRels?: any, params?: any) => {
    validate()
      .then(() => {
        getValue()
          .then((values: any) => {
            const res = { ...values, ...params };
            if (outputRels) {
              console.log(outputRels[outputId]);
              outputRels[outputId](res);
            } else {
              outputs[outputId](res);
            }
          })
          .catch((e) => {
            console.log('收集表单项值失败', e);
          });
      })
      .catch((e) => {
        console.log('校验失败', e);
      });
  };

  return (
    <Fragment>
      {!data.isFormItem ? (
        <Form
          form={formRef}
          layout={data.layout}
          labelCol={data.layout === 'horizontal' ? getLabelCol(data) : undefined}
          // wrapperCol={{ span: 16 }}
        >
          <SlotContent
            env={env}
            slots={slots}
            data={data}
            childrenInputs={childrenInputs}
            outputs={outputs}
            submit={submitMethod}
          />
        </Form>
      ) : (
        <SlotContent env={env} slots={slots} data={data} childrenInputs={childrenInputs} />
      )}
    </Fragment>
  );
}

/**
 * @description 列表类型表单容器，暂不开放
 */
const FormListItem = ({ content, slots, env, isFormItem, data }) => {
  if (env.edit) {
    return content();
  }

  return (
    <Form.List name="item4">
      {(fields, { add, remove }) => {
        data.fieldsLength = fields.length;

        return (
          <>
            {fields.map((field, index) => {
              return <div key={field.key}>{content({ field })}</div>;
            })}
            {isFormItem ? (
              <Button
                onClick={() => {
                  add();
                }}
              >
                添加
              </Button>
            ) : (
              <Row style={{ flex: '1 1 100%' }} data-form-actions>
                <Col offset={8}>
                  <Form.Item>
                    <Button
                      onClick={() => {
                        add();
                      }}
                    >
                      添加
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </>
        );
      }}
    </Form.List>
  );
};

/**
 * @description 触发表单项校验，并更新校验结果
 */
const validateForInput = (
  { input, item }: { input: FormControlInputType; item: any },
  cb?: (val: any) => void
): void => {
  input?.validate({ ...item }).returnValidate((validateInfo) => {
    item.validateStatus = validateInfo?.validateStatus;
    item.help = validateInfo?.help;
    if (cb) {
      cb(validateInfo);
    }
  });
};

const setValuesForInput = ({ childrenInputs, formItems, name }, inputId, values) => {
  const item = formItems.find((item) => item.name === name);
  if (item) {
    const input = childrenInputs[item.id];
    if (isObject(values[name])) {
      input[inputId] && input[inputId]({ ...values[name] });
    } else {
      input[inputId] && input[inputId](values[name]);
    }
  }
};
