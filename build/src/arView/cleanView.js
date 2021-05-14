// @ts-nocheck
import { View } from 'vega';
export class CleanView extends View {
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
//# sourceMappingURL=cleanView.js.map