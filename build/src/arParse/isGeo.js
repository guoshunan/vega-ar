export function isGeoSpec(spec) {
    return (spec.projections !== undefined && spec.projections.some(p => p.name === 'projection')) ||
        (spec.data !== undefined && spec.data.some(d => d.transform !== undefined && d.transform.some(t => t.type === 'treemap' || t.type === 'partition'))) ||
        (spec.data !== undefined && spec.data.some(d => d.transform !== undefined && d.transform.some(t => t.type === 'contour'))) ||
        (spec.marks !== undefined && spec.marks.some(m => m.type === 'image'));
}
//# sourceMappingURL=isGeo.js.map