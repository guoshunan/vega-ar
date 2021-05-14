// @ts-nocheck
import { isObject, isArray } from 'vega';
// type check
function isSceneGroup(node) {
    return node != undefined && 'items' in node;
}
function isValuesData(data) {
    return 'values' in data;
}
function isUrlData(data) {
    return 'url' in data;
}
function isPlaceholderData(data) {
    return 'placeholder' in data;
}
function isDataReference(o) {
    return o !== undefined && isObject(o) && 'data' in o;
}
function isSignalRef(o) {
    return o !== undefined && o.signal;
}
function isGroupMark(m) {
    return m !== undefined && isObject(m) && m.type === 'group';
}
function isFromFacet(f) {
    return f !== undefined && 'facet' in f;
}
function isPartitionTransform(t) {
    return t.type === 'partition';
}
function isTreemapTransform(t) {
    return t.type === 'treemap';
}
function isCrossTransform(t) {
    return t.type === 'cross';
}
function isTreeTransform(t) {
    return t.type === 'tree';
}
function isTreelinks(t) {
    return t.type === 'treelinks';
}
export const Ordinal = 'ordinal';
export const Point = 'point';
export const Band = 'band';
export const BinOrdinal = 'bin-ordinal';
function isDiscreteScale(key) {
    return key === BinOrdinal
        || key === Ordinal
        || key === Band
        || key === Point;
}
function isTransformItem(item) {
    return item._type === 'transform';
}
function isScaleItem(item) {
    return item._type === 'scale';
}
function isHierarchicalTransform(transform) {
    // no 'partition', 'stratify', 'treemap'
    return ['nest', 'treelinks', 'pack', 'tree'].indexOf(transform.type) >= 0;
}
function isHierarchicalData(data, arData) {
    if (data === undefined || arData === undefined)
        return null;
    for (let i = 0; i < data.length; i++) {
        const dataset = data[i];
        if (!dataset.transform)
            continue;
        for (let j = 0; j < dataset.transform.length; j++) {
            const transform = dataset.transform[j];
            const augmented = intersection(arData.map(d => d.name), [dataset.name, ...dataset.source || []]);
            if (isHierarchicalTransform(transform) && augmented.size) {
                return { transforms: dataset.transform, index: j, data: dataset };
            }
        }
    }
    return null;
}
function toArray(o) {
    if (o === undefined)
        return [];
    return isArray(o) ? o : [o];
}
const insert = (...items) => ({
    to: (arr) => ({
        at: (idx) => arr.splice(idx, 0, ...items)
    })
});
const replace = (idx) => ({
    of: (arr) => ({
        with: (...items) => arr.splice(idx, 1, ...items)
    })
});
function intersection(a, b) {
    let aSet = a instanceof Set ? a : new Set([...a]);
    let bSet = b instanceof Set ? b : new Set([...b]);
    return new Set([...aSet].filter(d => bSet.has(d)));
}
function union(a, b) {
    return new Set([...a, ...b]);
}
/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
// @ts-nocheck
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function flat(key, items) {
    return items
        .reduce((o, item) => o
        .concat((item[key] || [])
        .map((_) => [_, item, key])), []);
}
function log(...msg) {
    console.log(`%c Vega-AR====>`, 'background: #2980b9; color: #fff', ...msg);
}
function warn(...msg) {
    console.warn(`%c Vega-AR====>`, 'background: #2980b9; color: #fff', ...msg);
}
function error(...msg) {
    console.error(`%c Vega-AR====>`, 'background: #2980b9; color: #fff', ...msg);
}
export function dfsDataTarget(data, datas) {
    const queue = [...datas.filter(d => d.name !== data.name)];
    const sourceDatas = [data];
    const sourceNames = new Set([data.name]);
    let increase = 0;
    do {
        increase = 0;
        for (let i = queue.length - 1; i >= 0; --i) {
            const q = queue[i];
            const { source } = q;
            if (!source) {
                continue;
            }
            if (sourceNames.has(source)) {
                sourceNames.add(q.name);
                queue.splice(i, 1); // remove
                sourceDatas.push(q);
                ++increase;
            }
        }
    } while (increase);
    return sourceDatas;
}
export { 
// type check
isSceneGroup, isValuesData, isUrlData, isPlaceholderData, isPartitionTransform, isCrossTransform, isDataReference, isSignalRef, isDiscreteScale, isTransformItem, isTreelinks, isTreeTransform, isScaleItem, isGroupMark, isHierarchicalData, isFromFacet, isTreemapTransform, 
//
toArray, insert, replace, intersection, union, shuffle, flat, 
// log
log, warn, error };
//# sourceMappingURL=utils.js.map