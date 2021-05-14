var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { isScaleItem, isTransformItem, log, error } from '../utils';
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
export function syncScale(arView) {
    return __awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=scale.js.map