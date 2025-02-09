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