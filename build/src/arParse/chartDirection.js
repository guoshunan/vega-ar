import { isGroupMark, warn } from '../utils';
export function parseChartDirection(spec) {
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
//# sourceMappingURL=chartDirection.js.map