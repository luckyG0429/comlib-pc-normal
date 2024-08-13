import React, { ReactNode, useCallback, useEffect } from 'react';
import * as Icons from '@ant-design/icons';
import { Data, OutputIds } from './constants';
import css from './runtime.less';

/**
 * @param icon 图标
 */
export default function ({ env, data, inputs, outputs }: RuntimeParams<Data>) {
  const onClick = () => {
    if (env.runtime) {
      outputs[OutputIds.Click]();
    }
  };

  const btnItemR = useCallback(
    ({ icon }: { icon: any }) => {
      const Icon = Icons && Icons[icon as string]?.render();
      if (typeof Icon === 'undefined') {
        return <div dangerouslySetInnerHTML={{ __html: icon }} />;
      } else {
        return <>{Icon}</>;
      }
    },
    [data.icon]
  );

  useEffect(() => {
    if (env.runtime) {
      inputs["setIcon"]?.((val, relOutputs) => {
        var pattern = new RegExp("[A-Za-z]+");
        if (typeof val === 'string' && pattern.test(val)) {
          data.icon = val.replace(val[0], val[0].toUpperCase());
          relOutputs['setIconDone'](val);
        }  else {
          console.error(`输入的图标不正确`);
        }
      });
    }
  }, []);

  return (
    <div
      className={`${css.icon} icon`}
      style={{
        cursor:
          outputs[OutputIds.Click] && outputs[OutputIds.Click]?.getConnections()?.length > 0
            ? 'pointer'
            : undefined
      }}
      onClick={onClick}
      data-item-type="icon"
    >
      {btnItemR({ icon: data.icon })}
    </div>
  );
}
