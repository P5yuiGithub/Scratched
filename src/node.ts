class Node {
    element: HTMLDivElement;
    dragging = false;

    offsetX = 0;
    offsetY = 0;

    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'node';
        this.element.addEventListener('mousedown', (event: MouseEvent) => {
            this.dragging = true;
            const rect = this.element.getBoundingClientRect();
            this.offsetX = event.clientX - rect.left;
            this.offsetY = event.clientY - rect.top;
            this.element.style.cursor = 'grabbing';
        });
        this.element.addEventListener('mouseup', (event: MouseEvent) => {
            this.dragging = false;
            this.element.style.cursor = 'grab';
        });
    }
}