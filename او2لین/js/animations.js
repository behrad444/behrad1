// Custom Cursor Effect
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

// Hover Effects for Cursor
const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card, .nav-link');

hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorFollower.classList.add('hover');
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorFollower.classList.remove('hover');
    });
});

// Text Animation
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');

function animateText(element, text, speed) {
    let i = 0;
    element.textContent = '';
    
    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    typeWriter();
}

// Run text animation only once when in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const text = entry.target.textContent;
            entry.target.textContent = '';
            animateText(entry.target, text, 100);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(heroTitle);
observer.observe(heroSubtitle);

// Scroll Reveal Animation
function scrollReveal() {
    const elements = document.querySelectorAll('[data-scroll]');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('revealed');
        }
    });
}

window.addEventListener('scroll', scrollReveal);
scrollReveal();

// Gradient Animation
const gradientElements = document.querySelectorAll('.gradient-bg');

gradientElements.forEach(el => {
    el.style.backgroundSize = '200% 200%';
    el.style.animation = 'gradientBG 8s ease infinite';
});

// Skill Bar Animation
const skillBars = document.querySelectorAll('.skill-bar span');

function animateSkillBars() {
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

// Animate when skills section is in view
const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkillBars();
            skillsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillsObserver.observe(skillsSection);
}