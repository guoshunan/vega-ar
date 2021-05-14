import { Spec } from 'vega';
import { DataToFieldToVC } from '../type';
export declare function collectDataFieldEncoded(spec: Spec): {
    dataFieldsEncoded: DataToFieldToVC;
    fixedVC: Set<unknown>;
};
