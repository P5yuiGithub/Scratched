import './style.css';
import './node.ts';

const grid = document.getElementById('bg-grid') as HTMLDivElement;
const nodeSelector = document.getElementById('node-selector') as HTMLDivElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
const node = document.getElementById('node') as HTMLDivElement;
//const otherNode = new Node()

let dragging = false;
let startPos = {x: 0, y: 0};
let currentPos = {x: 0, y: 0};
let targetPos = {x: 0, y: 0};
let dragSpeed = 0.1;

let draggingNode = false
let offsetPos = {x: 0, y: 0}

let currentZoom = 1;
let targetZoom = 1;

node.addEventListener('mousedown', (event: MouseEvent) => {
    draggingNode = true;
    const rect = node.getBoundingClientRect();
    offsetPos.x = event.clientX - rect.left;
    offsetPos.y = event.clientY - rect.top;
    node.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (event: MouseEvent) => {
    if (draggingNode) {
        node.style.left = `${event.clientX - offsetPos.x}px`;
        node.style.top = `${event.clientY - offsetPos.y}px`;
    };
});

node.addEventListener('mouseup', (event: MouseEvent) => {
    draggingNode = false;
    node.style.cursor = 'grab';
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
    grid.style.backgroundSize = `${gridSize}px ${gridSize}px`;
    grid.style.backgroundPosition = `${x}px ${y}px`;

    requestAnimationFrame(animate);
};

animate();