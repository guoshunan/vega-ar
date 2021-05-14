import { Transforms } from 'vega';
import { ARSpec, TransformItem } from '../type';
export declare function parseTransform(t: Transforms, dataName: string, transforms: Transforms[], nSpec: ARSpec): TransformItem | undefined;
