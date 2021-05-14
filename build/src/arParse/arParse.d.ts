import { Spec } from 'vega';
import { ARSpec } from '../type';
export interface ARParseOption {
    ar?: boolean;
    [opt: string]: any;
}
export declare function compileVegaARSpec(spec: ARSpec): {
    nSpec: ARSpec;
    reParseOSpec: ARSpec | undefined;
    arSyncScale: any[];
};
export declare function arParse(spec: ARSpec | Spec, opt?: ARParseOption): {
    runtime: any;
    arRuntime?: undefined;
} | {
    runtime: any;
    arRuntime: any;
};
