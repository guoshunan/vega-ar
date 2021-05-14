import { Spec, ValuesData, UrlData, BaseData } from "vega";
export interface SyncItem {
    type: string;
    dataName: string;
    signalName: string;
}
export declare type TransformItem = SyncItem & {
    _type: 'transform';
};
export declare type ScaleItem = SyncItem & {
    name: string;
    _type: 'scale';
};
export declare type ChartVDirection = 'Top' | 'Down';
export declare type ChartHDirection = 'Left' | 'Right';
export interface ARSpec extends Spec {
    ar: {
        mode: 'ON' | 'NO' | 'NN';
        data: Array<ValuesData | UrlData>;
    };
}
interface BasicHint {
    dataName: string;
    idx: number;
    msg: string;
    transformIdx?: number;
}
export declare type ARHintDataset = {
    type: 'dataset';
} & BasicHint;
export declare type ARHintDataValue = {
    type: 'dataValue';
    key: string;
    changed: {
        oData: any;
        nData: any;
    };
} & BasicHint;
export declare type ARHintDataItem = {
    type: 'dataItem';
    changed: {
        oData: any;
        nData: any;
    };
} & BasicHint;
export declare type ARHint = ARHintDataset | ARHintDataValue | ARHintDataItem;
export interface FieldToVC {
    [fieldName: string]: Set<string>;
}
export interface DataToFieldToVC {
    [dataName: string]: FieldToVC;
}
export interface PlaceholderData extends BaseData {
    placeholder: PlaceHolder;
}
declare type range = [number, number] | number[];
export declare type PlaceHolder = {
    [attr: string]: range | {
        range: range;
        random: boolean;
        options: boolean;
    };
} & {
    _num: number;
};
export {};
