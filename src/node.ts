import {registry} from './registry.ts';
import {state} from './state.ts';

const svg = document.getElementById('connections') as unknown as SVGSVGElement;

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
                    
                    input.addEventListener('mousedown', (event: MouseEvent) => {
                        state.connectionPort = input;
                        event.stopPropagation();
                    });
                    input.addEventListener('mouseup', (event: MouseEvent) => {
                        if (!state.connectionPort) return;
                        if (state.connectionPort.className !== "output-port") return;
    
                        const zoom = this.getZoom();
                        
                        const r1 = state.connectionPort.getBoundingClientRect();
                        const r2 = input.getBoundingClientRect();
                        
                        const x1 = (r1.left + r1.width / 2 - this.cameraPos.x) / zoom;
                        const y1 = (r1.top + r1.height / 2 - this.cameraPos.y) / zoom;
                        const x2 = (r2.left + r2.width / 2 - this.cameraPos.x) / zoom;
                        const y2 = (r2.top + r2.height / 2 - this.cameraPos.y) / zoom;
                        
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', `M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`);
                        path.setAttribute('stroke', 'white');
                        path.setAttribute('stroke-width', '2');
                        path.setAttribute('fill', 'none');
                        svg.appendChild(path);
                        
                        state.connectionPort = null;
                    });
                }
            };
            if (nodeData.outputs) {
            for (let i = 1; i <= nodeData.outputs.length; i++) {
                    const output = document.createElement('div');
                    output.className = "output-port";
                    output.style.top = `${100 / (nodeData.outputs.length + 1) * i}%`;
                    this.element.appendChild(output);

                    output.addEventListener('mousedown', (event: MouseEvent) => {
                        state.connectionPort = output;
                        event.stopPropagation();
                    });
                    output.addEventListener('mouseup', (event: MouseEvent) => {
                        if (!state.connectionPort) return;
                        if (state.connectionPort.className !== "input-port") return;
    
                        const zoom = this.getZoom();
                        
                        const r1 = state.connectionPort.getBoundingClientRect();
                        const r2 = output.getBoundingClientRect();
                        
                        const x1 = (r1.left + r1.width / 2 - this.cameraPos.x) / zoom;
                        const y1 = (r1.top + r1.height / 2 - this.cameraPos.y) / zoom;
                        const x2 = (r2.left + r2.width / 2 - this.cameraPos.x) / zoom;
                        const y2 = (r2.top + r2.height / 2 - this.cameraPos.y) / zoom;
                        
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', `M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`);
                        path.setAttribute('stroke', 'white');
                        path.setAttribute('stroke-width', '2');
                        path.setAttribute('fill', 'none');
                        svg.appendChild(path);
                        
                        state.connectionPort = null;
                    });
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