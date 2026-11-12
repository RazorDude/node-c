// full-screen viewer for mermaid diagrams: wheel to zoom, drag to pan, double-click to reset, Esc to close
export class MermaidZoom {
  private content: HTMLDivElement | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragging = false;
  private fitScale = 1;
  private fitX = 0;
  private fitY = 0;
  private moved = false;
  private overlay: HTMLDivElement | null = null;
  private scale = 1;
  private x = 0;
  private y = 0;

  listen(): void {
    // delegated, because the plugin re-renders the svg on every theme switch
    document.addEventListener('click', event => {
      if (this.overlay) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const diagram = target.closest('.vp-doc .mermaid');
      if (!diagram) {
        return;
      }
      const svg = diagram.querySelector('svg');
      if (svg) {
        this.open(svg);
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  }

  private applyTransform(): void {
    if (this.content) {
      this.content.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    }
  }

  private close(): void {
    if (!this.overlay) {
      return;
    }
    this.overlay.remove();
    this.overlay = null;
    this.content = null;
    document.body.style.overflow = '';
  }

  private open(svg: SVGSVGElement): void {
    const { width, height } = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.style.maxWidth = 'none';
    clone.setAttribute('width', `${width}`);
    clone.setAttribute('height', `${height}`);

    const overlay = document.createElement('div');
    overlay.className = 'mermaid-zoom';
    const content = document.createElement('div');
    content.className = 'mermaid-zoom-content';
    content.appendChild(clone);
    const closeButton = document.createElement('button');
    closeButton.className = 'mermaid-zoom-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.textContent = '×';
    const hint = document.createElement('div');
    hint.className = 'mermaid-zoom-hint';
    hint.textContent = 'Scroll to zoom · drag to pan · double-click to reset · Esc to close';
    overlay.append(content, closeButton, hint);

    closeButton.addEventListener('pointerdown', event => event.stopPropagation());
    closeButton.addEventListener('click', () => this.close());
    overlay.addEventListener(
      'wheel',
      event => {
        event.preventDefault();
        const newScale = Math.min(
          Math.max(this.scale * Math.exp(-event.deltaY * 0.002), this.fitScale * 0.25),
          this.fitScale * 20
        );
        const ratio = newScale / this.scale;
        // keep the point under the cursor in place
        this.x = event.clientX - (event.clientX - this.x) * ratio;
        this.y = event.clientY - (event.clientY - this.y) * ratio;
        this.scale = newScale;
        this.applyTransform();
      },
      { passive: false }
    );
    overlay.addEventListener('pointerdown', event => {
      this.dragging = true;
      this.moved = false;
      this.dragStartX = event.clientX - this.x;
      this.dragStartY = event.clientY - this.y;
      overlay.setPointerCapture(event.pointerId);
      overlay.classList.add('dragging');
    });
    overlay.addEventListener('pointermove', event => {
      if (!this.dragging) {
        return;
      }
      const newX = event.clientX - this.dragStartX;
      const newY = event.clientY - this.dragStartY;
      if (Math.abs(newX - this.x) + Math.abs(newY - this.y) > 2) {
        this.moved = true;
      }
      this.x = newX;
      this.y = newY;
      this.applyTransform();
    });
    overlay.addEventListener('pointerup', event => {
      this.dragging = false;
      overlay.classList.remove('dragging');
      // a plain click on the backdrop (outside the diagram) closes the viewer
      if (!this.moved && event.target === overlay) {
        this.close();
      }
    });
    overlay.addEventListener('dblclick', () => {
      this.scale = this.fitScale;
      this.x = this.fitX;
      this.y = this.fitY;
      this.applyTransform();
    });

    this.fitScale = Math.min((window.innerWidth * 0.9) / width, (window.innerHeight * 0.9) / height);
    this.fitX = (window.innerWidth - width * this.fitScale) / 2;
    this.fitY = (window.innerHeight - height * this.fitScale) / 2;
    this.scale = this.fitScale;
    this.x = this.fitX;
    this.y = this.fitY;
    this.overlay = overlay;
    this.content = content;
    this.applyTransform();
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);
  }
}
