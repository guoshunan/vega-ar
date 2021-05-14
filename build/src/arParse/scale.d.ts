import { Scale } from 'vega';
import { ARSpec, ScaleItem } from '../type';
export declare function dfsDatasource(node: any, datas: any[]): string[];
export declare function parseScale(scale: Scale, dataName: string, nSpec: ARSpec): ScaleItem[] | undefined;
