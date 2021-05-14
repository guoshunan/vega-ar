import vega, { View, Renderers } from 'vega';
import { TransformItem, ScaleItem, ARHint, ChartVDirection, ChartHDirection, DataToFieldToVC } from '../type';
export interface ARViewOption {
    container?: string | Element;
    renderer?: string;
    debug?: boolean;
    [opt: string]: any;
}
export declare class ARView extends View {
    private _arMode;
    get mode(): string;
    private _dualView;
    get dualView(): vega.View;
    private _debug;
    set debug(v: boolean);
    private _arSyncScale;
    get arSyncScale(): (TransformItem | ScaleItem)[];
    private _vDirection;
    get vDirection(): ChartVDirection;
    private _hDirection;
    get hDirection(): ChartHDirection;
    private _datasetNames;
    get datasetNames(): string[];
    private _arHints;
    get arHints(): ARHint[];
    private _dataFieldEncoded;
    get dataFieldEncoded(): DataToFieldToVC;
    private _fixedVC;
    get fixedVC(): Set<string>;
    private _datasetSpec;
    get datasetSpec(): any[];
    private _isGeoSpec;
    private static createARContainer;
    private static attachedARContainer;
    constructor(arRuntime: any, runtime: any, options: ARViewOption);
    syncScale(): Promise<ARView>;
    runAsync(encode?: any, prerun?: any, postrun?: any): Promise<ARView>;
    getAlignPadding(): {
        v: ChartVDirection;
        vv: number;
        h: ChartHDirection;
        hv: number;
    };
    renderer(renderer: Renderers): this;
    initialize(dom?: string | Element): this;
    hover(): this;
    finalize(): this;
}
