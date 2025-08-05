document.addEventListener('DOMContentLoaded', function() {
    const mainSkillIcons = document.querySelectorAll('.circle-icon');
    const floatingIcons = document.querySelectorAll('.floating-icon');
    const allIcons = [...mainSkillIcons, ...floatingIcons];
    
    // Store physics data for each icon
    const iconPhysics = new Map();
    
    // Initialize physics for each icon
    function initializePhysics() {
        allIcons.forEach((icon, index) => {
            // Disable CSS animations to use JavaScript physics
            icon.style.animation = 'none';
            
            // Get hero section bounds
            const heroSection = document.querySelector('.hero');
            const heroBounds = heroSection.getBoundingClientRect();
            
            // Random starting position within hero section
            const startX = Math.random() * (heroBounds.width - 60) + 30;
            const startY = Math.random() * (heroBounds.height - 60) + 30;
            
            // Random velocity (space-like movement)
            const velocityX = (Math.random() - 0.5) * 4;
            const velocityY = (Math.random() - 0.5) * 4;
            
            iconPhysics.set(icon, {
                x: startX,
                y: startY,
                vx: velocityX,
                vy: velocityY,
                size: icon.classList.contains('circle-icon') ? 55 : 60
            });
            
            // Position icon
            icon.style.position = 'absolute';
            icon.style.left = startX + 'px';
            icon.style.top = startY + 'px';
        });
    }
    
    // Physics update loop
    function updatePhysics() {
        const heroSection = document.querySelector('.hero');
        const heroBounds = heroSection.getBoundingClientRect();
        const heroHeight = heroBounds.height;
        const heroWidth = heroBounds.width;
        
        allIcons.forEach(icon => {
            const physics = iconPhysics.get(icon);
            if (!physics) return;
            
            // Update position
            physics.x += physics.vx;
            physics.y += physics.vy;
            
            // Wall collision detection and bouncing
            const iconRadius = physics.size / 2;
            
            // Left and right walls
            if (physics.x - iconRadius <= 0) {
                physics.x = iconRadius;
                physics.vx = Math.abs(physics.vx) * 0.9; // Bounce right with slight damping
                createWallCollisionEffect(icon, 'left');
            } else if (physics.x + iconRadius >= heroWidth) {
                physics.x = heroWidth - iconRadius;
                physics.vx = -Math.abs(physics.vx) * 0.9; // Bounce left with slight damping
                createWallCollisionEffect(icon, 'right');
            }
            
            // Top and bottom walls (hero section boundaries)
            if (physics.y - iconRadius <= 0) {
                physics.y = iconRadius;
                physics.vy = Math.abs(physics.vy) * 0.9; // Bounce down with slight damping
                createWallCollisionEffect(icon, 'top');
            } else if (physics.y + iconRadius >= heroHeight) {
                physics.y = heroHeight - iconRadius;
                physics.vy = -Math.abs(physics.vy) * 0.9; // Bounce up with slight damping
                createWallCollisionEffect(icon, 'bottom');
            }
            
            // Apply position
            icon.style.left = physics.x - iconRadius + 'px';
            icon.style.top = physics.y - iconRadius + 'px';
            
            // Slight random impulses for organic movement
            if (Math.random() < 0.002) {
                physics.vx += (Math.random() - 0.5) * 0.5;
                physics.vy += (Math.random() - 0.5) * 0.5;
            }
            
            // Keep velocities in reasonable range
            const maxVelocity = 3;
            physics.vx = Math.max(-maxVelocity, Math.min(maxVelocity, physics.vx));
            physics.vy = Math.max(-maxVelocity, Math.min(maxVelocity, physics.vy));
        });
        
        // Check icon-to-icon collisions
        checkIconCollisions();
        
        requestAnimationFrame(updatePhysics);
    }
    
    // Icon collision detection
    function checkIconCollisions() {
        for (let i = 0; i < allIcons.length; i++) {
            for (let j = i + 1; j < allIcons.length; j++) {
                const icon1 = allIcons[i];
                const icon2 = allIcons[j];
                const physics1 = iconPhysics.get(icon1);
                const physics2 = iconPhysics.get(icon2);
                
                if (!physics1 || !physics2) continue;
                
                const dx = physics2.x - physics1.x;
                const dy = physics2.y - physics1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (physics1.size + physics2.size) / 2 + 5;
                
                if (distance < minDistance && distance > 0) {
                    handleIconCollision(icon1, icon2, physics1, physics2, dx, dy, distance);
                }
            }
        }
    }
    
    // Handle collision between two icons
    function handleIconCollision(icon1, icon2, physics1, physics2, dx, dy, distance) {
        // Normalize collision direction
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Relative velocity
        const dvx = physics2.vx - physics1.vx;
        const dvy = physics2.vy - physics1.vy;
        
        // Relative velocity along collision normal
        const dvn = dvx * nx + dvy * ny;
        
        // Do not resolve if velocities are separating
        if (dvn > 0) return;
        
        // Collision impulse
        const impulse = 2 * dvn / 2; // Assuming equal mass
        
        // Update velocities
        physics1.vx += impulse * nx * 0.8;
        physics1.vy += impulse * ny * 0.8;
        physics2.vx -= impulse * nx * 0.8;
        physics2.vy -= impulse * ny * 0.8;
        
        // Separate icons to prevent overlap
        const overlap = (physics1.size + physics2.size) / 2 - distance;
        const separationX = nx * overlap * 0.5;
        const separationY = ny * overlap * 0.5;
        
        physics1.x -= separationX;
        physics1.y -= separationY;
        physics2.x += separationX;
        physics2.y += separationY;
        
        // Visual effects
        createCollisionEffect(icon1, icon2, physics1.x, physics1.y, physics2.x, physics2.y);
    }
    
    // Wall collision visual effect
    function createWallCollisionEffect(icon, wall) {
        icon.style.transform = 'scale(1.1)';
        icon.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)';
        
        setTimeout(() => {
            icon.style.transform = '';
            icon.style.boxShadow = '';
        }, 200);
    }
    
    // Icon collision visual effect
    function createCollisionEffect(icon1, icon2, x1, y1, x2, y2) {
        // Scale and glow both icons
        [icon1, icon2].forEach(icon => {
            icon.style.transform = 'scale(1.15)';
            icon.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.9), 0 0 60px rgba(59, 130, 246, 0.7)';
        });
        
        // Create ripple at collision point
        const rippleX = (x1 + x2) / 2;
        const rippleY = (y1 + y2) / 2;
        createRipple(rippleX, rippleY);
        
        // Reset visual effects
        setTimeout(() => {
            [icon1, icon2].forEach(icon => {
                icon.style.transform = '';
                icon.style.boxShadow = '';
            });
        }, 300);
    }
    
    // Create ripple effect
    function createRipple(x, y) {
        const heroSection = document.querySelector('.hero');
        const heroBounds = heroSection.getBoundingClientRect();
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x - 25}px;
            top: ${y - 25}px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 70%);
            pointer-events: none;
            z-index: 1000;
            animation: rippleExpand 0.8s ease-out;
        `;
        
        heroSection.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }
    
    // CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleExpand {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: scale(5) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Start physics simulation
    setTimeout(() => {
        initializePhysics();
        updatePhysics();
    }, 1000);
});