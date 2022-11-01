import React, { useMemo, useState } from 'react';
import { Col, Row } from 'antd';
import FormItem from './components/FormItem';
import FormActions from './components/FormActions';
import InlineLayout from './layout/InlineLayout';
import HorizontalLayout from './layout/HorizontalLayout';
import VerticalLayout from './layout/VerticalLayout';

const SlotContent = (props) => {
  const { slots, data, childrenInputs, outputs, submit } = props;

  const isInlineModel = useMemo(() => {
    return data.layout === 'inline';
  }, [data.layout]);

  const isHorizontalModel = useMemo(() => {
    return data.layout === 'horizontal';
  }, [data.layout]);

  const isVerticalModel = useMemo(() => {
    return data.layout === 'vertical';
  }, [data.layout]);

  const FormActionsWrapper = () => {
    return <FormActions data={data} outputs={outputs} submit={submit} />;
  };

  const content = useMemo(() => {
    return slots['content'].render({
      wrap(comAray: { id; jsx; def; inputs; outputs }[]) {
        const items = data.items;
        // if (data.dataType === 'list') {
        //   console.log('items', items, comAray, props?.field);
        // }

        const jsx = comAray?.map((com, idx) => {
          if (com) {
            let item = items.find((item) => item.id === com.id);

            childrenInputs[com.id] = com.inputs;
            return (
              <Col data-formitem={com.id} key={com.id} flex={`0 0 ${100 / data.formItemColumn}%`}>
                <FormItem data={data} com={com} item={item} field={props?.field} />
              </Col>
            );
          }

          return <div key={idx}>组件错误</div>;
        });

        return (
          <Row>
            {isInlineModel && (
              <InlineLayout data={data} actions={<FormActionsWrapper />}>
                {jsx}
              </InlineLayout>
            )}
            {isHorizontalModel && (
              <HorizontalLayout data={data} actions={<FormActionsWrapper />}>
                {jsx}
              </HorizontalLayout>
            )}
            {isVerticalModel && (
              <VerticalLayout data={data} actions={<FormActionsWrapper />}>
                {jsx}
              </VerticalLayout>
            )}
          </Row>
        );
      },
      inputValues: {}
      // key: props?.field?.name
    });
  }, [data.layout]);

  return content;
};

export default SlotContent;
