// @ts-nocheck
import { isString, isArray, isNumber } from 'vega';
import { isDataReference, isSignalRef, isDiscreteScale, toArray, warn, log } from '../utils';
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
        if (!isNumber(signalValue)) {
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
export function dfsDatasource(node, datas) {
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
export function parseScale(scale, dataName, nSpec) {
    const { domain, name: scaleName, type: scaleType } = scale;
    if (!scaleType) {
        log(`Scale ${scaleName} must have a scale type`);
        return;
    }
    if (isDataReference(domain) &&
        dependsDataSource(domain.data, nSpec, dataName) &&
        'range' in scale) {
        const { range } = scale;
        if (isSignalRef(range)) {
        }
        else if (isString(range)) {
            const signalName = wrapChartHandW(dataName, scaleName, range, nSpec);
            if (signalName) {
                scale.range = (range === 'height' && !isDiscreteScale(scaleType))
                    ? [{ signal: signalName }, 0]
                    : [0, { signal: signalName }];
                return [{ type: scaleType, name: scaleName, dataName, signalName, _type: 'scale' }];
            }
        }
        else if (isArray(range)) {
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
//# sourceMappingURL=scale.js.map