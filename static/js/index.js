window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // Setup image compare slider
    setupImageCompare();
    
    // Setup domain-specific image compare slider
    setupDomainCompare();
    
    // Setup segmentation comparison sliders
    setupSegmentationCompare('microscopyCompare');
    setupSegmentationCompare('segmentationCompare');
    
    // Setup hover zoom for three-column comparison
    setupHoverZoom();

})


// Image compare (before/after) slider
function setupImageCompare() {
    const container = document.getElementById('imgCompare');
    if (!container) return;

    const topWrap = container.querySelector('.img-top-wrap');
    const topImg = container.querySelector('.img-top');
    const handle = container.querySelector('.img-handle');

    let dragging = false;
    
    // Set top image width to match container (so it doesn't scale when wrapper resizes)
    function updateTopImageWidth() {
        const rect = container.getBoundingClientRect();
        container.style.setProperty('--compare-width', rect.width + 'px');
    }

    function setPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        // clamp
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;
        topWrap.style.width = percent + '%';
        handle.style.left = percent + '%';
        handle.setAttribute('aria-valuenow', Math.round(percent));
    }

    function onDown(e) {
        dragging = true;
        container.classList.add('is-dragging');
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
        e.preventDefault();
    }

    function onMove(e) {
        if (!dragging) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    }

    function onUp() {
        if (!dragging) return;
        dragging = false;
        container.classList.remove('is-dragging');
    }

    // Mouse events
    handle.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Touch events
    handle.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('touchend', onUp);

    // Click-to-move on container
    container.addEventListener('click', function(e) {
        // ignore if clicking the handle to start dragging
        if (e.target === handle) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    });

    // Keyboard accessibility
    handle.addEventListener('keydown', function(e) {
        const step = 2; // percent
        const current = parseFloat(handle.style.left || '50');
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            setPosition(container.getBoundingClientRect().left + (Math.max(0, current - step) / 100) * container.getBoundingClientRect().width);
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            setPosition(container.getBoundingClientRect().left + (Math.min(100, current + step) / 100) * container.getBoundingClientRect().width);
            e.preventDefault();
        }
    });

    // Initialize positions and size: ensure images are loaded before computing sizes
    const imgs = container.querySelectorAll('img');
    const bottomImg = container.querySelector('.img-bottom');
    let loaded = 0;

    function finalizeInit() {
        // compute container height from bottom image aspect ratio so both images occupy identical space
        const rect = container.getBoundingClientRect();
        if (bottomImg && bottomImg.naturalWidth && bottomImg.naturalHeight) {
            const h = (bottomImg.naturalHeight / bottomImg.naturalWidth) * rect.width;
            container.style.height = Math.round(h) + 'px';
        }
        // Set top image width to container width so it doesn't scale
        updateTopImageWidth();
        // center handle
        setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2);
    }

    imgs.forEach(img => {
        if (img.complete) {
            loaded++;
        } else {
            img.addEventListener('load', () => {
                loaded++;
                if (loaded === imgs.length) finalizeInit();
            });
        }
    });
    if (loaded === imgs.length) finalizeInit();

    // recompute on resize to preserve aspect ratio
    let resizeTimeout = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (bottomImg && bottomImg.naturalWidth && bottomImg.naturalHeight) {
                const rect = container.getBoundingClientRect();
                const h = (bottomImg.naturalHeight / bottomImg.naturalWidth) * rect.width;
                container.style.height = Math.round(h) + 'px';
            }
            // Update top image width to match new container width
            updateTopImageWidth();
            // keep handle position consistent after resize
            const currentLeft = handle.style.left ? parseFloat(handle.style.left) : 50;
            handle.style.left = currentLeft + '%';
            topWrap.style.width = currentLeft + '%';
        }, 120);
    });
}

/**
 * Setup hover zoom for three-column image comparison
 * Shows individual magnified circles over each image at corresponding positions
 */
function setupHoverZoom() {
    const container = document.getElementById('zoomCompareContainer');
    
    if (!container) return;
    
    const images = container.querySelectorAll('.zoom-compare-img');
    if (images.length === 0) return;
    
    const zoomLevel = 2.5; // 2.5x magnification
    const lensSize = 180; // Size of the circular lens in pixels
    
    let allImagesData = [];
    let lensElements = [];
    
    // Create a zoom lens for each image
    images.forEach((img, index) => {
        const lens = document.createElement('div');
        lens.className = 'zoom-lens-individual';
        lens.style.display = 'none';
        document.body.appendChild(lens);
        
        allImagesData[index] = {
            element: img,
            src: img.src,
            rect: null,
            lens: lens
        };
        
        lensElements.push(lens);
    });
    
    function updateImageRects() {
        allImagesData.forEach(data => {
            data.rect = data.element.getBoundingClientRect();
        });
    }
    
    function showAllZoomLenses(e, hoveredImageIndex) {
        updateImageRects();
        
        const hoveredData = allImagesData[hoveredImageIndex];
        const hoveredRect = hoveredData.rect;
        
        // Calculate mouse position relative to the hovered image
        const mouseX = e.clientX - hoveredRect.left;
        const mouseY = e.clientY - hoveredRect.top;
        
        // Calculate the percentage position in the image
        const xPercent = (mouseX / hoveredRect.width) * 100;
        const yPercent = (mouseY / hoveredRect.height) * 100;
        
        // Show zoom lens for each image at the corresponding position
        allImagesData.forEach((data, index) => {
            const rect = data.rect;
            
            // Calculate the corresponding pixel position in this image
            const correspondingX = (xPercent / 100) * rect.width;
            const correspondingY = (yPercent / 100) * rect.height;
            
            // Position lens centered on the corresponding point
            const lensLeft = rect.left + correspondingX;
            const lensTop = rect.top + correspondingY;
            
            // Clamp lens position to stay within the image bounds
            const clampedLeft = Math.max(rect.left + lensSize / 2, Math.min(rect.right - lensSize / 2, lensLeft));
            const clampedTop = Math.max(rect.top + lensSize / 2, Math.min(rect.bottom - lensSize / 2, lensTop));
            
            data.lens.style.left = (clampedLeft - lensSize / 2) + 'px';
            data.lens.style.top = (clampedTop - lensSize / 2) + 'px';
            data.lens.style.width = lensSize + 'px';
            data.lens.style.height = lensSize + 'px';
            data.lens.style.display = 'block';
            
            // Calculate the background position for the magnified view
            // Center the magnified image on the corresponding point
            const bgX = -(correspondingX * zoomLevel - lensSize / 2);
            const bgY = -(correspondingY * zoomLevel - lensSize / 2);
            
            data.lens.style.backgroundImage = `url(${data.src})`;
            data.lens.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
            data.lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            // Highlight the lens on the hovered image
            if (index === hoveredImageIndex) {
                data.lens.style.borderColor = 'rgba(37, 99, 235, 0.9)'; // Blue border
                data.lens.style.borderWidth = '3px';
                data.lens.style.boxShadow = '0 8px 32px rgba(37, 99, 235, 0.4), inset 0 0 0 2px rgba(255, 255, 255, 0.8)';
            } else {
                data.lens.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                data.lens.style.borderWidth = '3px';
                data.lens.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 2px rgba(0, 0, 0, 0.1)';
            }
        });
    }
    
    function hideAllZoomLenses() {
        lensElements.forEach(lens => {
            lens.style.display = 'none';
        });
    }
    
    // Attach event listeners to each image
    images.forEach((img, index) => {
        img.addEventListener('mouseenter', (e) => {
            updateImageRects();
        });
        
        img.addEventListener('mousemove', (e) => {
            showAllZoomLenses(e, index);
        });
        
        img.addEventListener('mouseleave', () => {
            hideAllZoomLenses();
        });
    });
    
    // Update rects on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateImageRects();
            hideAllZoomLenses();
        }, 100);
    });
    
    // Initial rect calculation
    updateImageRects();
}

// Domain-specific image comparison with switching
function setupDomainCompare() {
    const container = document.getElementById('domainCompare');
    if (!container) return;

    const topWrap = container.querySelector('.img-top-wrap');
    const topImg = container.querySelector('.img-top');
    const handle = container.querySelector('.img-handle');

    let dragging = false;
    
    // Set top image width to match container (so it doesn't scale when wrapper resizes)
    function updateTopImageWidth() {
        const rect = container.getBoundingClientRect();
        container.style.setProperty('--compare-width', rect.width + 'px');
    }

    function setPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        // clamp
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;
        topWrap.style.width = percent + '%';
        handle.style.left = percent + '%';
        handle.setAttribute('aria-valuenow', Math.round(percent));
    }

    function onDown(e) {
        dragging = true;
        container.classList.add('is-dragging');
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
        e.preventDefault();
    }

    function onMove(e) {
        if (!dragging) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    }

    function onUp() {
        if (!dragging) return;
        dragging = false;
        container.classList.remove('is-dragging');
    }

    // Mouse events
    handle.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Touch events
    handle.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('touchend', onUp);

    // Click-to-move on container
    container.addEventListener('click', function(e) {
        // ignore if clicking the handle to start dragging
        if (e.target === handle) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    });

    // Keyboard accessibility
    handle.addEventListener('keydown', function(e) {
        const step = 2; // percent
        const current = parseFloat(handle.style.left || '50');
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            setPosition(container.getBoundingClientRect().left + (Math.max(0, current - step) / 100) * container.getBoundingClientRect().width);
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            setPosition(container.getBoundingClientRect().left + (Math.min(100, current + step) / 100) * container.getBoundingClientRect().width);
            e.preventDefault();
        }
    });

    // Initialize positions and size: ensure images are loaded before computing sizes
    const imgs = container.querySelectorAll('img');
    const bottomImg = container.querySelector('.img-bottom');
    let loaded = 0;

    function finalizeInit() {
        // Set fixed height for consistent display across all domains
        const fixedHeight = 500; // Fixed height in pixels
        container.style.height = fixedHeight + 'px';
        
        // Set top image width to container width so it doesn't scale
        updateTopImageWidth();
        // center handle
        setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2);
    }

    imgs.forEach(img => {
        if (img.complete) {
            loaded++;
        } else {
            img.addEventListener('load', () => {
                loaded++;
                if (loaded === imgs.length) finalizeInit();
            });
        }
    });
    if (loaded === imgs.length) finalizeInit();

    // recompute on resize to preserve aspect ratio
    let resizeTimeout = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Keep fixed height
            const fixedHeight = 500;
            container.style.height = fixedHeight + 'px';
            
            // Update top image width to match new container width
            updateTopImageWidth();
            // keep handle position consistent after resize
            const currentLeft = handle.style.left ? parseFloat(handle.style.left) : 50;
            handle.style.left = currentLeft + '%';
            topWrap.style.width = currentLeft + '%';
        }, 120);
    });

    // Store the reinit function for domain switching
    container.domainReinit = finalizeInit;
}

// Switch between different domains
function switchDomain(domain) {
    const container = document.getElementById('domainCompare');
    if (!container) return;

    const beforeImg = document.getElementById('domainBefore');
    const afterImg = document.getElementById('domainAfter');
    const buttons = document.querySelectorAll('.domain-btn');
    
    // Update active button
    buttons.forEach(btn => {
        if (btn.dataset.domain === domain) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Image paths for each domain
    const imagePaths = {
        whales: {
            before: 'static/images/whale_dist.png',
            after: 'static/images/whale_clean.png'
        },
        camera: {
            before: 'static/images/camera_dist.png',
            after: 'static/images/camera_clean.png'
        },
        astro: {
            before: 'static/images/astro_dist.png',
            after: 'static/images/astro_clean.png'
        },
        cell: {
            before: 'static/images/cell_dist.png',
            after: 'static/images/cell_clean.png'
        }
    };
    
    // Update images
    if (imagePaths[domain]) {
        beforeImg.src = imagePaths[domain].before;
        afterImg.src = imagePaths[domain].after;
        container.dataset.currentDomain = domain;
        
        // Reinitialize slider after images load
        let loadedCount = 0;
        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount === 2 && container.domainReinit) {
                container.domainReinit();
            }
        };
        
        beforeImg.addEventListener('load', checkLoaded, {once: true});
        afterImg.addEventListener('load', checkLoaded, {once: true});
        
        // If images are already cached/loaded
        if (beforeImg.complete && afterImg.complete && container.domainReinit) {
            container.domainReinit();
        }
    }
}

// Switch between scientific domains
function switchScientificDomain(domain) {
    const img = document.getElementById('scientificDomainImage');
    const text = document.getElementById('scientificDomainText');
    const buttons = document.querySelectorAll('[data-domain]');
    
    // Update active button
    buttons.forEach(btn => {
        if (btn.dataset.domain === domain) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Image paths and descriptions for each domain
    const domainData = {
        'microbiology': {
            image: 'static/images/cell.png',
            text: 'Microbiology imaging often suffers from over-fluorescence and noise due to sensor limitations. PRISM can restore fine cellular details while preserving important biological structures, without ever being explicitly being trained on examples of a glowing effect.'
        },
        'camera': {
            image: 'static/images/camera.png',
            text: 'Camera traps in wildlife monitoring face challenges from lens distortion, glare, and environmental conditions. PRISM removes these artifacts while maintaining the integrity of animal features for accurate species identification, even though it was never trained on examples with solar flares or other environmental effects.'
        },
        'whales': {
            image: 'static/images/whale.png',
            text: 'Monitoring whales through aerial or underwater imaging encounters fluid distortions and light refraction, a complex physical interaction that PRISM can correct without explicit paired ground truth. PRISM corrects these effects to enable better identification and behavioral analysis.'
        }
    };
    
    // Update image and text
    if (domainData[domain]) {
        if (img) {
            img.src = domainData[domain].image;
            img.alt = domain + ' example';
        }
        if (text) {
            text.innerHTML = '<em>' + domainData[domain].text + '</em>';
        }
    }
}

// Switch between segmentation comparison modes
function switchSegmentationMode(mode) {
    const modes = {
        'lq': {
            imageSrc: 'static/images/lq_micro.png',
            segSrc: 'static/images/lq_seg.png',
            miou: '0.65'
        },
        'auto': {
            imageSrc: 'static/images/full_micro.png',
            segSrc: 'static/images/full_seg.png',
            miou: '0.78'
        },
        'manual': {
            imageSrc: 'static/images/partial_micro.png',
            segSrc: 'static/images/partial_seg.png',
            miou: '0.92'
        }
    };
    
    // Update active button
    $('.seg-mode-btn').removeClass('active');
    $(`[onclick="switchSegmentationMode('${mode}')"]`).addClass('active');
    
    // Update overlay images for both sliders
    const modeData = modes[mode];
    const microscopyOverlay = document.getElementById('microscopyOverlay');
    const segmentationOverlay = document.getElementById('segmentationOverlay');
    
    if (!microscopyOverlay || !segmentationOverlay) return;
    
    // Update microscopy slider overlay
    microscopyOverlay.src = modeData.imageSrc;
    
    // Update segmentation slider overlay
    segmentationOverlay.src = modeData.segSrc;
    
    // Update mIOU score
    $('#miouScore').text(modeData.miou);
    
    // Reinitialize both sliders after images load
    Promise.all([
        new Promise(resolve => {
            if (microscopyOverlay.complete) resolve();
            else microscopyOverlay.onload = resolve;
        }),
        new Promise(resolve => {
            if (segmentationOverlay.complete) resolve();
            else segmentationOverlay.onload = resolve;
        })
    ]).then(() => {
        setupSegmentationCompare('microscopyCompare');
        setupSegmentationCompare('segmentationCompare');
    });
}

// Global object to store synchronized slider positions
window.segmentationSliderSync = {
    position: 50, // percentage
    sliders: []
};

// Helper function to synchronize other sliders
function syncOtherSliders(sourceContainer, percent) {
    window.segmentationSliderSync.sliders.forEach(sliderData => {
        if (sliderData.container !== sourceContainer) {
            sliderData.setPosition(percent);
        }
    });
}

// Setup segmentation comparison sliders
function setupSegmentationCompare(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const handle = container.querySelector('.img-handle');
    const topWrap = container.querySelector('.img-top-wrap');
    const topImg = container.querySelector('.img-top');
    const bottomImg = container.querySelector('.img-bottom');
    
    if (!handle || !topWrap || !topImg || !bottomImg) return;
    
    let isDragging = false;
    
    // Register this slider for synchronization
    const sliderData = {
        container,
        handle,
        topWrap,
        setPosition: null // Will be set below
    };
    
    // Remove if already registered (for re-initialization)
    window.segmentationSliderSync.sliders = window.segmentationSliderSync.sliders.filter(
        s => s.container !== container
    );
    window.segmentationSliderSync.sliders.push(sliderData);
    
    // Set top image width to match container
    function updateTopImageWidth() {
        const rect = container.getBoundingClientRect();
        container.style.setProperty('--compare-width', rect.width + 'px');
    }
    
    function setPosition(clientX, shouldSync = true) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        // clamp
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;
        topWrap.style.width = percent + '%';
        handle.style.left = percent + '%';
        handle.setAttribute('aria-valuenow', Math.round(percent));
        
        // Sync with other sliders
        if (shouldSync) {
            window.segmentationSliderSync.position = percent;
            syncOtherSliders(container, percent);
        }
    }
    
    function setPositionByPercent(percent) {
        topWrap.style.width = percent + '%';
        handle.style.left = percent + '%';
        handle.setAttribute('aria-valuenow', Math.round(percent));
    }
    
    // Store the setPosition function for external access
    sliderData.setPosition = setPositionByPercent;
    
    function onDown(e) {
        isDragging = true;
        container.classList.add('is-dragging');
        // Mark all synchronized sliders as dragging
        window.segmentationSliderSync.sliders.forEach(s => {
            s.container.classList.add('is-dragging');
        });
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
        e.preventDefault();
    }
    
    function onMove(e) {
        if (!isDragging) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    }
    
    function onUp() {
        if (!isDragging) return;
        isDragging = false;
        // Remove dragging state from all synchronized sliders
        window.segmentationSliderSync.sliders.forEach(s => {
            s.container.classList.remove('is-dragging');
        });
    }
    
    // Mouse events
    handle.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    
    // Touch events
    handle.addEventListener('touchstart', onDown, {passive: false});
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('touchend', onUp);
    
    // Click-to-move on container
    container.addEventListener('click', function(e) {
        if (e.target === handle) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    });
    
    // Keyboard accessibility
    handle.addEventListener('keydown', function(e) {
        const step = 2; // percent
        const current = parseFloat(handle.style.left || '50');
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            setPosition(container.getBoundingClientRect().left + (Math.max(0, current - step) / 100) * container.getBoundingClientRect().width, true);
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            setPosition(container.getBoundingClientRect().left + (Math.min(100, current + step) / 100) * container.getBoundingClientRect().width, true);
            e.preventDefault();
        }
    });
    
    // Initialize positions and size
    const imgs = container.querySelectorAll('img');
    let loaded = 0;
    
    function finalizeInit() {
        const rect = container.getBoundingClientRect();
        if (bottomImg && bottomImg.naturalWidth && bottomImg.naturalHeight) {
            const h = (bottomImg.naturalHeight / bottomImg.naturalWidth) * rect.width;
            container.style.height = Math.round(h) + 'px';
        }
        updateTopImageWidth();
        // Use the global synced position if available, otherwise default to 50%
        const initialPercent = window.segmentationSliderSync.position;
        setPosition(container.getBoundingClientRect().left + (initialPercent / 100) * container.getBoundingClientRect().width, false);
    }
    
    imgs.forEach(img => {
        if (img.complete) {
            loaded++;
        } else {
            img.addEventListener('load', () => {
                loaded++;
                if (loaded === imgs.length) finalizeInit();
            });
        }
    });
    if (loaded === imgs.length) finalizeInit();
}

// Interactive Restoration Steps
let currentRestorationStep = 1;

function nextRestorationStep() {
    const btn = document.getElementById('restorationBtn');
    const label = document.getElementById('restorationLabel');
    const doneDiv = document.getElementById('restorationDone');
    const hint = document.getElementById('restorationHint');
    
    // Hide all stages
    document.getElementById('restorationStage1').style.display = 'none';
    document.getElementById('restorationStage2').style.display = 'none';
    document.getElementById('restorationStage3').style.display = 'none';
    document.getElementById('restorationStage4').style.display = 'none';
    
    currentRestorationStep++;
    
    if (currentRestorationStep === 2) {
        // Step 2: Show slider A vs B, button says "Fix Coloring"
        label.textContent = 'Fix Coloring';
        document.getElementById('restorationStage2').style.display = 'block';
        hint.innerHTML = '<em>Slide to compare before and after unwarping</em>';
        
        // Initialize slider for stage 2
        setupRestorationSlider('restorationStage2');
        
    } else if (currentRestorationStep === 3) {
        // Step 3: Show slider B vs C, button says "Unblur"
        label.textContent = 'Unblur';
        document.getElementById('restorationStage3').style.display = 'block';
        hint.innerHTML = '<em>Slide to compare before and after color correction</em>';
        
        // Initialize slider for stage 3
        setupRestorationSlider('restorationStage3');
        
    } else if (currentRestorationStep === 4) {
        // Step 4: Show slider C vs D, button disappears, "Done!" appears
        btn.style.display = 'none';
        doneDiv.style.display = 'flex';
        document.getElementById('restorationStage4').style.display = 'block';
        hint.innerHTML = '<em>Slide to compare before and after deblurring. Looks like restoration is complete!</em>';
        
        // Initialize slider for stage 4
        setupRestorationSlider('restorationStage4');
    }
}

function setupRestorationSlider(stageId) {
    const container = document.getElementById(stageId);
    if (!container) return;
    
    const handle = container.querySelector('.img-handle');
    const topWrap = container.querySelector('.img-top-wrap');
    const topImg = container.querySelector('.img-top');
    const bottomImg = container.querySelector('.img-bottom');
    
    if (!handle || !topWrap || !topImg || !bottomImg) return;
    
    let isDragging = false;
    
    // Set top image width to match container (so it doesn't scale when wrapper resizes)
    function updateTopImageWidth() {
        const rect = container.getBoundingClientRect();
        container.style.setProperty('--compare-width', rect.width + 'px');
    }
    
    function setPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        // clamp
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;
        topWrap.style.width = percent + '%';
        handle.style.left = percent + '%';
        handle.setAttribute('aria-valuenow', Math.round(percent));
    }
    
    function onDown(e) {
        isDragging = true;
        container.classList.add('is-dragging');
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
        e.preventDefault();
    }
    
    function onMove(e) {
        if (!isDragging) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    }
    
    function onUp() {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('is-dragging');
    }
    
    // Mouse events
    handle.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    
    // Touch events
    handle.addEventListener('touchstart', onDown, {passive: false});
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('touchend', onUp);
    
    // Click-to-move on container
    container.addEventListener('click', function(e) {
        // ignore if clicking the handle to start dragging
        if (e.target === handle) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
    });
    
    // Keyboard accessibility
    handle.addEventListener('keydown', function(e) {
        const step = 2; // percent
        const current = parseFloat(handle.style.left || '50');
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            setPosition(container.getBoundingClientRect().left + (Math.max(0, current - step) / 100) * container.getBoundingClientRect().width);
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            setPosition(container.getBoundingClientRect().left + (Math.min(100, current + step) / 100) * container.getBoundingClientRect().width);
            e.preventDefault();
        }
    });
    
    // Initialize positions and size: ensure images are loaded before computing sizes
    const imgs = container.querySelectorAll('img');
    let loaded = 0;
    
    function finalizeInit() {
        // compute container height from bottom image aspect ratio so both images occupy identical space
        const rect = container.getBoundingClientRect();
        if (bottomImg && bottomImg.naturalWidth && bottomImg.naturalHeight) {
            const h = (bottomImg.naturalHeight / bottomImg.naturalWidth) * rect.width;
            container.style.height = Math.round(h) + 'px';
        }
        // Set top image width to container width so it doesn't scale
        updateTopImageWidth();
        // center handle
        setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width / 2);
    }
    
    imgs.forEach(img => {
        if (img.complete) {
            loaded++;
        } else {
            img.addEventListener('load', () => {
                loaded++;
                if (loaded === imgs.length) finalizeInit();
            });
        }
    });
    if (loaded === imgs.length) finalizeInit();
    
    // recompute on resize to preserve aspect ratio
    let resizeTimeout = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (bottomImg && bottomImg.naturalWidth && bottomImg.naturalHeight) {
                const rect = container.getBoundingClientRect();
                const h = (bottomImg.naturalHeight / bottomImg.naturalWidth) * rect.width;
                container.style.height = Math.round(h) + 'px';
            }
            // Update top image width to match new container width
            updateTopImageWidth();
            // keep handle position consistent after resize
            const currentLeft = handle.style.left ? parseFloat(handle.style.left) : 50;
            handle.style.left = currentLeft + '%';
            topWrap.style.width = currentLeft + '%';
        }, 120);
    });
}
