import { SceneGroup, SceneItem, Data, ValuesData, UrlData, Transforms, SignalRef, TransformField, DataRef, ScaleData, GroupMark, Mark, FromFacet, From, Facet, _TODO_, SourceData } from 'vega';
import { TransformItem, ScaleItem, PlaceholderData } from './type';
declare function isSceneGroup(node?: SceneItem | SceneGroup): node is SceneGroup;
declare function isValuesData(data: Data): data is ValuesData;
declare function isUrlData(data: Data): data is UrlData;
declare function isPlaceholderData(data: Data): data is PlaceholderData;
declare function isDataReference(o?: (null | string | number | boolean | SignalRef)[] | ScaleData | SignalRef): o is DataRef;
declare function isSignalRef(o?: any): o is SignalRef;
declare function isGroupMark(m?: Mark): m is GroupMark;
declare function isFromFacet(f?: FromFacet): f is (From & {
    facet: Facet;
});
interface PartitionTransform {
    type: 'partition';
    field: string | TransformField;
    size: [SignalRef | Number, SignalRef | Number];
}
declare function isPartitionTransform(t: Transforms): t is PartitionTransform;
declare function isTreemapTransform(t: Transforms): t is _TODO_<'treemap'>;
declare function isCrossTransform(t: Transforms): t is _TODO_<'cross'>;
declare function isTreeTransform(t: Transforms): t is _TODO_<'tree'>;
declare function isTreelinks(t: Transforms): t is _TODO_<'treelinks'>;
export declare const Ordinal = "ordinal";
export declare const Point = "point";
export declare const Band = "band";
export declare const BinOrdinal = "bin-ordinal";
declare function isDiscreteScale(key?: string): boolean;
declare function isTransformItem(item: TransformItem | ScaleItem): item is TransformItem;
declare function isScaleItem(item: TransformItem | ScaleItem): item is ScaleItem;
declare function isHierarchicalData(data?: Data[], arData?: Data[]): {
    transforms: Transforms[];
    index: number;
    data: SourceData;
} | null;
declare function toArray(o?: any | any[]): unknown[];
declare const insert: (...items: any[]) => {
    to: (arr: any[]) => {
        at: (idx: number) => any[];
    };
};
declare const replace: (idx: number) => {
    of: (arr: any[]) => {
        with: (...items: any[]) => any[];
    };
};
declare function intersection<T>(a: Array<T>, b: Array<T>): Set<T>;
declare function intersection<T>(a: Set<T>, b: Set<T>): Set<T>;
declare function union<T>(a: Set<T>, b: Set<T>): Set<T>;
/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
declare function shuffle(a: any[]): any[];
declare function flat<T>(key: string, items: T[]): Array<[any, T, string]>;
declare function log(...msg: any[]): void;
declare function warn(...msg: any[]): void;
declare function error(...msg: any[]): void;
export declare function dfsDataTarget(data: any, datas: any[]): any[];
export { isSceneGroup, isValuesData, isUrlData, isPlaceholderData, isPartitionTransform, isCrossTransform, isDataReference, isSignalRef, isDiscreteScale, isTransformItem, isTreelinks, isTreeTransform, isScaleItem, isGroupMark, isHierarchicalData, isFromFacet, isTreemapTransform, toArray, insert, replace, intersection, union, shuffle, flat, log, warn, error };
