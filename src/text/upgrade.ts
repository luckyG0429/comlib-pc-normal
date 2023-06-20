import { Data } from './constants';

export default function ({ data, setDeclaredStyle }: UpgradeParams<Data>): boolean {
  /**
     * @description v1.0.1 -> v1.0.2, 兼容之前默认和激活态颜色自定义
  */
  if(data.style){
    setDeclaredStyle(`[data-item-type="root"]`, data.style);
  }
  if(data.hoverStyle){
    setDeclaredStyle(`[data-item-type="root"]:hover`, data.hoverStyle);
  }
  
  return true;
}