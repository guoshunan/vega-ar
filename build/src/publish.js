var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { log, error } from './utils';
// const API_URL = 'http://vegaarapi.hkustvis.org'
const API_URL = 'http://localhost:8001';
export function publish(el, spec, arView) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. check url data source
        const urlToDatas = {};
        if (spec.data) {
            const urlToFullUrl = {};
            const urlDatas = spec.data.filter(d => 'url' in d);
            // assume all url is string
            // Cache the data for each url
            yield Promise.all(urlDatas.map(({ url, name }) => __awaiter(this, void 0, void 0, function* () {
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
    return __awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=publish.js.map