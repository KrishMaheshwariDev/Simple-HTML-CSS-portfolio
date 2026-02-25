const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light";
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    themeToggle.textContent = isDark ? "Light" : "Dark";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

const aboutSection = document.getElementById("about");
const skillItems = document.querySelectorAll(".skill-item");
let skillsAnimated = false;

function animateSkillValue(element, target, duration) {
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const value = Math.round(eased * target);
        element.textContent = value;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function runSkillsAnimation() {
    if (skillsAnimated) return;
    skillsAnimated = true;

    skillItems.forEach((item, index) => {
        const level = Number(item.dataset.level) || 0;
        const fill = item.querySelector(".skill-fill");
        const value = item.querySelector(".skill-value");
        const percentage = Math.max(0, Math.min(level, 10)) * 10;

        setTimeout(() => {
            fill.style.width = `${percentage}%`;
            animateSkillValue(value, Math.max(0, Math.min(level, 10)), 1800);
        }, index * 120);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            runSkillsAnimation();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.45 });

if (aboutSection) {
    observer.observe(aboutSection);
}

const projectSection = document.getElementById("projects");
const projectTree = document.getElementById("projectTree");
const lineSolid = document.getElementById("treeLineSolid");
let targetLineProgress = 0;
let currentLineProgress = 0;
let rafId = null;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function computeLineProgress() {
    if (!projectSection) return 0;
    const rect = projectSection.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const middle = viewport * 0.5;
    const start = middle;
    const end = middle - rect.height;
    const raw = (start - rect.top) / (start - end);
    return clamp(raw, 0, 1);
}

function animateLine() {
    currentLineProgress += (targetLineProgress - currentLineProgress) * 0.08;
    if (Math.abs(targetLineProgress - currentLineProgress) < 0.001) {
        currentLineProgress = targetLineProgress;
    }

    if (projectTree && lineSolid) {
        const percent = (currentLineProgress * 100).toFixed(2);
        projectTree.style.setProperty("--line-progress", `${percent}%`);
    }

    if (Math.abs(targetLineProgress - currentLineProgress) > 0.001) {
        rafId = requestAnimationFrame(animateLine);
    } else {
        rafId = null;
    }
}

function updateProjectLineProgress() {
    targetLineProgress = computeLineProgress();
    if (!rafId) {
        rafId = requestAnimationFrame(animateLine);
    }
}

if (projectSection && projectTree && lineSolid) {
    updateProjectLineProgress();
    window.addEventListener("scroll", updateProjectLineProgress, { passive: true });
    window.addEventListener("resize", updateProjectLineProgress);
}

const heroSection = document.getElementById("home");
if (heroSection) {
    const heroRect = () => heroSection.getBoundingClientRect();
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.4;
    let currentX = targetX;
    let currentY = targetY;
    let heroRaf = null;

    function animateHeroPointer() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        heroSection.style.setProperty("--mx-px", `${currentX}px`);
        heroSection.style.setProperty("--my-px", `${currentY}px`);
        heroRaf = requestAnimationFrame(animateHeroPointer);
    }

    heroSection.addEventListener("mousemove", (event) => {
        const rect = heroRect();
        targetX = event.clientX;
        targetY = clamp(event.clientY, rect.top, rect.bottom);
    });

    heroSection.addEventListener("mouseenter", () => {
        if (!heroRaf) {
            heroRaf = requestAnimationFrame(animateHeroPointer);
        }
    });

    heroSection.addEventListener("mouseleave", () => {
        const rect = heroRect();
        targetX = rect.left + rect.width * 0.55;
        targetY = rect.top + rect.height * 0.45;
    });

    heroRaf = requestAnimationFrame(animateHeroPointer);
}
