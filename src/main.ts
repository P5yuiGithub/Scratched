import './style.css';
import {DraggableNode} from './node.ts';
import {registry} from './registry.ts';

const grid = document.getElementById('bg-grid') as HTMLDivElement;
const nodeSelector = document.getElementById('node-selector') as HTMLDivElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
const world = document.getElementById('world') as HTMLDivElement;

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
    if (!dragging) return;
    targetPos.x = event.clientX - startPos.x;
    targetPos.y = event.clientY - startPos.y;
});

window.addEventListener('mouseup', () => {
    dragging = false;
    grid.style.cursor = 'grab';
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