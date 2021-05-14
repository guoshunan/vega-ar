(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vega')) :
    typeof define === 'function' && define.amd ? define(['exports', 'vega'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.vegaAR = {}, global.vega));
}(this, (function (exports, vega) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var vega__default = /*#__PURE__*/_interopDefaultLegacy(vega);

    // @ts-nocheck
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
        return o !== undefined && vega.isObject(o) && 'data' in o;
    }
    function isSignalRef(o) {
        return o !== undefined && o.signal;
    }
    function isGroupMark(m) {
        return m !== undefined && vega.isObject(m) && m.type === 'group';
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
    const Ordinal = 'ordinal';
    const Point = 'point';
    const Band = 'band';
    const BinOrdinal = 'bin-ordinal';
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
        return vega.isArray(o) ? o : [o];
    }
    const insert = (...items) => ({
        to: (arr) => ({
            at: (idx) => arr.splice(idx, 0, ...items)
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
    function dfsDataTarget(data, datas) {
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

    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    // const API_URL = 'http://vegaarapi.hkustvis.org'
    const API_URL = 'http://localhost:8000';
    function publish(el, spec, arView) {
        return __awaiter$3(this, void 0, void 0, function* () {
            // 1. check url data source
            const urlToDatas = {};
            if (spec.data) {
                const urlToFullUrl = {};
                const urlDatas = spec.data.filter(d => 'url' in d);
                // assume all url is string
                // Cache the data for each url
                yield Promise.all(urlDatas.map(({ url, name }) => __awaiter$3(this, void 0, void 0, function* () {
                    if (typeof url !== 'string') {
                        log('The url is not a string:' + url);
                        return;
                    }
                    if (!(url in urlToDatas)) {
                        const response = yield fetch(url);
                        urlToFullUrl[url] = response.url;
                        try {
                            const jsonData = yield response[url.endsWith('.json') ? 'json' : 'text']();
                            urlToDatas[url] = jsonData;
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                    // sbstitude ar data source
                    if (spec.ar && spec.ar.data) {
                        // url data
                        const arData = spec.ar.data.find(d => d.name === name);
                        if (arData
                            && (arData.url === url || !arData.url)) {
                            arData.url == urlToFullUrl[url];
                        }
                    }
                })));
                log(urlToDatas);
            }
            const data = yield postData(API_URL + '/spec', { spec, urlToDatas, anchor: arView.getAlignPadding() });
            log(data);
            document.querySelector(el).src = data.image;
            return data;
        });
    }
    function postData(url, data) {
        return __awaiter$3(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });
                return yield response.json();
            }
            catch (err) {
                error(err);
                return null;
            }
        });
    }

    function parseTransform(t, dataName, transforms, nSpec) {
        if ('_skip' in t) {
            // skip transform in for loop which has the _skip tag
            delete t['_skip'];
            return;
        }
        else if (isPartitionTransform(t)) {
            // only can extend in the `height` dimension
            if (!nSpec.signals) {
                nSpec.signals = [];
            }
            const signalName = `ar_${dataName}_partition_height`;
            let value;
            if (isSignalRef(t.size[1])) {
                const sigExp = t.size[1].signal;
                const wOrH = /\b(width|height)\b/.exec(sigExp);
                value = wOrH
                    ? eval(sigExp.replace(/width|height/, nSpec[wOrH[0]]))
                    : t.size[1].signal; // @TODO, here may be some bugss
            }
            else {
                value = t.size[1];
            }
            nSpec.signals.push({ name: signalName, value });
            t.size[1] = { signal: signalName };
            // add transform to remove the value of internal node
            const insertIdx = transforms.indexOf(t);
            insert({ type: "partition", as: t.as, _skip: true }, { type: "formula", expr: `datum.children?0:datum.${t.field}`, as: t.field, _skip: true }).to(transforms).at(insertIdx);
            // add _skip to skip transform in for loop
            t['_skip'] = true;
            return { type: t.type, dataName, signalName, _type: 'transform' };
        }
        else if (isTreemapTransform(t)) {
            // only can extend in the `height` dimension
            if (!nSpec.signals) {
                nSpec.signals = [];
            }
            const signalName = `ar_${dataName}_treemap_height`;
            let value;
            if (isSignalRef(t.size[1])) {
                const sigExp = t.size[1].signal;
                const wOrH = /\b(width|height)\b/.exec(sigExp);
                value = wOrH
                    ? eval(sigExp.replace(/width|height/, nSpec[wOrH[0]]))
                    : t.size[1].signal; // @TODO, here may be some bugss
            }
            else {
                value = t.size[1];
            }
            nSpec.signals.push({ name: signalName, value });
            t.size[1] = { signal: signalName };
            // add transform to remove the value of internal node
            const insertIdx = transforms.indexOf(t);
            insert({ type: "treemap", as: t.as, _skip: true }, { type: "formula", expr: `datum.children?0:datum.${t.field}`, as: t.field, _skip: true }).to(transforms).at(insertIdx);
            // add _skip to skip transform in for loop
            t['_skip'] = true;
            return { type: t.type, dataName, signalName, _type: 'transform' };
        }
        else if (isTreeTransform(t)) ;
        else if (isCrossTransform(t)) {
            const insertIdx = transforms.indexOf(t);
            insert({
                type: 'collect',
                sort: { field: (t.as || ['a', 'b']).map((f) => `${f}.__ar__`) },
                _skip: true
            }).to(transforms).at(insertIdx + 1);
            // add _skip to skip transform in for loop
            t['_skip'] = true;
        }
        else if (isTreelinks(t)) {
            warn('treelinks');
            const insertIdx = transforms.indexOf(t);
            insert({
                type: 'formula',
                expr: "datum.source.id + '-' + datum.target.id",
                as: "id",
                _skip: true
            }).to(transforms).at(insertIdx + 1);
            t['_skip'] = true;
        }
    }

    // @ts-nocheck
    function wrapChartHandW(dataName, scaleName, rangeField, nSpec) {
        if (!nSpec.signals) {
            nSpec.signals = [];
        }
        const wOrHRes = /\b(width|height)\b/.exec(rangeField);
        if (!wOrHRes)
            return;
        const signalName = `ar_${dataName}_${scaleName}_$${rangeField}`;
        const wOrH = wOrHRes[0];
        const payload = {};
        if (nSpec[wOrH]) {
            const signalValue = nSpec[wOrH];
            if (!vega.isNumber(signalValue)) {
                warn(`The value of ${wOrH} should be number, but now is ${signalValue}`);
            }
            payload['value'] = eval(rangeField.replace(/\b(width|height)\b/, signalValue));
        }
        else {
            const signal = nSpec.signals.find(s => s.name === wOrH);
            if (signal) {
                if ('value' in signal) {
                    const signalValue = signal.value;
                    payload['value'] = eval(rangeField.replace(/\b(width|height)\b/, signalValue));
                }
                if ('update' in signal) {
                    warn('May be not work because the `update` in signal');
                    payload['update'] = signal.update;
                }
                if ('init' in signal) {
                    payload['init'] = signal.init;
                }
            }
            else {
                warn('There is no width and height signals!!');
            }
        }
        nSpec.signals.push(Object.assign({ name: signalName }, payload));
        return signalName;
    }
    function dfsDatasource(node, datas) {
        const sources = node.source;
        if (!sources) {
            return [node.name];
        }
        return toArray(sources)
            .map(s => datas.find(d => d.name === s))
            .filter(d => d)
            .map(d => dfsDatasource(d, datas))
            .reduce((a, b) => a.concat(b), []);
    }
    function dependsDataSource(scaleDataName, nSpec, dataName) {
        if (scaleDataName === dataName) {
            return true;
        }
        const datas = nSpec.data || [];
        let data = datas.find(d => d.name === scaleDataName);
        return (data ? dfsDatasource(data, datas) : []).indexOf(dataName) !== -1;
    }
    function parseScale(scale, dataName, nSpec) {
        const { domain, name: scaleName, type: scaleType } = scale;
        if (!scaleType) {
            log(`Scale ${scaleName} must have a scale type`);
            return;
        }
        if (isDataReference(domain) &&
            dependsDataSource(domain.data, nSpec, dataName) &&
            'range' in scale) {
            const { range } = scale;
            if (isSignalRef(range)) ;
            else if (vega.isString(range)) {
                const signalName = wrapChartHandW(dataName, scaleName, range, nSpec);
                if (signalName) {
                    scale.range = (range === 'height' && !isDiscreteScale(scaleType))
                        ? [{ signal: signalName }, 0]
                        : [0, { signal: signalName }];
                    return [{ type: scaleType, name: scaleName, dataName, signalName, _type: 'scale' }];
                }
            }
            else if (vega.isArray(range)) {
                const scaleItems = [];
                scale.range = range.map(r => {
                    if (isSignalRef(r)) {
                        const signalName = wrapChartHandW(dataName, scaleName, r.signal, nSpec);
                        if (signalName) {
                            scaleItems.push({ type: scaleType, name: scaleName, dataName, signalName, _type: 'scale' });
                            return { signal: signalName };
                        }
                    }
                    // otherwise
                    return r;
                });
                return scaleItems;
            }
        }
    }

    function parseChartDirection(spec) {
        let v = 'Top';
        let h = 'Left';
        let axesDirection;
        if (spec.axes) {
            axesDirection = new Set(spec.axes.map(a => a.orient));
        }
        else if (spec.marks) {
            axesDirection = new Set(spec.marks
                .filter(isGroupMark)
                .map((m) => (m.axes || []))
                .reduce((a, b) => a.concat(b), [])
                .map(m => m.orient));
        }
        if (!axesDirection || !axesDirection.size) {
            if (spec.data) {
                const pie = spec.data.some(d => d.transform !== undefined && d.transform.some(t => t.type === 'pie' || t.type === 'linkpath' && t.orient === 'radial'));
                const sunbrust = spec.data.some(d => {
                    let sourceData = Array.isArray(d.source) &&
                        spec.data.find(data => data.name === d.source[0]);
                    return sourceData && sourceData.url && sourceData.url.includes('department.json') &&
                        d.transform !== undefined &&
                        d.transform.some(t => t.type === 'partition' && t.size &&
                            t.size[0].signal &&
                            t.size[0].signal.includes("PI"));
                });
                if (pie || sunbrust) {
                    v = 'Down';
                }
            }
            if (spec.marks) {
                const mark = spec.marks.find(m => m.transform !== undefined && m.transform.some(t => t.type === 'linkpath'));
                if (mark && mark.transform) {
                    const t = mark.transform.find(t => t.type === 'linkpath');
                    v = t['sourceX'].expr.includes('min(') ? 'Down' : 'Top';
                }
            }
            return { v, h };
        }
        if (axesDirection.has('bottom')) {
            v = 'Down';
        }
        if (axesDirection.has('top')) {
            if (v === 'Down') {
                // already has a bottom axis
                warn('Two horizontal axis??');
            }
            v = 'Top';
        }
        if (axesDirection.has('right')) {
            h = 'Right';
        }
        if (axesDirection.has('left')) {
            if (h === 'Right') {
                // already has a bottom axis
                warn('Two vertical axis??');
            }
            h = 'Left';
        }
        return { v, h };
    }

    function merge(d) {
        return {
            to(o) {
                return {
                    at(dataName) {
                        if (!(dataName in o)) {
                            o[dataName] = {};
                        }
                        Object.keys(d)
                            .forEach(field => {
                            if (!o[dataName][field]) {
                                o[dataName][field] = new Set();
                            }
                            d[field].forEach(vc => o[dataName][field].add(vc));
                        });
                    }
                };
            }
        };
    }
    function findField(obj, transforms = []) {
        const fieldToVC = {};
        const fixedVC = new Set();
        if (!obj)
            return { fieldToVC, fixedVC };
        for (const entry of ["enter", "update", "exit"]) {
            if (!obj[entry])
                continue;
            const encodes = obj[entry];
            Object.keys(encodes)
                .filter(vc => encodes[vc].field)
                .forEach(vc => {
                const field = encodes[vc].field;
                if (!(field in fieldToVC)) {
                    fieldToVC[field] = new Set();
                }
                fieldToVC[field].add(vc);
            });
            Object.keys(encodes)
                .filter(vc => encodes[vc].value !== undefined || encodes[vc].band !== undefined)
                .forEach(vc => fixedVC.add(vc));
        }
        for (const t of transforms) {
            if (t.type === 'geopath') {
                if (!('coordinates' in fieldToVC)) {
                    fieldToVC['coordinates'] = new Set();
                }
                fieldToVC['coordinates'].add('path');
            }
        }
        return { fieldToVC, fixedVC };
    }
    function collectDataFieldEncoded(spec) {
        const dataFieldsEncoded = {};
        const fixedVC = new Set();
        if (!spec.marks)
            return { dataFieldsEncoded, fixedVC };
        for (const mark of spec.marks) {
            if (mark.from === undefined)
                continue;
            const from = mark.from;
            let dataName;
            let facetName;
            if (isGroupMark(mark) && isFromFacet(from)) {
                dataName = from.facet.data;
                facetName = from.facet.name;
            }
            else {
                if (from.data === undefined)
                    continue;
                dataName = from.data;
            }
            if (mark.encode === undefined)
                continue;
            const { fieldToVC: fields, fixedVC: tmpFixedVC } = findField(mark.encode, mark.transform);
            merge(fields).to(dataFieldsEncoded).at(dataName);
            tmpFixedVC.forEach(vc => fixedVC.add(vc));
            if (isGroupMark(mark)) {
                const { dataFieldsEncoded: tmpToBeEvaluate, fixedVC: tmpFixedVC } = collectDataFieldEncoded(mark);
                Object.keys(tmpToBeEvaluate)
                    .forEach(gDataName => {
                    const tmpDataName = gDataName === facetName
                        ? dataName
                        : gDataName;
                    const fields = tmpToBeEvaluate[gDataName];
                    merge(fields).to(dataFieldsEncoded).at(tmpDataName);
                });
                // @TODO
                tmpFixedVC.forEach(vc => fixedVC.add(vc));
            }
        }
        return { dataFieldsEncoded, fixedVC };
    }

    function number(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    // @ts-nocheck
    function pick(range) {
        return (idx) => {
            const tick = idx % range.length;
            return range[tick];
        };
    }
    function genPlaceholder(placeholder) {
        //
        const data = [];
        let numOfData = placeholder._num || 10;
        delete placeholder._num;
        Object.keys(placeholder)
            .forEach(attr => {
            const item = placeholder[attr];
            const range = Array.isArray(item)
                ? item
                : item.range;
            const options = Array.isArray(item)
                ? item.length > 2
                : (item.options || false);
            if (options) {
                numOfData *= range.length;
            }
        });
        const interpolates = {};
        // create interpolate
        Object.keys(placeholder)
            .forEach(attr => {
            const item = placeholder[attr];
            const range = Array.isArray(item)
                ? item
                : item.range;
            const random = Array.isArray(item)
                ? false
                : (item.random || false);
            const options = Array.isArray(item)
                ? false
                : (item.options || false);
            let index = Array(numOfData).fill(1);
            if (range.length === 2 && !options) {
                index = index.map((d, i) => i / numOfData);
                if (random) {
                    index = shuffle(index);
                }
                interpolates[attr] = {
                    interpolate: number(range[0], range[1]),
                    index
                };
            }
            else {
                index = index.map((d, i) => range.length === 2 ? Math.round(i / index.length) : i);
                if (random) {
                    index = shuffle(index);
                }
                interpolates[attr] = {
                    interpolate: pick(range),
                    index
                };
            }
        });
        // gen data
        for (let i = 0; i < numOfData; ++i) {
            const item = {};
            Object.keys(interpolates)
                .forEach(attr => {
                const { interpolate, index } = interpolates[attr];
                item[attr] = interpolate(index[i]);
            });
            data.push(item);
        }
        return data;
    }

    function isGeoSpec(spec) {
        return (spec.projections !== undefined && spec.projections.some(p => p.name === 'projection')) ||
            (spec.data !== undefined && spec.data.some(d => d.transform !== undefined && d.transform.some(t => t.type === 'treemap' || t.type === 'partition'))) ||
            (spec.data !== undefined && spec.data.some(d => d.transform !== undefined && d.transform.some(t => t.type === 'contour'))) ||
            (spec.marks !== undefined && spec.marks.some(m => m.type === 'image'));
    }

    // @ts-nocheck
    function mergerOandN(oData, arData, oDataIndex, oDatas) {
        const mergedData = Object.assign({}, oData);
        ['url', 'values', 'format'].forEach(attr => delete mergedData[attr]);
        // rename oData
        oData.name = `${oData.name}_s1`;
        // clean oData
        ['on', 'transform'].forEach(attr => delete oData[attr]);
        oData.transform = [{
                type: "formula",
                as: "__ar__",
                expr: "false"
            }];
        arData.name = `${arData.name}_s2`;
        arData.transform = [{
                type: "formula",
                as: "__ar__",
                expr: "true"
            }];
        //  insert(oDatas, oDataIndex+1, arData);
        insert(arData).to(oDatas).at(oDataIndex + 1);
        mergedData.source = [oData.name, arData.name];
        insert(mergedData).to(oDatas).at(oDataIndex + 2);
    }
    function mergeONARData(nSpec) {
        const oDatas = nSpec.data || [];
        let arSyncScale = [];
        // extend data
        nSpec.ar.data.forEach((arData) => {
            const dataName = arData.name;
            let oDataIndex = oDatas.findIndex((d) => d.name == dataName);
            if (oDataIndex === -1)
                return;
            let oData = oDatas[oDataIndex];
            // merge data
            if (isValuesData(oData)) { // values
                if (isValuesData(arData)) {
                    mergerOandN(oData, arData, oDataIndex, oDatas);
                }
                else if (isUrlData(arData)) {
                    oData.url = arData.url;
                    delete oData.values;
                }
                else if (isPlaceholderData(arData)) {
                    const nData = Object.assign(Object.assign({}, arData), { values: genPlaceholder(arData.placeholder) });
                    delete nData.placeholder;
                    mergerOandN(oData, nData, oDataIndex, oDatas);
                }
            }
            else if (isUrlData(oData)) { // url
                if (isValuesData(arData)) {
                    mergerOandN(oData, arData, oDataIndex, oDatas);
                }
                else if (isUrlData(arData)) {
                    oData.url = arData.url;
                }
            }
            // handle transforms
            {
                // refined
                oDataIndex = oDatas.findIndex((d) => d.name == dataName);
                oData = oDatas[oDataIndex];
                // decorate transform on oData
                let transforms = flat('transform', dfsDataTarget(oData, oDatas));
                if (transforms) {
                    for (const [t, flatFrom, flatKey] of transforms) {
                        const item = parseTransform(t, flatFrom.name, flatFrom[flatKey], nSpec);
                        if (item) {
                            arSyncScale.push(item);
                        }
                    }
                }
            }
            // decortate scales on nSpec
            if (nSpec.scales) {
                for (const s of nSpec.scales) {
                    const items = parseScale(s, dataName, nSpec);
                    if (items) {
                        arSyncScale = arSyncScale.concat(items);
                    }
                }
            }
        });
        if (nSpec.data) {
            nSpec.data.forEach(data => {
                const { transform: transforms } = data;
                if (transforms) {
                    transforms.forEach(t => {
                        if (isCrossTransform(t)) {
                            const insertIdx = transforms.indexOf(t);
                            insert({
                                type: 'collect',
                                sort: { field: (t.as || ['a', 'b']).map((f) => `${f}.__ar__`) },
                                _skip: true
                            }).to(transforms).at(insertIdx + 1);
                            // add _skip to skip transform in for loop
                            t['_skip'] = true;
                        }
                    });
                }
            });
        }
        return arSyncScale;
    }
    function mergeNOARData(nSpec) {
        const oDatas = nSpec.data || [];
        nSpec.ar.data.forEach((arData) => {
            const oDataIndex = oDatas.findIndex((d) => d.name == arData.name);
            if (oDataIndex === -1)
                return;
            const oData = oDatas[oDataIndex];
            if (isValuesData(oData)) {
                arData.values = oData.values;
                delete arData.url;
            }
            else if (isUrlData(oData)) {
                arData.url = oData.url;
                delete arData.values;
            }
        });
    }
    function compileVegaARSpec(spec) {
        let nSpec = JSON.parse(JSON.stringify(spec));
        // check armode
        const arMode = nSpec.ar && nSpec.ar.mode;
        let arSyncScale = [];
        let reParseOSpec;
        if (arMode === 'ON') {
            arSyncScale = mergeONARData(nSpec);
        }
        else if (arMode === 'NN') ;
        else if (arMode === 'NO') {
            mergeNOARData(nSpec);
        }
        else {
            warn("Unknown AR Mode");
        }
        // Handle the normal view
        const hTransforms = isHierarchicalData(nSpec.data, nSpec.ar.data);
        if (hTransforms && nSpec.marks) {
            const { index, transforms, data: sourceData } = hTransforms;
            const hierachyT = transforms[index];
            // extend canvas
            if (hierachyT.as && (hierachyT.as[0] !== 'angle' || hierachyT.as[0] !== 'alpha')) {
                // 1. find direction
                const isVertical = (hierachyT.as[0] === 'y' && hierachyT.as[1] === 'x')
                    ? 0
                    : 1;
                // 2. modify size
                {
                    hierachyT.method === 'cluster'
                        ? 1.54
                        : 2.5;
                    const data = nSpec.data;
                    insert({
                        name: "_width_extent",
                        source: sourceData.source,
                        transform: [
                            transforms.find(t => t.type === 'stratify'),
                            { type: "tree" }
                        ]
                    }, {
                        name: "_o_width_extent",
                        source: "_width_extent",
                        transform: [
                            { "type": "filter", "expr": "!datum.__ar__" },
                            { "type": "aggregate", "groupby": ["depth"], "ops": ["count"] },
                            { "type": "extent", "field": "count", "signal": "_o_width_extent" }
                        ]
                    }, {
                        name: "_n_width_extent",
                        source: "_width_extent",
                        transform: [
                            { "type": "aggregate", "groupby": ["depth"], "ops": ["count"] },
                            { "type": "extent", "field": "count", "signal": "_n_width_extent" }
                        ]
                    }).to(data).at(data.findIndex(d => d.name === sourceData.name));
                    hierachyT.size[isVertical] = isSignalRef(hierachyT.size[isVertical])
                        ? { signal: `(${hierachyT.size[isVertical].signal})*(_n_width_extent[1]/_o_width_extent[1])` }
                        : vega.isNumber(hierachyT.size[isVertical])
                            ? { signal: `${hierachyT.size[isVertical]} * (_n_width_extent[1]/_o_width_extent[1])` }
                            : hierachyT.size[isVertical];
                }
                if (hierachyT.method === 'tidy') {
                    // add extent to signals
                    const data = nSpec.data;
                    insert({
                        name: "_depth_extent",
                        source: sourceData.source,
                        transform: [
                            transforms.find(t => t.type === 'stratify'),
                            { type: "tree" }
                        ]
                    }, {
                        name: "_o_depth_extent",
                        source: '_depth_extent',
                        transform: [
                            { "type": "filter", "expr": "!datum.__ar__" },
                            { "type": "extent", "field": "depth", "signal": "_o_depth_extent" }
                        ]
                    }, {
                        name: "_n_depth_extent",
                        source: '_depth_extent',
                        transform: [
                            { "type": "filter", "expr": "datum.__ar__" },
                            { "type": "extent", "field": "depth", "signal": "_n_depth_extent" }
                        ]
                    }).to(data).at(data.findIndex(d => d.name === sourceData.name));
                    const another = 1 - isVertical;
                    hierachyT.size[another] = isSignalRef(hierachyT.size[another])
                        ? { signal: `(${hierachyT.size[another].signal})*(_n_depth_extent[1] / _o_depth_extent[1])` } // @ HACK, *1.5
                        : vega.isNumber(hierachyT.size[another])
                            ? { signal: `(${hierachyT.size[another]})*(_n_depth_extent[1]/_o_depth_extent[1])` } //// ierachyT.size[another] * hackRatio // @ HACK, *1.5
                            : hierachyT.size[another];
                }
            }
            // save
            reParseOSpec = nSpec;
            const tmpSpec = JSON.parse(JSON.stringify(nSpec));
            // add transform
            {
                // hide the ar node
                insert({ type: 'filter', expr: "!datum.__ar__" })
                    .to(transforms)
                    .at(transforms.findIndex(t => t === hierachyT) + 1);
                // .at(index + 1)
                // for cluster layout
                if (hierachyT.method === 'cluster' && sourceData.source) {
                    insert({
                        type: "filter",
                        expr: `!datum.__ar__ || !(indata('${sourceData.source[0]}', 'id', datum.parent) && !indata('${sourceData.source[1]}', 'parent', datum.id))`
                    })
                        .to(transforms)
                        .at(transforms.findIndex(t => t === hierachyT) - 1);
                    // .at(index - 1)
                }
            }
            log('spec', nSpec);
            // oRuntime = vega.parse(nSpec, opt)
            // restore
            nSpec = tmpSpec;
        }
        return { nSpec, reParseOSpec, arSyncScale };
    }
    function arParse(spec, opt = { ar: false }) {
        let oSpec = spec;
        let oRuntime = vega__default['default'].parse(spec, opt);
        const arMode = spec.ar && spec.ar.mode;
        if (!opt.ar || !arMode) { // if force not ar, then directly return the runtime
            return { runtime: oRuntime };
        }
        // deep copy
        const { nSpec, reParseOSpec, arSyncScale } = compileVegaARSpec(spec);
        if (reParseOSpec) {
            oSpec = reParseOSpec;
            oRuntime = vega__default['default'].parse(reParseOSpec, opt);
        }
        const arRuntime = arMode === 'ON'
            ? vega__default['default'].parse(nSpec, Object.assign(Object.assign({}, opt), { background: "#fff" }))
            : (['NN', 'NO'].indexOf(arMode) !== -1
                ? vega__default['default'].parse(nSpec.ar, Object.assign(Object.assign({}, opt), { background: "#fff" }))
                : null);
        if (arRuntime) {
            arRuntime.arSyncScale = arSyncScale;
            arRuntime.arMode = arMode;
            arRuntime.arDirection = parseChartDirection(nSpec);
            arRuntime.isGeoSpec = isGeoSpec(nSpec);
            arRuntime.datasetNames = (spec.data || []).map((d) => d.name);
            arRuntime.datasetSpec = arRuntime.datasetNames.reduce((o, dn) => {
                o[dn] = (spec.data || []).find(d => d.name === dn);
                return o;
            }, {});
            const { dataFieldsEncoded, fixedVC } = collectDataFieldEncoded(nSpec);
            arRuntime.dataFieldEncoded = dataFieldsEncoded;
            arRuntime.fixedVC = fixedVC;
        }
        else {
            warn(`Unknown AR Mode:${arMode}`);
        }
        log('oSpec', oSpec);
        log('ARSpec', nSpec);
        return { runtime: oRuntime, arRuntime };
    }
    // {
    //   "type": "filter",
    //   "expr": "datum.__ar__ && (indata('tree_s1', 'id', datum.parent) && !indata('tree_s2', 'parent', datum.id) )"
    // }

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const scaleMap = {
        // quantitative scales
        'linear': 'quan',
        'log': 'quan',
        'pow': 'quan',
        'sqrt': 'quan',
        'symlog': 'quan',
        'time': 'quan',
        'utc': 'quan',
        // discrete scales
        'band': 'qual',
        'point': 'qual',
        'ordinal': 'qual'
    };
    function handleScale(view, arView) {
        for (const item of arView.arSyncScale.filter(isScaleItem)) {
            const { type: scaleType, name: scaleName, signalName } = item;
            const oScaleFn = view.scale(scaleName);
            const nScaleFn = arView.scale(scaleName);
            let diff = 0;
            if (scaleMap[scaleType] == 'qual') {
                const diffWidth = (nScaleFn.domain().length - oScaleFn.domain().length) * oScaleFn.step();
                diff = diffWidth + Math.abs(oScaleFn.range()[0] - oScaleFn.range()[1]);
            }
            else if (scaleMap[scaleType] == 'quan') {
                // nothing to be done
                const ticks = oScaleFn.ticks();
                const oldWidth = oScaleFn(ticks[1]) - oScaleFn(ticks[0]);
                const newWidth = nScaleFn(ticks[1]) - nScaleFn(ticks[0]);
                const ratio = oldWidth / newWidth;
                diff = ratio * Math.abs(oScaleFn.range()[0] - oScaleFn.range()[1]);
            }
            else {
                log('Unsupport scale type: ' + scaleType);
            }
            if (/\$width/.test(signalName)) {
                arView.signal('width', diff);
            }
            else if (/\$height/.test(signalName)) {
                arView.signal('height', diff);
            }
            arView.signal(signalName, diff);
        }
    }
    function handleTransform(view, arView) {
        for (const item of arView.arSyncScale.filter(isTransformItem)) {
            const { type, dataName, signalName } = item;
            switch (type) {
                case 'partition':
                    {
                        const oMaxLv = 1 + Math.max(...view.data(dataName).map((d) => d.depth));
                        const arMaxLv = 1 + Math.max(...arView.data(dataName).map((d) => d.depth));
                        const heightPerLv = arView.signal(signalName) / oMaxLv;
                        const nHeight = arMaxLv * heightPerLv;
                        const arg = arView.scenegraph().root;
                        arView.signal(signalName, nHeight)
                            .signal('width', arg.bounds.x2 - arg.bounds.x1)
                            .signal('height', arg.bounds.y2 - arg.bounds.y1);
                    }
                    break;
            }
        }
    }
    function syncScale(arView) {
        return __awaiter$2(this, void 0, void 0, function* () {
            yield arView.runAsync();
            const view = arView.dualView;
            if (arView.mode === "ON") {
                handleScale(view, arView);
                handleTransform(view, arView);
            }
            try {
                window.arView = arView;
                window.view = view;
            }
            catch (err) {
                error(err);
            }
            return arView;
        });
    }
    // d1.map(d => temp1.scale('x')(d.miles))
    // d2.map(d => temp2.scale('x')(d.miles))

    function isChanged(o, n, fields) {
        // to check whether there is skipFields in data
        // const skipKeys = new Set(n['_skipFields'] || [])
        const _fields = new Set();
        const _nextLevel = {};
        fields.forEach(f => {
            const layer = f.split('.');
            _fields.add(layer[0]);
            if (layer.length > 1) {
                if (!_nextLevel[layer[0]]) {
                    _nextLevel[layer[0]] = [];
                }
                _nextLevel[layer[0]].push(layer[1]);
            }
        });
        for (const key of Object.keys(o)) {
            if (!_fields.has(key)) {
                continue;
            }
            // new object miss some properies
            if (!n.hasOwnProperty(key))
                return { key };
            if (Array.isArray(o[key])) {
                for (let i = 0, len = o[key].length; i < len; ++i) {
                    let oItem = o[key][i];
                    if (Array.isArray(oItem)) {
                        oItem = oItem[0];
                        if (n[key].filter((ni) => ni[0].length === oItem.length)
                            .every((ni) => JSON.stringify(oItem) !== JSON.stringify(ni[0]))) {
                            return { key };
                        }
                    }
                    else {
                        const nItem = n[key][i];
                        // somehow hack
                        if (!nItem || JSON.stringify(oItem) !== JSON.stringify(nItem)) {
                            return { key };
                        }
                    }
                }
            }
            else if (vega.isObject(o[key])) {
                if (isChanged(o[key], n[key], _nextLevel[key])) {
                    return { key };
                }
            }
            else {
                if (o[key] !== n[key]) {
                    return { key };
                }
            }
        }
    }
    function evalDataNoUpdate(view, arView) {
        // Check old data consistence
        // let { data: datasets } = view.getState({ data: truthy, signals: falsy, recurse: true })
        const hints = [];
        const { datasetNames, fixedVC } = arView;
        // add all source to
        const allDataToCheck = new Set();
        const dataFieldEncoded = Object.assign({}, arView.dataFieldEncoded);
        datasetNames
            .filter(datasetName => dataFieldEncoded.hasOwnProperty(datasetName))
            .forEach(datasetName => {
            const dataSpec = arView.datasetSpec[datasetName];
            allDataToCheck.add(datasetName);
            if (dataSpec.source && datasetNames.indexOf(dataSpec.source) !== -1) {
                allDataToCheck.add(dataSpec.source);
                // merge
                if (!dataFieldEncoded[dataSpec.source]) {
                    dataFieldEncoded[dataSpec.source] = {};
                }
                Object.keys(dataFieldEncoded[datasetName])
                    .forEach(field => {
                    if (!dataFieldEncoded[dataSpec.source][field]) {
                        dataFieldEncoded[dataSpec.source][field] = new Set();
                    }
                    dataFieldEncoded[dataSpec.source][field] = union(dataFieldEncoded[dataSpec.source][field], dataFieldEncoded[datasetName][field]);
                });
            }
        });
        console.log('asdfasdf', allDataToCheck);
        Array.from(allDataToCheck)
            .forEach((datasetName) => {
            const idx = datasetNames.findIndex(d => d == datasetName);
            const fields = dataFieldEncoded[datasetName];
            log(`In dataset ${datasetName}, fields [${[...Object.keys(fields)].join(',')}] is used in vis`);
            const oDataset = view.data(datasetName);
            let nDataset;
            try {
                nDataset = arView.data(datasetName);
            }
            catch (error) {
                hints.push({
                    dataName: datasetName,
                    idx,
                    type: 'dataset',
                    msg: `This dataset does not exist in the 'data' of the new ArSpec`
                });
                return;
            }
            // log(`====> datasetName: ${datasetName}`, oDataset, nDataset)
            const dataSpec = arView.datasetSpec[datasetName];
            const dataspecTs = (dataSpec && dataSpec.transform) || [];
            const dataspecTsType = dataspecTs.map(t => t.type);
            console.log('datasetname', datasetName, ', fields', fields);
            for (let j = 0, len = oDataset.length; j < len; ++j) {
                const oData = oDataset[j];
                const nData = oData.id
                    ? nDataset.find(nd => nd.id === oData.id) // [j];
                    : nDataset[j];
                if (vega.isObject(oData) && vega.isObject(nData)) {
                    const change = isChanged(oData, nData, new Set(Object.keys(fields)));
                    if (change) {
                        const hint = {
                            dataName: datasetName,
                            idx,
                            type: 'dataValue',
                            msg: `In dataset '${datasetName}', the attribute '${change.key}' of old data will be changed due to the new data. You should either use another transform, or remove the encoding of '${change.key}' using '${Array.from(fields[change.key]).join(',')}' in the 'marks' block`,
                            key: change.key,
                            changed: { oData: oData, nData: nData }
                        };
                        // cluster mode
                        if (intersection(dataspecTsType, ["stratify", "tree"]).size == 2 &&
                            dataspecTs.find(t => t.type === 'tree').method === 'cluster') {
                            hint.transformIdx = dataspecTs.findIndex(t => t.type === 'tree');
                            hint.msg = `If new nodes are added to the leaf nodes of the original tree, 'cluster' method should not be used. Instead, you can use 'tidy' method`;
                        }
                        else if (intersection(dataspecTsType, ["partition"]).size == 1) {
                            hint.transformIdx = dataspecTs.findIndex(t => t.type === 'partition');
                            hint.msg = `If new nodes are added to the internal nodes of the original tree, 'partition' transform should not be used. Instead, you can use 'tree' transform`;
                        }
                        else if (intersection(dataspecTsType, ['treemap']).size == 1) {
                            hint.transformIdx = dataspecTs.findIndex(t => t.type === 'treemap');
                            hint.msg = `If new nodes are added to the internal nodes of the original tree, 'treemap' transform should not be used. Instead, you can use 'tree' transform`;
                        }
                        else if (intersection(dataspecTsType, ["contour"]).size == 1) {
                            hint.transformIdx = dataspecTs.findIndex(t => t.type === 'contour');
                            hint.msg = `The old contour has been modified due to the new data. You should either not use 'contour' transform, or incease the minumin threshold value.`;
                        }
                        else if (intersection(dataspecTsType, ["pie"]).size == 1) {
                            hint.transformIdx = dataspecTs.findIndex(t => t.type === 'pie');
                            hint.msg = `If new data items are added to this dataset, 'pie' transform should not be used`;
                        }
                        else if (intersection(dataspecTsType, ["formula", "window", "lookup"]).size == 3) {
                            hint.transformIdx = dataspecTs.findIndex(t => t.type === 'formula' && t.as === "degree");
                        }
                        hints.push(hint);
                        break;
                    }
                }
                else if (oData !== nData) {
                    hints.push({
                        dataName: datasetName,
                        idx,
                        type: 'dataItem',
                        msg: `In dataset '${datasetName}', the data item ${oData.id ? 'with id' : 'at index'} ${oData.id || j} has been changed.`,
                        changed: { oData, nData }
                    });
                }
            }
        });
        return hints;
    }

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class ARView extends vega.View {
        constructor(arRuntime, runtime, options) {
            super(arRuntime, options);
            this._debug = false;
            this._vDirection = 'Top';
            this._hDirection = 'Left';
            this._arHints = [];
            this._dualView = new vega__default['default'].View(runtime, options);
            this._arSyncScale = arRuntime.arSyncScale;
            this._arMode = arRuntime.arMode;
            const { v, h } = arRuntime.arDirection;
            this._vDirection = v;
            this._hDirection = h;
            this._datasetNames = arRuntime.datasetNames;
            this._dataFieldEncoded = arRuntime.dataFieldEncoded;
            this._datasetSpec = arRuntime.datasetSpec;
            this._fixedVC = arRuntime.fixedVC;
            this._isGeoSpec = arRuntime.isGeoSpec;
            this.debug = options.debug === true;
        }
        get mode() { return this._arMode; }
        get dualView() { return this._dualView; }
        set debug(v) {
            this._debug = v;
            const container = this.container();
            container && (container.style.opacity = this._debug ? '0.5' : '1');
        }
        get arSyncScale() { return this._arSyncScale; }
        get vDirection() { return this._vDirection; }
        get hDirection() { return this._hDirection; }
        get datasetNames() { return this._datasetNames; }
        get arHints() { return this._arHints; }
        get dataFieldEncoded() { return this._dataFieldEncoded; }
        get fixedVC() { return this._fixedVC; }
        get datasetSpec() { return this._datasetSpec; }
        static createARContainer(container, isDebug = false, isGeoSpec = false) {
            const arContainerId = `ar__${container.id}`;
            const elementSibling = container.previousElementSibling || container.nextElementSibling;
            let arContainer;
            if (elementSibling && elementSibling.id === arContainerId) {
                arContainer = elementSibling;
                // detach for re-ordering
                arContainer.remove();
            }
            else {
                arContainer = container.cloneNode();
                arContainer.id = arContainerId;
            }
            log('#createARContainer ===> insert ARcontainer to container');
            container.insertAdjacentElement(isGeoSpec ? 'afterend' : 'beforebegin', arContainer);
            // clean arContainer styles
            arContainer.style.left = null;
            arContainer.style.top = null;
            arContainer.style.margin = null;
            // set container styles
            container.style.position = isDebug ? 'absolute' : 'relative';
            container.style.margin = isDebug
                ? container.parentElement && (container.parentElement.style.padding || getComputedStyle(container.parentElement).padding)
                : '0px';
            arContainer.style.opacity = isDebug ? '0.5' : '1';
            arContainer.style.display = isDebug ? '' : 'none';
            return arContainer;
        }
        static attachedARContainer(dom, isDebug = false, isGeoSpec = false) {
            const container = typeof dom === 'string'
                ? document.querySelector(dom)
                : dom;
            const arContainer = container
                ? ARView.createARContainer(container, isDebug, isGeoSpec)
                : dom;
            if (!arContainer) {
                error('#attachedARContainer ==> No chart container!');
            }
            return arContainer;
        }
        syncScale() {
            return __awaiter$1(this, void 0, void 0, function* () {
                return yield syncScale(this);
            });
        }
        runAsync(encode, prerun, postrun) {
            const _super = Object.create(null, {
                runAsync: { get: () => super.runAsync },
                scenegraph: { get: () => super.scenegraph }
            });
            return __awaiter$1(this, void 0, void 0, function* () {
                if (this._dualView) {
                    yield this._dualView.runAsync.bind(this._dualView)(encode, prerun, postrun);
                }
                const ret = yield _super.runAsync.bind(this)(encode, prerun, postrun);
                // store at the first time
                // if (!this._arHints.length) {
                // hint
                if (this._arMode === 'ON') {
                    // evaluate if data changed after all transforms
                    this._arHints = evalDataNoUpdate(this._dualView, ret);
                    log('Update AR hints', this._arHints);
                }
                // }
                const dualViewContainer = this._dualView.container();
                if (this._debug) {
                    // auto-position
                    const sg = this._dualView.scenegraph().root;
                    const arSg = _super.scenegraph.call(this).root;
                    const sgBounds = sg.bounds;
                    const arSgBounds = arSg.bounds;
                    if (this._arMode != 'ON') {
                        if (dualViewContainer) {
                            // pivot point is top left
                            dualViewContainer.style.left = '0px';
                            dualViewContainer.style.top = '0px';
                        }
                        return ret;
                    }
                    if (dualViewContainer) {
                        // rules to check direction
                        switch (this.hDirection) {
                            case 'Left':
                                {
                                    dualViewContainer.style.left = `${Math.floor(Math.abs(arSgBounds.x1 - sgBounds.x1))}px`;
                                }
                                break;
                        }
                        switch (this.vDirection) {
                            case 'Top':
                                {
                                    const dy1 = Math.abs(arSgBounds.y1 - sgBounds.y1);
                                    const dy2 = Math.abs(arSgBounds.y2 - sgBounds.y2);
                                    dualViewContainer.style.top = `${Math.floor(Math.min(dy1, dy2))}px`;
                                }
                                break;
                            case 'Down':
                                {
                                    const dy1 = Math.abs(arSgBounds.y1 - sgBounds.y1);
                                    const dy2 = Math.abs(arSgBounds.y2 - sgBounds.y2);
                                    dualViewContainer.style.top = `${Math.floor(Math.max(dy1, dy2))}px`;
                                }
                                break;
                        }
                    }
                }
                else {
                    if (dualViewContainer) {
                        dualViewContainer.style.top = `0px`;
                        dualViewContainer.style.left = `0px`;
                    }
                }
                return ret;
            });
        }
        getAlignPadding() {
            let vv = 0;
            let hv = 0;
            const sg = this._dualView.scenegraph().root;
            const arSg = super.scenegraph().root;
            const sgBounds = sg.bounds;
            const arSgBounds = arSg.bounds;
            // rules to check direction
            switch (this.hDirection) {
                case 'Left':
                    {
                        hv = Math.floor(Math.abs(arSgBounds.x1 - sgBounds.x1));
                    }
                    break;
            }
            switch (this.vDirection) {
                case 'Top':
                    {
                        const dy1 = Math.abs(arSgBounds.y1 - sgBounds.y1);
                        const dy2 = Math.abs(arSgBounds.y2 - sgBounds.y2);
                        vv = Math.floor(Math.min(dy1, dy2));
                    }
                    break;
                case 'Down':
                    {
                        const dy1 = Math.abs(arSgBounds.y1 - sgBounds.y1);
                        const dy2 = Math.abs(arSgBounds.y2 - sgBounds.y2);
                        vv = Math.floor(Math.max(dy1, dy2));
                    }
                    break;
            }
            const dualViewContainer = this._dualView.container();
            const arViewContainer = this.container();
            if (this._arMode != 'ON') {
                if (dualViewContainer) {
                    // pivot point is top left
                    vv = 0;
                    hv = 0;
                }
            }
            console.log('arSgBounds', arSgBounds);
            console.log('sgBounds', sgBounds);
            let res = {
                v: this.vDirection,
                vv: arViewContainer.clientHeight - dualViewContainer.clientHeight - vv,
                // vv: Math.abs(arSgBounds.y2 - arSgBounds.y1 - sgBounds.y2 + sgBounds.y1) - vv,
                h: this.hDirection,
                hv,
            };
            console.log('result', res);
            return res;
        }
        renderer(renderer) {
            if (this._dualView) {
                this._dualView.renderer(renderer);
            }
            return super.renderer(renderer);
        }
        initialize(dom) {
            if (this._dualView && dom) {
                this._dualView.initialize(dom); // initialize only when dom is not none
            }
            // set debug when initialize
            const arContainer = (dom && this._rendererType !== 'none')
                ? ARView.attachedARContainer(dom, this._debug, this._isGeoSpec) // if dom & not rendererType === none, attach AR container
                : dom; // otherwise, default
            return arContainer ? super.initialize(arContainer) : this; // initialize only when dom is not none
        }
        hover() {
            if (this._dualView) {
                this._dualView.hover();
            }
            return super.hover();
        }
        finalize() {
            if (this._dualView) {
                this._dualView.finalize();
            }
            return super.finalize();
        }
    }

    // @ts-nocheck
    class CleanView extends vega.View {
        static cleanARContainer(container) {
            // if no container
            if (!container) {
                return;
            }
            // if selector
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            const arContainerId = `ar__${container.id}`;
            const nextElementSibling = container.previousElementSibling;
            let arContainer;
            if (nextElementSibling && nextElementSibling.id === arContainerId) {
                arContainer = nextElementSibling;
                arContainer.remove();
            }
            // clean container styles
            container.style.position = 'relative';
            container.style.display = '';
            container.style.top = null;
            container.style.left = null;
            container.style.margin = null;
            // if(container.style.margin === '10px') {
            //   container.style.margin = null
            // }
        }
        initialize(dom) {
            CleanView.cleanARContainer(dom);
            return super.initialize(dom);
        }
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    function arView(arRuntime, runtime, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: sync scale on demand (only ar mode ON requires scale extension)
            return arRuntime
                ? (new ARView(arRuntime, runtime, options)).syncScale()
                : new CleanView(runtime, options);
        });
    }

    const escapedChars = {
        'b': '\b',
        'f': '\f',
        'n': '\n',
        'r': '\r',
        't': '\t',
        '"': '"',
        '/': '/',
        '\\': '\\'
    };
    const A_CODE = 'a'.charCodeAt(0);
    function jsonParse(source) {
        const pointers = {};
        let line = 0;
        let column = 0;
        let pos = 0;
        return {
            data: _parse('', true),
            pointers: pointers
        };
        function _parse(ptr, topLevel = false) {
            whitespace();
            let data;
            map(ptr, 'value');
            var char = getChar();
            switch (char) {
                case 't':
                    read('rue');
                    data = true;
                    break;
                case 'f':
                    read('alse');
                    data = false;
                    break;
                case 'n':
                    read('ull');
                    data = null;
                    break;
                case '"':
                    data = parseString();
                    break;
                case '[':
                    data = parseArray(ptr);
                    break;
                case '{':
                    data = parseObject(ptr);
                    break;
                default:
                    backChar();
                    if ('-0123456789'.indexOf(char) >= 0)
                        data = parseNumber();
                    else
                        unexpectedToken();
            }
            map(ptr, 'valueEnd');
            whitespace();
            if (topLevel && pos < source.length)
                unexpectedToken();
            return data;
        }
        function whitespace() {
            loop: while (pos < source.length) {
                switch (source[pos]) {
                    case ' ':
                        column++;
                        break;
                    case '\t':
                        column += 4;
                        break;
                    case '\r':
                        column = 0;
                        break;
                    case '\n':
                        column = 0;
                        line++;
                        break;
                    default: break loop;
                }
                pos++;
            }
        }
        function parseString() {
            var str = '';
            var char;
            while (true) {
                char = getChar();
                if (char == '"') {
                    break;
                }
                else if (char == '\\') {
                    char = getChar();
                    if (char in escapedChars)
                        str += escapedChars[char];
                    else if (char == 'u')
                        str += getCharCode();
                    else
                        wasUnexpectedToken();
                }
                else {
                    str += char;
                }
            }
            return str;
        }
        function parseNumber() {
            var numStr = '';
            if (source[pos] == '-')
                numStr += getChar();
            numStr += source[pos] == '0'
                ? getChar()
                : getDigits();
            if (source[pos] == '.')
                numStr += getChar() + getDigits();
            if (source[pos] == 'e' || source[pos] == 'E') {
                numStr += getChar();
                if (source[pos] == '+' || source[pos] == '-')
                    numStr += getChar();
                numStr += getDigits();
            }
            return +numStr;
        }
        function parseArray(ptr) {
            whitespace();
            const arr = [];
            var i = 0;
            if (getChar() == ']')
                return arr;
            backChar();
            while (true) {
                const itemPtr = ptr + '/' + i;
                arr.push(_parse(itemPtr));
                whitespace();
                var char = getChar();
                if (char == ']')
                    break;
                if (char != ',')
                    wasUnexpectedToken();
                whitespace();
                i++;
            }
            return arr;
        }
        function parseObject(ptr) {
            whitespace();
            var obj = {};
            if (getChar() == '}')
                return obj;
            backChar();
            while (true) {
                var loc = getLoc();
                if (getChar() != '"')
                    wasUnexpectedToken();
                var key = parseString();
                var propPtr = ptr + '/' + escapeJsonPointer(key);
                mapLoc(propPtr, 'key', loc);
                map(propPtr, 'keyEnd');
                whitespace();
                if (getChar() != ':')
                    wasUnexpectedToken();
                whitespace();
                obj[key] = _parse(propPtr);
                whitespace();
                var char = getChar();
                if (char == '}')
                    break;
                if (char != ',')
                    wasUnexpectedToken();
                whitespace();
            }
            return obj;
        }
        function read(str) {
            for (var i = 0; i < str.length; i++)
                if (getChar() !== str[i])
                    wasUnexpectedToken();
        }
        function getChar() {
            checkUnexpectedEnd();
            const char = source[pos];
            pos++;
            column++; // new line?
            return char;
        }
        function backChar() {
            pos--;
            column--;
        }
        function getCharCode() {
            var count = 4;
            var code = 0;
            while (count--) {
                code <<= 4;
                var char = getChar().toLowerCase();
                if (char >= 'a' && char <= 'f')
                    code += char.charCodeAt(0) - A_CODE + 10;
                else if (char >= '0' && char <= '9')
                    code += +char;
                else
                    wasUnexpectedToken();
            }
            return String.fromCharCode(code);
        }
        function getDigits() {
            var digits = '';
            while (source[pos] >= '0' && source[pos] <= '9')
                digits += getChar();
            if (digits.length)
                return digits;
            checkUnexpectedEnd();
            unexpectedToken();
        }
        function map(ptr, prop) {
            mapLoc(ptr, prop, getLoc());
        }
        function mapLoc(ptr, prop, loc) {
            pointers[ptr] = pointers[ptr] || {};
            pointers[ptr][prop] = loc;
        }
        function getLoc() {
            return {
                line: line,
                column: column,
                pos: pos
            };
        }
        function unexpectedToken() {
            throw new SyntaxError('Unexpected token ' + source[pos] + ' in JSON at position ' + pos);
        }
        function wasUnexpectedToken() {
            backChar();
            unexpectedToken();
        }
        function checkUnexpectedEnd() {
            if (pos >= source.length)
                throw new SyntaxError('Unexpected end of JSON input');
        }
    }
    const ESC_0 = /~/g;
    const ESC_1 = /\//g;
    function escapeJsonPointer(str) {
        return str.replace(ESC_0, '~0')
            .replace(ESC_1, '~1');
    }

    exports.ARView = ARView;
    exports.CleanView = CleanView;
    exports.arParse = arParse;
    exports.arView = arView;
    exports.compileVegaARSpec = compileVegaARSpec;
    exports.error = error;
    exports.jsonParse = jsonParse;
    exports.log = log;
    exports.publish = publish;
    exports.warn = warn;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vega-ar.js.map
