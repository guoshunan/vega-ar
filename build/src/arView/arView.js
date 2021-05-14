var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-nocheck
import vega, { View } from 'vega';
import { syncScale } from './scale';
import { evalDataNoUpdate } from './evaluate';
import { error, log } from '../utils';
export class ARView extends View {
    constructor(arRuntime, runtime, options) {
        super(arRuntime, options);
        this._debug = false;
        this._vDirection = 'Top';
        this._hDirection = 'Left';
        this._arHints = [];
        this._dualView = new vega.View(runtime, options);
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
        return __awaiter(this, void 0, void 0, function* () {
            return yield syncScale(this);
        });
    }
    runAsync(encode, prerun, postrun) {
        const _super = Object.create(null, {
            runAsync: { get: () => super.runAsync },
            scenegraph: { get: () => super.scenegraph }
        });
        return __awaiter(this, void 0, void 0, function* () {
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
                        case 'Right':
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
            case 'Right':
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
//# sourceMappingURL=arView.js.map