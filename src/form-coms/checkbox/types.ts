import { Option } from '../types'
export interface Data {
    config: {
        options: any[];
        disabled: boolean;
    };
    rules: any[];
    value?: any[];
    staticOptions: Option[];
    options: any[];
}
