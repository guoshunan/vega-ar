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
import { ARView } from './arView';
import { CleanView } from './cleanView';
export function arView(arRuntime, runtime, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: sync scale on demand (only ar mode ON requires scale extension)
        return arRuntime
            ? (new ARView(arRuntime, runtime, options)).syncScale()
            : new CleanView(runtime, options);
    });
}
export { ARView } from './arView';
export { CleanView } from './cleanView';
//# sourceMappingURL=index.js.map