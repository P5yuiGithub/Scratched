import {registry} from './registry.ts';

export class DraggableNode {
    element: HTMLDivElement;
    dragging = false;

    offsetX = 0;
    offsetY = 0;

    cameraPos;
    getZoom;

    constructor(
        cameraPos: { x: number; y: number },
        getZoom: () => number,
        type: string,
    ) {
        this.cameraPos = cameraPos;
        this.getZoom = getZoom;

        this.element = document.createElement('div');
        this.element.className = 'node';

        let nodeText = document.createElement('div');
        nodeText.className = 'node-text';
        nodeText.textContent = type;
        this.element.appendChild(nodeText);

        if (registry[type]) {
            const nodeData = registry[type];
            if (nodeData.inputs) {
                for (let i = 1; i <= nodeData.inputs.length; i++) {
                    const input = document.createElement('div');
                    input.className = "input-port";
                    input.style.top = `${100 / (nodeData.inputs.length + 1) * i}%`;
                    this.element.appendChild(input);
                }
            };
            if (nodeData.outputs) {
            for (let i = 1; i <= nodeData.outputs.length; i++) {
                    const output = document.createElement('div');
                    output.className = "output-port";
                    output.style.top = `${100 / (nodeData.outputs.length + 1) * i}%`;
                    this.element.appendChild(output);
                }
            };
        }

        this.element.addEventListener('mousedown', (event: MouseEvent) => {
            event.stopPropagation();

            this.dragging = true;

            const rect = this.element.getBoundingClientRect();

            this.offsetX = event.clientX - rect.left;
            this.offsetY = event.clientY - rect.top;

            this.element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (event: MouseEvent) => {
            if (!this.dragging) return;

            const zoom = this.getZoom();

            const x =
                (event.clientX - this.cameraPos.x) / zoom - this.offsetX;

            const y =
                (event.clientY - this.cameraPos.y) / zoom - this.offsetY;

            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        });

        document.addEventListener('mouseup', () => {
            this.dragging = false;
            this.element.style.cursor = 'grab';
        });
    }
}