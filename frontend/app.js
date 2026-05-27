/* NEO-NEXUS DYNAMIC INTERACTIVE ENGINE */

// Fallback animation helper if GSAP is unavailable
function safeAnimate(selector, props, duration, callback) {
    if (typeof gsap !== "undefined") {
        gsap.to(selector, { ...props, duration: duration, onComplete: callback });
    } else {
        const elems = typeof selector === "string" ? document.querySelectorAll(selector) : [selector];
        elems.forEach(el => {
            if (props.opacity !== undefined) el.style.opacity = props.opacity;
            if (props.scale !== undefined) {
                el.style.transform = (el.style.transform || '') + ` scale(${props.scale})`;
            }
            if (props.x !== undefined || props.y !== undefined) {
                const tx = props.x !== undefined ? `${props.x}px` : '0px';
                const ty = props.y !== undefined ? `${props.y}px` : '0px';
                el.style.transform = (el.style.transform || '') + ` translate(${tx}, ${ty})`;
            }
        });
        if (callback) callback();
    }
}

function safeAnimateFromTo(selector, fromProps, toProps, duration, callback) {
    if (typeof gsap !== "undefined") {
        gsap.fromTo(selector, fromProps, { ...toProps, duration: duration, onComplete: callback });
    } else {
        const elems = typeof selector === "string" ? document.querySelectorAll(selector) : [selector];
        elems.forEach(el => {
            if (fromProps.opacity !== undefined) el.style.opacity = fromProps.opacity;
            if (toProps.opacity !== undefined) el.style.opacity = toProps.opacity;
            if (toProps.scale !== undefined) el.style.transform = `scale(${toProps.scale})`;
            if (toProps.x !== undefined || toProps.y !== undefined) {
                const tx = toProps.x !== undefined ? `${toProps.x}px` : '0px';
                const ty = toProps.y !== undefined ? `${toProps.y}px` : '0px';
                el.style.transform = `translate(${tx}, ${ty})`;
            }
        });
        if (callback) callback();
    }
}

// Safe initial boot trigger
const initEngine = () => {
    initPreloader();
    initThemeToggle();
    initAudioSynth();
    initCustomCursor();
    init3DParticleGrid();
    init3DTilt();
    initOperativeShowcase();
    initGameModes();
    initGalleryLightbox();
    initShoppingCart();
    initCheckoutFlow();
    initContactForm();
    initGSAPAnimations();
    initMobileNav();
    initReviewsSlider();
    initPlayTrailerModals();
    initNavActiveIndicator();
    initNavbarScrollHide();
    initPageTransitions();
    initMagneticHover();
};


/* ==========================================================================
   1. TERMINAL PRELOADER BOOT SEQUENCE
   ========================================================================== */
function initPreloader() {
    const preloader = document.getElementById("preloader");
    const progressBar = document.getElementById("progress-bar");
    const progressPercent = document.getElementById("progress-percent");
    const termLines = document.querySelectorAll(".term-line");
    
    if (!preloader) return;
    document.body.classList.add("no-scroll");
    
    // Animate terminal text reveal
    termLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = "1";
            line.style.transform = "translateY(0)";
        }, index * 300);
    });

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Finish preloader
            setTimeout(() => {
                preloader.style.opacity = "0";
                preloader.style.visibility = "hidden";
                document.body.classList.remove("no-scroll");
            }, 600);
        }
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${progress}%`;
    }, 50);
}

/* ==========================================================================
   2. DARK / LIGHT HIGH-TECH THEME SWITCHER
   ========================================================================== */
function initThemeToggle() {
    const themeBtn = document.getElementById("theme-toggle");
    if (!themeBtn) return;
    const icon = themeBtn.querySelector("i");
    
    // Check local storage theme safely
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("neo-nexus-theme");
    } catch (e) {
        console.warn("Storage restricted. Fallback to defaults.");
    }
    
    if (savedTheme === "light") {
        document.body.classList.add("cyber-light");
        if (icon) icon.className = "fa-solid fa-sun";
    }

    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("cyber-light");
        const isLight = document.body.classList.contains("cyber-light");
        if (icon) icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
        
        try {
            localStorage.setItem("neo-nexus-theme", isLight ? "light" : "dark");
        } catch (e) {}
        
        playSynthSound("click");
    });
}

/* ==========================================================================
   3. WEB AUDIO API SYNTHESIZER (MUSIC & SFX)
   ========================================================================== */
let audioCtx = null;
let ambientSynth = null;
let isMuted = true;

function initAudioSynth() {
    const audioToggle = document.getElementById("audio-toggle");
    if (!audioToggle) return;
    const audioController = document.querySelector(".audio-controller");
    const audioStatus = audioToggle.querySelector(".audio-status");
    const audioIcon = audioToggle.querySelector("i");

    function startAudioContext() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
        } catch (e) {
            console.warn("Web Audio not supported in this client.");
        }
    }

    audioToggle.addEventListener("click", () => {
        startAudioContext();
        isMuted = !isMuted;
        
        if (!isMuted) {
            if (audioController) audioController.classList.add("playing");
            if (audioStatus) audioStatus.textContent = "ACTIVE";
            if (audioIcon) audioIcon.className = "fa-solid fa-volume-high";
            playAmbientDrone();
            playSynthSound("success");
        } else {
            if (audioController) audioController.classList.remove("playing");
            if (audioStatus) audioStatus.textContent = "MUTED";
            if (audioIcon) audioIcon.className = "fa-solid fa-volume-xmark";
            stopAmbientDrone();
        }
    });

    // Sound effect trigger on buttons & links
    const hoverElements = document.querySelectorAll(".hover-sound");
    hoverElements.forEach(elem => {
        elem.addEventListener("mouseenter", () => {
            if (!isMuted) playSynthSound("hover");
        });
        elem.addEventListener("click", () => {
            if (!isMuted) playSynthSound("click");
        });
    });
}

// Generate UI Sound Effects via Synth
function playSynthSound(type) {
    if (!audioCtx || isMuted) return;
    
    // Ensure active state
    if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
    
    try {
        const now = audioCtx.currentTime;
        
        if (type === "hover") {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);
            
            gainNode.gain.setValueAtTime(0.04, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.07);
        } 
        else if (type === "click") {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1100, now);
            osc.frequency.setValueAtTime(1800, now + 0.02);
            
            gainNode.gain.setValueAtTime(0.06, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
        } 
        else if (type === "success") {
            const notes = [440, 554.37, 659.25, 880];
            notes.forEach((freq, index) => {
                const timeOffset = index * 0.05;
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + timeOffset);
                
                gainNode.gain.setValueAtTime(0.04, now + timeOffset);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.15);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.start(now + timeOffset);
                osc.stop(now + timeOffset + 0.16);
            });
        }
    } catch (e) {}
}

// Generate ambient synth loops
function playAmbientDrone() {
    if (!audioCtx) return;
    
    try {
        const now = audioCtx.currentTime;
        
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const gainNode = audioCtx.createGain();
        
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(55, now);
        
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(110, now);
        
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(150, now);
        
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.2, now);
        lfoGain.gain.setValueAtTime(60, now);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        gainNode.gain.setValueAtTime(0.12, now);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        lfo.start();
        osc1.start();
        osc2.start();
        
        ambientSynth = {
            stop: () => {
                try {
                    osc1.stop();
                    osc2.stop();
                    lfo.stop();
                } catch(e) {}
            }
        };
    } catch(e) {}
}

function stopAmbientDrone() {
    if (ambientSynth) {
        ambientSynth.stop();
        ambientSynth = null;
    }
}

/* ==========================================================================
   4. CUSTOM GLOWING RETRO CURSOR
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const dot = document.getElementById("custom-cursor-dot");
    if (!cursor || !dot) return;
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    function updateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    function bindCursorHovers() {
        const hovers = document.querySelectorAll("a, button, .gallery-item, .mode-card, .store-card, .pricing-card, .char-tab-btn, .platform-card");
        hovers.forEach(item => {
            item.addEventListener("mouseenter", () => cursor.classList.add("hovering"));
            item.addEventListener("mouseleave", () => cursor.classList.remove("hovering"));
        });
    }
    bindCursorHovers();
    
    window.bindCursorHovers = bindCursorHovers;
}

/* ==========================================================================
   5. INTERACTIVE 3D CONSTELLATION PARTICLE GRID
   ========================================================================== */
function init3DParticleGrid() {
    const canvas = document.getElementById("canvas-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const focalLength = 350;
    const numParticles = 80;
    const particles = [];
    
    let rotateY = 0;
    let rotateX = 0;
    let targetRotateY = 0;
    let targetRotateX = 0;
    
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
            z: (Math.random() - 0.5) * 800,
            color: Math.random() > 0.4 ? "cyan" : "purple"
        });
    }

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener("mousemove", (e) => {
        const xc = width / 2;
        const yc = height / 2;
        targetRotateY = ((e.clientX - xc) / xc) * 0.4;
        targetRotateX = -((e.clientY - yc) / yc) * 0.4;
    });

    function project3D(x, y, z) {
        const scale = focalLength / (focalLength + z);
        return {
            x: x * scale + width / 2,
            y: y * scale + height / 2,
            scale: scale
        };
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        const isLight = document.body.classList.contains("cyber-light");

        rotateY += (targetRotateY - rotateY) * 0.05;
        rotateX += (targetRotateX - rotateX) * 0.05;

        const cosY = Math.cos(rotateY);
        const sinY = Math.sin(rotateY);
        const cosX = Math.cos(rotateX);
        const sinX = Math.sin(rotateX);

        const projected = [];

        particles.forEach(p => {
            let rx1 = p.x;
            let ry1 = p.y * cosX - p.z * sinX;
            let rz1 = p.y * sinX + p.z * cosX;

            let rx2 = rx1 * cosY + rz1 * sinY;
            let ry2 = ry1;
            let rz2 = -rx1 * sinY + rz1 * cosY;
            
            rz2 -= 100;
            
            const proj = project3D(rx2, ry2, rz2);
            if (proj.scale <= 0) return;
            projected.push({
                x: proj.x,
                y: proj.y,
                scale: proj.scale,
                color: p.color
            });
        });

        for (let i = 0; i < projected.length; i++) {
            for (let j = i + 1; j < projected.length; j++) {
                const dist = Math.hypot(projected[i].x - projected[j].x, projected[i].y - projected[j].y);
                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.12 * projected[i].scale;
                    ctx.strokeStyle = isLight 
                        ? `rgba(157, 0, 255, ${alpha})`
                        : (projected[i].color === "cyan" ? `rgba(0, 240, 255, ${alpha})` : `rgba(157, 0, 255, ${alpha})`);
                    ctx.lineWidth = 0.8 * projected[i].scale;
                    ctx.beginPath();
                    ctx.moveTo(projected[i].x, projected[i].y);
                    ctx.lineTo(projected[j].x, projected[j].y);
                    ctx.stroke();
                }
            }
        }

        projected.forEach(p => {
            if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) return;
            
            ctx.fillStyle = isLight
                ? `rgba(157, 0, 255, ${0.75 * p.scale})`
                : (p.color === "cyan" ? `rgba(0, 240, 255, ${0.75 * p.scale})` : `rgba(255, 0, 124, ${0.75 * p.scale})`);
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

/* ==========================================================================
   6. 3D CARD HOVER TILT EFFECTS
   ========================================================================== */
function init3DTilt() {
    const cards = document.querySelectorAll(".hover-3d");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            const angleX = -(y - yc) / 10;
            const angleY = (x - xc) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        });
    });
}

/* ==========================================================================
   7. OPERATIVES DISPLAY SHOWCASE & SPEC ANIMATION
   ========================================================================== */
const characterData = {
    shadow: {
        codename: "SYNDICATE: OBLIVION",
        name: "SHADOW",
        desc: "A stealth infiltrator master of energy blade fencing and active camouflage. Specializes in flanking hostile security squads and executing surgical strikes without warning.",
        stats: { offense: 90, defense: 50, tech: 75, speed: 95 }
    },
    nova: {
        codename: "GRID DIVISION: BREACHER",
        name: "NOVA",
        desc: "A digital hacker wizard who weaves tactical firewall nodes and neural-jam energy beams. She controls the battlefield topology by disabling enemy augments and locking exits.",
        stats: { offense: 75, defense: 60, tech: 98, speed: 70 }
    },
    jax: {
        codename: "DEFENSE MATRIX: IRONCLAD",
        name: "JAX",
        desc: "A cybernetically reconstructed brute equipped with dynamic shields and heavy railguns. Built to draw enemy aggro, absorb firewall blasts, and break through defensive lines.",
        stats: { offense: 85, defense: 95, tech: 40, speed: 45 }
    },
    valkyrie: {
        codename: "APEX SQUADRON: HAWKEYE",
        name: "VALKYRIE",
        desc: "A high-altitude tactical sniper with targeting-recon optics and long-range energy vectors. Delivers surgical covering fire and exposes hidden targets in real-time.",
        stats: { offense: 95, defense: 40, tech: 65, speed: 85 }
    }
};

function initOperativeShowcase() {
    const tabButtons = document.querySelectorAll(".char-tab-btn");
    const charImage = document.getElementById("char-image");
    const charCodename = document.getElementById("char-codename");
    const charName = document.getElementById("char-name");
    const charDesc = document.getElementById("char-desc");
    
    const offenseVal = document.getElementById("stat-val-offense");
    const defenseVal = document.getElementById("stat-val-defense");
    const techVal = document.getElementById("stat-val-tech");
    const speedVal = document.getElementById("stat-val-speed");

    const offenseFill = document.getElementById("stat-fill-offense");
    const defenseFill = document.getElementById("stat-fill-defense");
    const techFill = document.getElementById("stat-fill-tech");
    const speedFill = document.getElementById("stat-fill-speed");

    if (!charImage) return;

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const charKey = btn.getAttribute("data-character");
            const data = characterData[charKey];
            
            if (!data) return;

            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            safeAnimate(".char-display", { opacity: 0, x: -20 }, 0.25, () => {
                charImage.src = `assets/characters/${charKey}.png`;
                charImage.alt = `${data.name} Operative`;
                if (charCodename) charCodename.textContent = data.codename;
                if (charName) charName.textContent = data.name;
                if (charDesc) charDesc.textContent = data.desc;
                
                if (offenseVal) offenseVal.textContent = `${data.stats.offense}%`;
                if (defenseVal) defenseVal.textContent = `${data.stats.defense}%`;
                if (techVal) techVal.textContent = `${data.stats.tech}%`;
                if (speedVal) speedVal.textContent = `${data.stats.speed}%`;
                
                if (offenseFill) offenseFill.style.width = `${data.stats.offense}%`;
                if (defenseFill) defenseFill.style.width = `${data.stats.defense}%`;
                if (techFill) techFill.style.width = `${data.stats.tech}%`;
                if (speedFill) speedFill.style.width = `${data.stats.speed}%`;

                safeAnimate(".char-display", { opacity: 1, x: 0 }, 0.35);
            });
        });
    });
}

/* ==========================================================================
   8. GAME MODE SPECIFICATION MODALS
   ========================================================================== */
const gameModesData = {
    multiplayer: {
        title: "ARENA MULTIPLAYER",
        tag: "TACTICAL CO-OP SIM",
        desc: "Assemble your syndicate fireteam and clash in strategic 4v4 matches across neon cities. Focus on breaching mainframe databases, guarding payload cores, and securing vital routing grid arrays. Perfecting operative combos is the path to grid dominance.",
        specs: { lat: 98, coop: 85, recharge: 70 },
        bg: "bg-mp"
    },
    survival: {
        title: "GRID SURVIVAL",
        tag: "COOPERATIVE DEFENSE MATRIX",
        desc: "Band together to fight massive waves of rogue system sweepers, quarantine drones, and towering mainframe defense bosses. Scavenge drops to build barrier nodes, turrets, and automated healing modules before the swarm overrides your system.",
        specs: { lat: 95, coop: 98, recharge: 50 },
        bg: "bg-survival"
    },
    royale: {
        title: "NEXUS ROYALE",
        tag: "100-OPERATIVE BATTLE ROYALE",
        desc: "Deploy into a sprawling, vertical mega-city grid where 100 players scavenge weapon nodes, hack network towers for radar alerts, and engage in high-speed grapple-hook combat. Only one syndicate operative or squad will survive the firewall sweep.",
        specs: { lat: 96, coop: 75, recharge: 80 },
        bg: "bg-royale"
    },
    zombie: {
        title: "INFECTION VECTOR",
        tag: "BIO-DIGITAL SURVIVAL PROTOCOL",
        desc: "A corruptive nanite vector has turned deactivated shell droids and players into frenzied cyber-zombies. Cooperate to secure bio-quarantine bunkers, gather code fragments for the antiviral firewall, and request extraction before network contamination is total.",
        specs: { lat: 99, coop: 90, recharge: 60 },
        bg: "bg-zombie"
    }
};

function initGameModes() {
    const cards = document.querySelectorAll(".mode-card");
    const overlay = document.getElementById("mode-modal-overlay");
    const modalContent = document.getElementById("mode-modal-content");
    const closeBtn = document.getElementById("mode-modal-close");
    
    if (!overlay || !modalContent) return;

    const mVisualBg = document.getElementById("mode-modal-visual-bg");
    const mTag = document.getElementById("mode-modal-tag");
    const mTitle = document.getElementById("mode-modal-title");
    const mDesc = document.getElementById("mode-modal-desc");
    
    const val1 = document.getElementById("spec-val-1");
    const val2 = document.getElementById("spec-val-2");
    const val3 = document.getElementById("spec-val-3");
    
    const fill1 = document.getElementById("spec-fill-1");
    const fill2 = document.getElementById("spec-fill-2");
    const fill3 = document.getElementById("spec-fill-3");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const modeKey = card.getAttribute("data-mode");
            const data = gameModesData[modeKey];
            
            if (!data) return;

            if (mTag) mTag.textContent = data.tag;
            if (mTitle) mTitle.textContent = data.title;
            if (mDesc) mDesc.textContent = data.desc;
            
            if (val1) val1.textContent = `${data.specs.lat}%`;
            if (val2) val2.textContent = `${data.specs.coop}%`;
            if (val3) val3.textContent = `${data.specs.recharge}%`;
            
            if (fill1) fill1.style.width = `${data.specs.lat}%`;
            if (fill2) fill2.style.width = `${data.specs.coop}%`;
            if (fill3) fill3.style.width = `${data.specs.recharge}%`;

            if (mVisualBg) mVisualBg.className = `mode-modal-visual ${data.bg}`;

            overlay.classList.add("active");
            document.body.classList.add("no-scroll");
            
            safeAnimateFromTo(modalContent, 
                { opacity: 0, scale: 0.85, y: 30 },
                { opacity: 1, scale: 1, y: 0 },
                0.4
            );
        });
    });

    function closeModal() {
        safeAnimate(modalContent, { opacity: 0, scale: 0.85, y: 30 }, 0.3, () => {
            overlay.classList.remove("active");
            document.body.classList.remove("no-scroll");
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });
}

/* ==========================================================================
   9. GALLERY SCREENSHOTS & FULLSCREEN LIGHTBOX
   ========================================================================== */
const galleryImages = [
    { src: "assets/gallery/screenshot1.png", caption: "NEON METROPOLIS DOWNTOWN GRID" },
    { src: "assets/gallery/screenshot2.png", caption: "TACTICAL EXOSUIT ENGAGEMENT IN URBAN WARZONE" },
    { src: "assets/gallery/screenshot3.png", caption: "RETRO-FUTURE SOCIAL HACKING LOUNGE" },
    { src: "assets/gallery/screenshot4.png", caption: "SECTOR 9 CYBERPUNKBROW CAFE UNDERBELLYS" }
];

function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    
    if (!lightbox || !lightboxImg) return;
    let currentIndex = 0;

    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            currentIndex = parseInt(item.getAttribute("data-index"));
            openLightbox(currentIndex);
        });
    });

    function openLightbox(index) {
        const item = galleryImages[index];
        lightboxImg.src = item.src;
        if (lightboxCaption) lightboxCaption.textContent = item.caption;
        
        lightbox.classList.add("active");
        document.body.classList.add("no-scroll");
        
        safeAnimateFromTo(lightboxImg, 
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1 },
            0.35
        );
    }

    function changeImage(direction) {
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = galleryImages.length - 1;
        if (currentIndex >= galleryImages.length) currentIndex = 0;

        safeAnimate(lightboxImg, { opacity: 0, x: direction * -50 }, 0.18, () => {
            lightboxImg.src = galleryImages[currentIndex].src;
            if (lightboxCaption) lightboxCaption.textContent = galleryImages[currentIndex].caption;
            
            safeAnimateFromTo(lightboxImg, 
                { x: direction * 50, opacity: 0 },
                { x: 0, opacity: 1 },
                0.22
            );
        });
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", () => changeImage(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => changeImage(1));
    
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    window.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") changeImage(-1);
        if (e.key === "ArrowRight") changeImage(1);
    });
}

/* ==========================================================================
   10. E-COMMERCE ARSENAL SHOPPING CART DRAWER
   ========================================================================== */
let cart = [];

function initShoppingCart() {
    const cartToggle = document.getElementById("cart-toggle");
    const cartClose = document.getElementById("cart-close");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-drawer-overlay");
    const checkoutBtn = document.getElementById("cart-checkout-btn");
    
    if (!cartToggle || !cartDrawer) return;

    cartToggle.addEventListener("click", () => {
        cartDrawer.classList.add("active");
        if (cartOverlay) cartOverlay.classList.add("active");
        playSynthSound("click");
    });

    function closeCart() {
        cartDrawer.classList.remove("active");
        if (cartOverlay) cartOverlay.classList.remove("active");
    }

    if (cartClose) cartClose.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    // Bind Add to Cart Buttons
    const addButtons = document.querySelectorAll(".add-to-cart-btn");
    addButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".store-card");
            if (!card) return;
            const item = {
                id: card.getAttribute("data-id"),
                name: card.getAttribute("data-name"),
                price: parseFloat(card.getAttribute("data-price")),
                image: card.querySelector("img").src,
                category: card.getAttribute("data-category")
            };
            addToCart(item);
        });
    });

    // Bind Pricing Buy Buttons (Game Editions)
    const buyButtons = document.querySelectorAll(".buy-now-btn");
    buyButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".pricing-card");
            if (!card) return;
            const item = {
                id: card.getAttribute("data-id"),
                name: card.getAttribute("data-name"),
                price: parseFloat(card.getAttribute("data-price")),
                image: "assets/characters/shadow.png",
                category: card.getAttribute("data-category")
            };
            addToCart(item);
            
            setTimeout(() => {
                cartDrawer.classList.add("active");
                if (cartOverlay) cartOverlay.classList.add("active");
            }, 300);
        });
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("YOUR CART IS VACANT. ARSENAL UPGRADES REQ.");
                return;
            }
            closeCart();
            openCheckoutModal();
        });
    }
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    playSynthSound("success");
    renderCart();
}

function updateQty(id, change) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        cart = cart.filter(p => p.id !== id);
    }
    
    renderCart();
    playSynthSound("click");
}

function renderCart() {
    const itemsContainer = document.getElementById("cart-items-container");
    const badge = document.getElementById("cart-badge");
    const subtotalText = document.getElementById("cart-subtotal");
    
    if (!itemsContainer) return;
    itemsContainer.innerHTML = "";
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="cart-empty-msg">
                <i class="fa-solid fa-box-open"></i>
                <p>NO HARDWARE OR DIGITALS ENROLLED.</p>
            </div>
        `;
        if (badge) badge.textContent = "0";
        if (subtotalText) subtotalText.textContent = "$0.00";
        return;
    }

    let totalItems = 0;
    let subtotal = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        subtotal += item.price * item.qty;
        
        const itemHtml = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
                    <div class="cart-qty-row">
                        <button class="qty-btn" onclick="updateQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="updateQty('${item.id}', -${item.qty})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        itemsContainer.insertAdjacentHTML("beforeend", itemHtml);
    });

    if (badge) badge.textContent = totalItems;
    if (subtotalText) subtotalText.textContent = `$${subtotal.toFixed(2)}`;
}

window.updateQty = updateQty;

/* ==========================================================================
   11. ENCRYPTED BILLING & 3D ROTATING CREDIT CARD PREVIEW
   ========================================================================== */
function openCheckoutModal() {
    const overlay = document.getElementById("checkout-modal-overlay");
    if (!overlay) return;
    const modal = overlay.querySelector(".checkout-modal");
    
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.qty);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const sub = document.getElementById("summary-subtotal");
    const tx = document.getElementById("summary-tax");
    const tot = document.getElementById("summary-total");
    
    if (sub) sub.textContent = `$${subtotal.toFixed(2)}`;
    if (tx) tx.textContent = `$${tax.toFixed(2)}`;
    if (tot) tot.textContent = `$${total.toFixed(2)}`;

    overlay.classList.add("active");
    document.body.classList.add("no-scroll");

    safeAnimateFromTo(modal,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0 },
        0.4
    );
}

function initCheckoutFlow() {
    const overlay = document.getElementById("checkout-modal-overlay");
    if (!overlay) return;
    const closeBtn = document.getElementById("checkout-close");
    const modal = overlay.querySelector(".checkout-modal");
    const paymentForm = document.getElementById("credit-card-form");

    function closeCheckout() {
        safeAnimate(modal, { scale: 0.85, opacity: 0, y: 30 }, 0.3, () => {
            overlay.classList.remove("active");
            document.body.classList.remove("no-scroll");
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeCheckout);

    const tabs = document.querySelectorAll(".payment-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const method = tab.getAttribute("data-method");
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            document.querySelectorAll(".payment-content").forEach(c => c.classList.remove("active"));
            const targetContent = document.getElementById(`method-${method}`);
            if (targetContent) targetContent.classList.add("active");
        });
    });

    const cardEl = document.getElementById("interactive-cc-card");
    const ccNum = document.getElementById("cc-number");
    const ccName = document.getElementById("cc-name");
    const ccExp = document.getElementById("cc-expiry");
    const ccCvv = document.getElementById("cc-cvv");

    const pNum = document.getElementById("preview-cc-number");
    const pName = document.getElementById("preview-cc-name");
    const pExp = document.getElementById("preview-cc-expiry");
    const pCvv = document.getElementById("preview-cc-cvv");

    if (ccCvv && cardEl) {
        ccCvv.addEventListener("focus", () => cardEl.classList.add("flipped"));
        ccCvv.addEventListener("blur", () => cardEl.classList.remove("flipped"));
    }

    if (ccNum && pNum) {
        ccNum.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formatted = "";
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += " ";
                formatted += val[i];
            }
            e.target.value = formatted;
            pNum.textContent = formatted || "•••• •••• •••• ••••";
        });
    }

    if (ccName && pName) {
        ccName.addEventListener("input", (e) => {
            pName.textContent = e.target.value.toUpperCase() || "OPERATIVE SIGNATURE";
        });
    }

    if (ccExp && pExp) {
        ccExp.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (val.length >= 2) {
                val = val.substring(0, 2) + "/" + val.substring(2, 4);
            }
            e.target.value = val;
            pExp.textContent = val || "MM/YY";
        });
    }

    if (ccCvv && pCvv) {
        ccCvv.addEventListener("input", (e) => {
            let val = e.target.value.replace(/[^0-9]/gi, '');
            e.target.value = val;
            pCvv.textContent = "•".repeat(val.length) || "•••";
        });
    }

    function submitCheckout(paymentMethod, paymentDetails = {}) {
        let subtotal = 0;
        cart.forEach(item => subtotal += item.price * item.qty);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        let triggerBtn = null;
        let originalHtml = "";
        if (paymentMethod === 'card') {
            triggerBtn = document.getElementById("btn-submit-payment");
        } else if (paymentMethod === 'paypal') {
            triggerBtn = document.getElementById("paypal-submit");
        } else if (paymentMethod === 'crypto') {
            triggerBtn = document.getElementById("crypto-submit");
        }

        if (triggerBtn) {
            triggerBtn.disabled = true;
            originalHtml = triggerBtn.innerHTML;
            triggerBtn.innerHTML = `PROCESSING... <i class="fa-solid fa-sync fa-spin"></i>`;
        }

        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty
                })),
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                paymentMethod,
                paymentDetails
            })
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
            if (status >= 400 || !body.success) {
                throw new Error(body.error || 'Transaction matrix error');
            }
            triggerSuccessPopup(paymentMethod === 'card' ? "TRANSACTION COMPLETED" : (paymentMethod === 'paypal' ? "PAYPAL TRANSACTION INITIATED" : "TRANS-MATRIX DETECTED"), body.message);
            closeCheckout();
            clearCart();
        })
        .catch(err => {
            triggerSuccessPopup("TRANSACTION FAILURE", err.message || "Failed to finalize neural payment link.");
        })
        .finally(() => {
            if (triggerBtn) {
                triggerBtn.disabled = false;
                triggerBtn.innerHTML = originalHtml;
            }
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            submitCheckout('card', {
                number: ccNum.value,
                name: ccName.value,
                expiry: ccExp.value,
                cvv: ccCvv.value
            });
        });
    }

    const payPalSub = document.getElementById("paypal-submit");
    if (payPalSub) {
        payPalSub.addEventListener("click", () => {
            submitCheckout('paypal');
        });
    }

    const cryptoSub = document.getElementById("crypto-submit");
    if (cryptoSub) {
        cryptoSub.addEventListener("click", () => {
            submitCheckout('crypto');
        });
    }

    const copyBtn = document.getElementById("copy-wallet");
    const walletTextEl = document.getElementById("wallet-address");
    const copyFeedback = document.getElementById("copy-feedback");

    if (copyBtn && walletTextEl && copyFeedback) {
        const walletText = walletTextEl.textContent;
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(walletText).then(() => {
                copyFeedback.classList.add("active");
                playSynthSound("success");
                setTimeout(() => copyFeedback.classList.remove("active"), 2000);
            });
        });
    }
}

function clearCart() {
    cart = [];
    renderCart();
}

function triggerSuccessPopup(title, message) {
    const successPopup = document.getElementById("success-popup");
    const sTitle = document.getElementById("success-title");
    const sMsg = document.getElementById("success-msg");
    const sCloseBtn = document.getElementById("success-close-btn");
    
    if (!successPopup) return;
    if (sTitle) sTitle.textContent = title;
    if (sMsg) sMsg.textContent = message;
    
    successPopup.classList.add("active");
    document.body.classList.add("no-scroll");
    playSynthSound("success");

    function closeSuccess() {
        successPopup.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }

    if (sCloseBtn) sCloseBtn.addEventListener("click", closeSuccess);
    successPopup.addEventListener("click", (e) => {
        if (e.target === successPopup) closeSuccess();
    });
}

/* ==========================================================================
   12. GLASSMORPHISM CONTACT FORM VALIDATION
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById("cyber-contact-form");
    if (!form) return;
    
    const username = document.getElementById("contact-username");
    const email = document.getElementById("contact-email");
    const message = document.getElementById("contact-message");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let isValid = true;

        document.querySelectorAll(".form-group").forEach(g => g.classList.remove("invalid"));

        if (username && username.value.trim().length < 3) {
            username.closest(".form-group").classList.add("invalid");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email.value.trim())) {
            email.closest(".form-group").classList.add("invalid");
            isValid = false;
        }

        if (message && message.value.trim().length < 10) {
            message.closest(".form-group").classList.add("invalid");
            isValid = false;
        }

        if (isValid) {
            const submitBtn = document.getElementById("btn-submit");
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-text">TRANSMITTING...</span><i class="fa-solid fa-sync fa-spin"></i>`;
            }

            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.value,
                    email: email.value,
                    message: message.value
                })
            })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status >= 400 || !body.success) {
                    throw new Error(body.error || 'Transmission protocol error');
                }
                triggerSuccessPopup("TRANSMISSION BROADCASTED", body.message || `Transmission securely sent.`);
                form.reset();
            })
            .catch(err => {
                triggerSuccessPopup("TRANSMISSION ERROR", err.message || "Failed to establish network upload link.");
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        } else {
            playSynthSound("click");
        }
    });

    [username, email, message].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                input.closest(".form-group").classList.remove("invalid");
            });
        }
    });
}

/* ==========================================================================
   13. GSAP SCROLLTRIGGER & HERO ENTRANCE EFFECTS
   ========================================================================== */
function initGSAPAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    heroTl.from(".reveal-item", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 1,
        delay: 1.8
    });

    // Parallax scroll for Hero contents
    gsap.to(".hero-container-grid", {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 80,
        opacity: 0.2
    });

    // Parallax scroll for Hero background video
    gsap.to(".hero-video-raw", {
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 120,
        ease: "none"
    });

    document.querySelectorAll(".section-header").forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    gsap.from(".about-card", {
        scrollTrigger: {
            trigger: ".about-grid",
            start: "top 80%"
        },
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
    });

    gsap.from(".mode-card", {
        scrollTrigger: {
            trigger: ".modes-grid",
            start: "top 80%"
        },
        opacity: 0,
        scale: 0.9,
        y: 50,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out"
    });

    gsap.from(".gallery-item", {
        scrollTrigger: {
            trigger: ".gallery-grid",
            start: "top 80%"
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out"
    });

    gsap.from(".store-card", {
        scrollTrigger: {
            trigger: ".store-grid",
            start: "top 80%"
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out"
    });

    gsap.from(".pricing-card", {
        scrollTrigger: {
            trigger: ".pricing-grid",
            start: "top 80%"
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
    });

    const nav = document.getElementById("navbar");
    if (nav) {
        ScrollTrigger.create({
            start: "top -50",
            onEnter: () => nav.classList.add("scrolled"),
            onLeaveBack: () => nav.classList.remove("scrolled")
        });
    }

    const navLinks = document.querySelectorAll(".nav-link");
    document.querySelectorAll("section").forEach(sec => {
        const id = sec.getAttribute("id");
        ScrollTrigger.create({
            trigger: sec,
            start: "top 40%",
            end: "bottom 40%",
            onEnter: () => activateLink(id),
            onEnterBack: () => activateLink(id)
        });
    });

    function activateLink(id) {
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
                link.classList.add("active");
            }
        });
        if (window.updateActiveNavMarker) window.updateActiveNavMarker();
    }
}

/* ==========================================================================
   14. MOBILE NAVIGATION (HAMBURGER / LINKS CLICKS)
   ========================================================================== */
function initMobileNav() {
    const toggleBtn = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener("click", () => {
        toggleBtn.classList.toggle("active");
        navMenu.classList.toggle("active");
        playSynthSound("click");
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            toggleBtn.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });
}

/* ==========================================================================
   15. REVIEWS TESTIMONIAL SLIDER INTERACTIVE CONTROLS
   ========================================================================== */
function initReviewsSlider() {
    const wrapper = document.getElementById("reviews-wrapper");
    const nextBtn = document.getElementById("review-next");
    const prevBtn = document.getElementById("review-prev");
    const dots = document.querySelectorAll(".slider-dot");
    
    if (!wrapper || !nextBtn || !prevBtn) return;
    
    let activeSlideIndex = 0;
    const maxSlides = 3;

    function goToSlide(index) {
        activeSlideIndex = index;
        wrapper.style.transform = `translateX(-${activeSlideIndex * 33.333}%)`;
        
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === activeSlideIndex);
        });
    }

    nextBtn.addEventListener("click", () => {
        let index = activeSlideIndex + 1;
        if (index >= maxSlides) index = 0;
        goToSlide(index);
    });

    prevBtn.addEventListener("click", () => {
        let index = activeSlideIndex - 1;
        if (index < 0) index = maxSlides - 1;
        goToSlide(index);
    });

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            goToSlide(idx);
        });
    });
}

/* ==========================================================================
   16. PLAY NOW / TRAILER LIGHTBOX MODALS & DOWNLOAD SIMULATOR
   ========================================================================== */
function initPlayTrailerModals() {
    const playButtons = document.querySelectorAll(".play-trigger-btn");
    const playOverlay = document.getElementById("play-modal-overlay");
    const playModalContent = playOverlay ? playOverlay.querySelector(".play-modal") : null;
    const playCloseBtn = document.getElementById("play-modal-close");
    
    const platformCards = document.querySelectorAll(".platform-card");
    const installSim = document.getElementById("install-simulation");
    const installStatus = document.getElementById("install-status-text");
    const installPercent = document.getElementById("install-percent");
    const installBar = document.getElementById("install-bar-fill");
    
    const trailerButtons = document.querySelectorAll(".trailer-trigger-btn");
    const trailerOverlay = document.getElementById("trailer-video-modal-overlay");
    const trailerModalContent = trailerOverlay ? trailerOverlay.querySelector(".trailer-popup-modal") : null;
    const trailerCloseBtn = document.getElementById("trailer-video-modal-close");
    const trailerIframe = document.getElementById("lightbox-trailer-iframe");

    // 1. Play Modal Trigger
    playButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!playOverlay || !playModalContent) return;
            playOverlay.classList.add("active");
            document.body.classList.add("no-scroll");
            
            // Hide simulation from previous download
            if (installSim) installSim.style.display = "none";
            if (installBar) installBar.style.width = "0%";
            if (installPercent) installPercent.textContent = "0%";
            
            safeAnimateFromTo(playModalContent, 
                { opacity: 0, scale: 0.85, y: 30 },
                { opacity: 1, scale: 1, y: 0 },
                0.4
            );
        });
    });

    function closePlayModal() {
        if (!playOverlay || !playModalContent) return;
        safeAnimate(playModalContent, { opacity: 0, scale: 0.85, y: 30 }, 0.3, () => {
            playOverlay.classList.remove("active");
            document.body.classList.remove("no-scroll");
        });
    }

    if (playCloseBtn) playCloseBtn.addEventListener("click", closePlayModal);
    if (playOverlay) {
        playOverlay.addEventListener("click", (e) => {
            if (e.target === playOverlay) closePlayModal();
        });
    }

    // Platform click -> simulated downloader progress bar
    platformCards.forEach(card => {
        card.addEventListener("click", () => {
            const platform = card.getAttribute("data-platform");
            if (!installSim || !installBar || !installPercent || !installStatus) return;

            installSim.style.display = "block";
            playSynthSound("success");

            let percent = 0;
            const progressInterval = setInterval(() => {
                percent += Math.floor(Math.random() * 15) + 5;
                if (percent >= 100) {
                    percent = 100;
                    clearInterval(progressInterval);
                    
                    installStatus.textContent = "LAUNCH MATRIX CODE AUTHORIZED!";
                    installBar.style.width = "100%";
                    installPercent.textContent = "100%";

                    setTimeout(() => {
                        closePlayModal();
                        triggerSuccessPopup("LAUNCHING CLIENT", `Initializing connection to ${platform} servers. Operative secure key registered.`);
                    }, 800);
                } else {
                    installStatus.textContent = `DOWNLOADING ${platform.toUpperCase()} PACKETS...`;
                    installBar.style.width = `${percent}%`;
                    installPercent.textContent = `${percent}%`;
                }
            }, 120);
        });
    });

    // 2. Trailer Lightbox Trigger
    trailerButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (!trailerOverlay || !trailerModalContent || !trailerIframe) return;
            
            // Set autoplay source URL
            trailerIframe.src = "https://www.youtube.com/embed/8X2kIfS6fb8?autoplay=1&enablejsapi=1&mute=0";
            
            trailerOverlay.classList.add("active");
            document.body.classList.add("no-scroll");
            
            safeAnimateFromTo(trailerModalContent, 
                { opacity: 0, scale: 0.85, y: 30 },
                { opacity: 1, scale: 1, y: 0 },
                0.4
            );
        });
    });

    function closeTrailerModal() {
        if (!trailerOverlay || !trailerModalContent || !trailerIframe) return;
        safeAnimate(trailerModalContent, { opacity: 0, scale: 0.85, y: 30 }, 0.3, () => {
            trailerOverlay.classList.remove("active");
            document.body.classList.remove("no-scroll");
            // Clear iframe source so video stops playing
            trailerIframe.src = "";
        });
    }

    if (trailerCloseBtn) trailerCloseBtn.addEventListener("click", closeTrailerModal);
    if (trailerOverlay) {
        trailerOverlay.addEventListener("click", (e) => {
            if (e.target === trailerOverlay) closeTrailerModal();
        });
    }
}

/* ==========================================================================
   17. FUTURISTIC ACTIVE MENUBAR GLIDING INDICATOR
   ========================================================================== */
function initNavActiveIndicator() {
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const marker = document.getElementById("nav-active-marker");
    if (!navMenu || !marker) return;

    function positionMarker(target) {
        if (!target) {
            marker.style.opacity = "0";
            return;
        }
        const menuRect = navMenu.getBoundingClientRect();
        const linkRect = target.getBoundingClientRect();
        
        marker.style.opacity = "1";
        marker.style.left = `${linkRect.left - menuRect.left}px`;
        marker.style.width = `${linkRect.width}px`;
        marker.style.height = `${linkRect.height}px`;
    }

    // Position on active link initially
    setTimeout(() => {
        const activeLink = navMenu.querySelector(".nav-link.active");
        if (activeLink) positionMarker(activeLink);
    }, 500);

    navLinks.forEach(link => {
        link.addEventListener("mouseenter", (e) => {
            positionMarker(e.target);
        });
    });

    navMenu.addEventListener("mouseleave", () => {
        const activeLink = navMenu.querySelector(".nav-link.active");
        if (activeLink) {
            positionMarker(activeLink);
        } else {
            marker.style.opacity = "0";
        }
    });

    // Expose updates for scroll-triggered navigation links
    window.updateActiveNavMarker = () => {
        const activeLink = navMenu.querySelector(".nav-link.active");
        positionMarker(activeLink);
    };
}

/* ==========================================================================
   18. SMOOTH SCROLL NAVBAR HIDE & SHOW SEQUENCE
   ========================================================================== */
function initNavbarScrollHide() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    
    let lastScrollTop = 0;
    const delta = 10;
    
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        if (Math.abs(lastScrollTop - scrollTop) <= delta) return;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scroll Down -> Hide navbar
            navbar.classList.add("nav-hidden");
        } else {
            // Scroll Up -> Show navbar
            navbar.classList.remove("nav-hidden");
        }
        
        lastScrollTop = scrollTop;
    });
}

/* ==========================================================================
   19. ADVANCED CIRCULAR PAGE TRANSITION INTERCEPTOR
   ========================================================================== */
function initPageTransitions() {
    const overlay = document.getElementById("page-transition-overlay");
    const links = document.querySelectorAll('a[href^="#"]');
    if (!overlay) return;

    // Register section-entrance class and setup ScrollTrigger reveals
    const mainSections = document.querySelectorAll("main > section");
    mainSections.forEach(sec => {
        sec.classList.add("section-entrance");
        
        if (typeof ScrollTrigger !== "undefined" && typeof gsap !== "undefined") {
            ScrollTrigger.create({
                trigger: sec,
                start: "top 95%",
                onEnter: () => sec.classList.add("reveal"),
                once: true
            });
        } else {
            sec.classList.add("reveal");
        }
    });
    
    // Auto-reveal the hero section on load
    const heroSection = document.getElementById("home");
    if (heroSection) heroSection.classList.add("reveal");

    links.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            // Only intercept internal section hashes that point to real elements
            if (href && href.startsWith("#") && href.length > 1) {
                try {
                    const targetSection = document.querySelector(href);
                    if (targetSection) {
                        e.preventDefault();

                        // Capture click event coordinates
                        const clickX = e.clientX || window.innerWidth / 2;
                        const clickY = e.clientY || window.innerHeight / 2;

                        overlay.style.setProperty("--click-x", `${clickX}px`);
                        overlay.style.setProperty("--click-y", `${clickY}px`);

                        // Play custom sci-fi transition sound tones
                        playSynthSound("hover");
                        setTimeout(() => {
                            playSynthSound("click");
                        }, 150);

                        // Activate expanding transition circle
                        overlay.classList.add("active");

                        setTimeout(() => {
                            // Temporarily disable smooth scroll to allow instant transition behind the closed curtain
                            document.documentElement.style.scrollBehavior = "auto";
                            targetSection.scrollIntoView({ behavior: "auto", block: "start" });
                            document.documentElement.style.scrollBehavior = ""; // Restore native smooth scrolling

                            // Ensure target section is revealed
                            targetSection.classList.add("reveal");

                            // Glide navbar indicator marker behind active link
                            setTimeout(() => {
                                if (window.updateActiveNavMarker) window.updateActiveNavMarker();
                                if (typeof ScrollTrigger !== "undefined") {
                                    ScrollTrigger.refresh();
                                }
                            }, 50);

                        }, 400);

                        // Hide expanding transition circle
                        setTimeout(() => {
                            overlay.classList.remove("active");
                        }, 850);
                    }
                } catch (err) {
                    console.warn("Invalid selector target:", href, err);
                }
            }
        });
    });
}

/* ==========================================================================
   20. MAGNETIC CURSOR PHYSICAL ATTRACTION HOVER
   ========================================================================== */
function initMagneticHover() {
    const magneticTargets = document.querySelectorAll(".nav-link, .cart-btn, .theme-btn, .audio-btn, .btn, .platform-card, .char-tab-btn");
    
    magneticTargets.forEach(el => {
        el.addEventListener("mousemove", function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            const deltaX = mouseX - centerX;
            const deltaY = mouseY - centerY;
            
            // Subtle pull physics multiplier
            const pullX = deltaX * 0.28;
            const pullY = deltaY * 0.28;
            
            if (typeof gsap !== "undefined") {
                gsap.to(this, {
                    x: pullX,
                    y: pullY,
                    duration: 0.35,
                    ease: "power2.out"
                });
            } else {
                this.style.transform = `translate(${pullX}px, ${pullY}px)`;
            }
        });

        el.addEventListener("mouseleave", function() {
            if (typeof gsap !== "undefined") {
                gsap.to(this, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.4)"
                });
            } else {
                this.style.transform = "translate(0px, 0px)";
                this.style.transition = "transform 0.4s ease";
                setTimeout(() => {
                    this.style.transition = "";
                }, 400);
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEngine);
} else {
    initEngine();
}
