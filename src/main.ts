import './style.css';
import {DraggableNode} from './node.ts';
import {registry} from './registry.ts';
import {state} from './state.ts';

const grid = document.getElementById('bg-grid') as HTMLDivElement;
const nodeSelector = document.getElementById('node-selector') as HTMLDivElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
const world = document.getElementById('world') as HTMLDivElement;
const svg = document.getElementById('connections') as unknown as SVGSVGElement;

let dragging = false;
let startPos = {x: 0, y: 0};
let currentPos = {x: 0, y: 0};
let targetPos = {x: 0, y: 0};
let dragSpeed = 0.1;

let currentZoom = 1;
let targetZoom = 1;

let nodePlacePos = {x: 0, y: 0};

const WORLD_SIZE = 10000;

targetPos.x = window.innerWidth / 2 - WORLD_SIZE / 2;
targetPos.y = window.innerHeight / 2 - WORLD_SIZE / 2;

currentPos.x = targetPos.x;
currentPos.y = targetPos.y;

Object.entries(registry).forEach(([type, value]) => {
    const button = document.createElement('div');
    button.textContent = type;
    button.className = 'selector-button'
    nodeSelector.appendChild(button);

    button.addEventListener('click', (event: MouseEvent) => {
        const node = new DraggableNode(currentPos, () => currentZoom, type);

        const worldX = (nodePlacePos.x - currentPos.x) / currentZoom;
        const worldY = (nodePlacePos.y - currentPos.y) / currentZoom;

        node.element.style.left = `${worldX}px`;
        node.element.style.top = `${worldY}px`;

        world.appendChild(node.element);
        
        nodeSelector.classList.add('hidden');
        overlay.classList.add('hidden');
    }); 
});

grid.addEventListener('mousedown', (event: MouseEvent) => {
    if (nodeSelector.style.display !== 'block') {
        dragging = true;
        startPos.x = event.clientX - targetPos.x;
        startPos.y = event.clientY - targetPos.y;
        grid.style.cursor = 'grabbing';
    };
});

overlay.addEventListener('click', (event: MouseEvent) => {
    nodeSelector.classList.add('hidden');
    overlay.classList.add('hidden');
});

grid.addEventListener('dblclick', (event: MouseEvent) => {
    nodeSelector.classList.remove('hidden');
    overlay.classList.remove('hidden');

    nodePlacePos = {x: event.clientX, y: event.clientY}
});

window.addEventListener('mousemove', (event: MouseEvent) => {
    if (state.connectionPort) {
        const zoom = currentZoom;
        const r1 = state.connectionPort.getBoundingClientRect();
        const x1 = (r1.left + r1.width / 2 - currentPos.x) / zoom;
        const y1 = (r1.top + r1.height / 2 - currentPos.y) / zoom;
        const x2 = (event.clientX - currentPos.x) / zoom;
        const y2 = (event.clientY - currentPos.y) / zoom;

        let pendingPath = svg.querySelector('#pending-connection') as SVGPathElement | null;
        if (!pendingPath) {
            pendingPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pendingPath.id = 'pending-connection';
            pendingPath.setAttribute('stroke', 'white');
            pendingPath.setAttribute('stroke-width', '2');
            pendingPath.setAttribute('fill', 'none');
            svg.appendChild(pendingPath);
        }
        pendingPath.setAttribute('d', `M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`);
    }

    if (!dragging) return;
    targetPos.x = event.clientX - startPos.x;
    targetPos.y = event.clientY - startPos.y;
});

window.addEventListener('mouseup', () => {
    dragging = false;
    grid.style.cursor = 'grab';
    document.getElementById('pending-connection')?.remove();
    state.connectionPort = null;
});

window.addEventListener('wheel', (event: WheelEvent) => {
    if (nodeSelector.style.display === 'block') return
    event.preventDefault();
    const prevZoom = targetZoom;
    targetZoom *= 1 - event.deltaY / 2000;
    targetZoom = Math.max(0.1, Math.min(10, targetZoom));
    const zoomFactor = targetZoom / prevZoom;
    targetPos.x = event.clientX - (event.clientX - targetPos.x) * zoomFactor;
    targetPos.y = event.clientY - (event.clientY - targetPos.y) * zoomFactor;
}, { passive: false });

const animate = () => {
    currentZoom += (targetZoom - currentZoom) * 0.1;
    currentPos.x += (targetPos.x - currentPos.x) * dragSpeed;
    currentPos.y += (targetPos.y - currentPos.y) * dragSpeed;

    const gridSize = 120 * currentZoom;
    const x = currentPos.x % gridSize;
    const y = currentPos.y % gridSize;
    world.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px) scale(${currentZoom})`;

    requestAnimationFrame(animate);
};

animate();