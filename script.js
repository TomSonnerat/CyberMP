const presentationSection = document.querySelector('.presentation-section');
const textFieldOuter = document.querySelector('.text-field-outer');
const original = document.querySelector('.original');
const shadow1 = document.querySelector('.shadow-1');
const shadow2 = document.querySelector('.shadow-2');

document.addEventListener('mousemove', (event) => {
    const rect = presentationSection.getBoundingClientRect();

    if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    ) {
        const textFieldRect = textFieldOuter.getBoundingClientRect();

        const centerX = textFieldRect.left + textFieldRect.width / 2;
        const centerY = textFieldRect.top + textFieldRect.height / 2;

        const offsetX = (event.clientX - centerX) / textFieldRect.width;
        const offsetY = (event.clientY - centerY) / textFieldRect.height;

        const rotateX = offsetY * 20;
        const rotateY = offsetX * -10;

        const shadowOffsetX = -offsetX * 30;
        const shadowOffsetY = -offsetY * 30;

        textFieldOuter.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        textFieldOuter.style.transition = `transform 0.05s ease-out`;

        shadow1.style.transform = `translate(
            ${15 + shadowOffsetX}px, 
            ${15 + shadowOffsetY}px
        )`;
        shadow2.style.transform = `translate(
            ${30 + shadowOffsetX * 1.5}px, 
            ${30 + shadowOffsetY * 1.5}px
        )`;

        shadow1.style.transition = shadow2.style.transition = 'transform 0.05s ease-out';
    }
});

document.addEventListener('mouseleave', () => {
    textFieldOuter.style.transform = `rotateX(0deg) rotateY(0deg)`;
    shadow1.style.transform = `translate(15px, 15px)`;
    shadow2.style.transform = `translate(30px, 30px)`;
});

// Cards JS

class MicroPixel {
    constructor(canvas, context, posX, posY, color, speed, delay) {
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
      this.context = context;
      this.x = posX;
      this.y = posY;
      this.color = color;
      this.speed = this.randomValue(0.1, 0.9) * speed;
      this.size = 0;
      this.sizeStep = Math.random() * 0.4;
      this.minSize = 0.5;
      this.maxSizeBase = 2;
      this.maxSize = this.randomValue(this.minSize, this.maxSizeBase);
      this.delay = delay;
      this.counter = 0;
      this.counterStep = Math.random() * 4 + (this.canvasWidth + this.canvasHeight) * 0.01;
      this.isIdle = false;
      this.isReversing = false;
      this.isShimmering = false;
    }
    randomValue(min, max) {
      return Math.random() * (max - min) + min;
    }
    draw() {
      const offset = this.maxSizeBase * 0.5 - this.size * 0.5;
      this.context.fillStyle = this.color;
      this.context.fillRect(this.x + offset, this.y + offset, this.size, this.size);
    }
    appear() {
      this.isIdle = false;
      if (this.counter <= this.delay) {
        this.counter += this.counterStep;
        return;
      }
      if (this.size >= this.maxSize) {
        this.isShimmering = true;
      }
      if (this.isShimmering) {
        this.shimmer();
      } else {
        this.size += this.sizeStep;
      }
      this.draw();
    }
    disappear() {
      this.isShimmering = false;
      this.counter = 0;
      if (this.size <= 0) {
        this.isIdle = true;
        return;
      } else {
        this.size -= 0.1;
      }
      this.draw();
    }
    shimmer() {
      if (this.size >= this.maxSize) {
        this.isReversing = true;
      } else if (this.size <= this.minSize) {
        this.isReversing = false;
      }
      this.size += this.isReversing ? -this.speed : this.speed;
    }
  }
  class MicroCanvas extends HTMLElement {
    static register(tagName = "micro-canvas") {
      if ("customElements" in window) {
        customElements.define(tagName, this);
      }
    }
    static css = `
      :host {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
      }
    `;
    get colors() {
      return this.dataset.colors ? this.dataset.colors.split(",") : ["#ff007f", "#9d00ff", "#00ffff"];
    }
    get gap() {
      let gapValue = this.dataset.gap || 5;
      return gapValue <= 4 ? 4 : gapValue >= 50 ? 50 : parseInt(gapValue);
    }
    get speed() {
      let speedValue = this.dataset.speed || 35;
      const throttle = 0.001;
      if (speedValue <= 0 || this.prefersReducedMotion) {
        return 0;
      } else if (speedValue >= 100) {
        return 100 * throttle;
      } else {
        return parseInt(speedValue) * throttle;
      }
    }
    get noFocus() {
      return this.hasAttribute("data-no-focus");
    }
    connectedCallback() {
      const canvas = document.createElement("canvas");
      const sheet = new CSSStyleSheet();
      this.parentElementReference = this.parentNode;
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [sheet];
      sheet.replaceSync(MicroCanvas.css);
      this.shadowRoot.append(canvas);
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.frameInterval = 1000 / 60;
      this.previousTime = performance.now();
      this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.initialize();
      this.resizeObserver = new ResizeObserver(() => this.initialize());
      this.resizeObserver.observe(this);
      this.parentElementReference.addEventListener("mouseenter", this);
      this.parentElementReference.addEventListener("mouseleave", this);
      if (!this.noFocus) {
        this.parentElementReference.addEventListener("focusin", this);
        this.parentElementReference.addEventListener("focusout", this);
      }
    }
    disconnectedCallback() {
      this.resizeObserver.disconnect();
      this.parentElementReference.removeEventListener("mouseenter", this);
      this.parentElementReference.removeEventListener("mouseleave", this);
      if (!this.noFocus) {
        this.parentElementReference.removeEventListener("focusin", this);
        this.parentElementReference.removeEventListener("focusout", this);
      }
      delete this.parentElementReference;
    }
    handleEvent(event) {
      this["on" + event.type](event);
    }
    onmouseenter() {
      this.startAnimation("appear");
    }
    onmouseleave() {
      this.startAnimation("disappear");
    }
    onfocusin(event) {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      this.startAnimation("appear");
    }
    onfocusout(event) {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      this.startAnimation("disappear");
    }
    startAnimation(methodName) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = this.animationLoop(methodName);
    }
    initialize() {
      const rect = this.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      this.pixels = [];
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = width + "px";
      this.canvas.style.height = height + "px";
      this.generatePixels();
    }
    distanceToCenter(x, y) {
      const dx = x - this.canvas.width / 2;
      const dy = y - this.canvas.height / 2;
      return Math.sqrt(dx * dx + dy * dy);
    }
    generatePixels() {
      for (let x = 0; x < this.canvas.width; x += this.gap) {
        for (let y = 0; y < this.canvas.height; y += this.gap) {
          let color = this.colors[Math.floor(Math.random() * this.colors.length)];
          let delay = this.prefersReducedMotion ? 0 : this.distanceToCenter(x, y);
          this.pixels.push(new MicroPixel(this.canvas, this.context, x, y, color, this.speed, delay));
        }
      }
    }
    animationLoop(method) {
      this.animationFrame = requestAnimationFrame(() => this.animationLoop(method));
      let currentTime = performance.now();
      let deltaTime = currentTime - this.previousTime;
      if (deltaTime < this.frameInterval) return;
      this.previousTime = currentTime - (deltaTime % this.frameInterval);
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let pixel of this.pixels) {
        pixel[method]();
      }
      if (this.pixels.every(pixel => pixel.isIdle)) {
        cancelAnimationFrame(this.animationFrame);
      }
    }
  }
  MicroCanvas.register();