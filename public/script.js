// API Base URL - Change this to your server URL
const API_BASE_URL = 'http://localhost:3001/api';

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('nav ul');
const pageLinks = document.querySelectorAll('a[data-page]');
const pageContents = document.querySelectorAll('.page-content');
const notification = document.getElementById('notification');

// Show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.backgroundColor = isError ? '#e74c3c' : '#3498db';
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }

    // Page navigation
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Update active nav link
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            if (navMenu) navMenu.classList.remove('show');
        });
    });

    // Load featured plans on home page
    loadFeaturedPlans();
    
    // Setup admin functionality
    setupAdminFunctionality();
    
    // Setup plans filtering
    setupPlansFiltering();
    
    // Setup contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will contact you soon.');
            this.reset();
        });
    }
    
    // Setup newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
            this.reset();
        });
    }
});

// Show the specified page and hide others
function showPage(page) {
    pageContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // If showing plans page, load the plans
    if (page === 'plans') {
        loadAllPlans();
    }
    
    // If showing admin page, load admin plans
    if (page === 'admin') {
        loadAdminPlans();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// API Functions
async function fetchPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/plans`);
        if (!response.ok) throw new Error('Failed to fetch plans');
        return await response.json();
    } catch (error) {
        console.error('Error fetching plans:', error);
        showNotification('Error loading plans. Please try again.', true);
        return [];
    }
}

async function fetchFeaturedPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/plans/featured`);
        if (!response.ok) throw new Error('Failed to fetch featured plans');
        return await response.json();
    } catch (error) {
        console.error('Error fetching featured plans:', error);
        showNotification('Error loading featured plans. Please try again.', true);
        return [];
    }
}

async function addPlan(plan) {
    try {
        const response = await fetch(`${API_BASE_URL}/plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plan)
        });
        
        if (!response.ok) throw new Error('Failed to add plan');
        return await response.json();
    } catch (error) {
        console.error('Error adding plan:', error);
        showNotification('Error adding plan. Please try again.', true);
        throw error;
    }
}

async function updatePlan(id, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) throw new Error('Failed to update plan');
        return await response.json();
    } catch (error) {
        console.error('Error updating plan:', error);
        showNotification('Error updating plan. Please try again.', true);
        throw error;
    }
}

async function deletePlan(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete plan');
        return await response.json();
    } catch (error) {
        console.error('Error deleting plan:', error);
        showNotification('Error deleting plan. Please try again.', true);
        throw error;
    }
}

// Load featured plans on home page
async function loadFeaturedPlans() {
    const featuredPlansContainer = document.getElementById('featuredPlans');
    const featuredSpinner = document.getElementById('featuredSpinner');
    
    if (!featuredPlansContainer) return;
    
    featuredSpinner.style.display = 'block';
    featuredPlansContainer.innerHTML = '';
    
    try {
        const featuredPlans = await fetchFeaturedPlans();
        
        featuredSpinner.style.display = 'none';
        
        if (featuredPlans.length === 0) {
            featuredPlansContainer.innerHTML = '<p>No featured plans available.</p>';
            return;
        }
        
        featuredPlans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            planCard.innerHTML = `
                <div class="plan-image">
                    ${createImageCarousel(plan.images, plan.title)}
                    ${plan.featured ? '<div class="featured-badge">FEATURED</div>' : ''}
                </div>
                <div class="plan-details">
                    <h3>${plan.title}</h3>
                    <p class="plan-description">${plan.description}</p>
                    
                    
                    
                    <div class="plan-price">R${plan.price.toLocaleString()}</div>
                    
                    ${plan.floors ? plan.floors.map(floor => `
                        <div class="floor-info">
                            <h4><i class="fas fa-layer-group"></i> ${floor.name}</h4>
                            <div class="floor-details">
                                <div class="floor-area">${floor.area} sqm</div>
                                <div class="floor-rooms">
                                    ${floor.rooms.map(room => `<span class="room-tag">${room}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('') : ''}
                    
                    <div class="plan-actions">
                        <button class="btn btn-details view-details" data-id="${plan.id}">View Details</button>
                        <button class="btn btn-whatsapp select-plan" data-id="${plan.id}">Select This Plan</button>
                    </div>
                </div>
            `;
            featuredPlansContainer.appendChild(planCard);
        });
        
        // Add event listeners to the buttons
        addPlanButtonListeners();
        
        // Initialize carousels
        initializeCarousels();
        
    } catch (error) {
        featuredSpinner.style.display = 'none';
        featuredPlansContainer.innerHTML = '<p>Error loading featured plans. Please try again later.</p>';
    }
}

// Load all plans on plans page
async function loadAllPlans() {
    const plansContainer = document.getElementById('allPlans');
    const plansSpinner = document.getElementById('plansSpinner');
    
    if (!plansContainer) return;
    
    plansSpinner.style.display = 'block';
    plansContainer.innerHTML = '';
    
    try {
        const plans = await fetchPlans();
        
        plansSpinner.style.display = 'none';
        
        if (plans.length === 0) {
            plansContainer.innerHTML = '<p>No plans available.</p>';
            return;
        }
        
        plans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            planCard.innerHTML = `
                <div class="plan-image">
                    ${createImageCarousel(plan.images, plan.title)}
                    ${plan.featured ? '<div class="featured-badge">FEATURED</div>' : ''}
                </div>
                <div class="plan-details">
                    <h3>${plan.title}</h3>
                    <p class="plan-description">${plan.description}</p>
                    
                    <div class="plan-specs">
                        <span><i class="fas fa-bed"></i> ${plan.bedrooms} Bedrooms</span>
                        <span><i class="fas fa-bath"></i> ${plan.bathrooms} Bathrooms</span>
                        <span><i class="fas fa-ruler-combined"></i> ${plan.totalArea} sqm</span>
                    </div>
                    
                    <div class="plan-price">R${plan.price.toLocaleString()}</div>
                    
                    ${plan.floors ? plan.floors.map(floor => `
                        <div class="floor-info">
                            <h4><i class="fas fa-layer-group"></i> ${floor.name}</h4>
                            <div class="floor-details">
                                <div class="floor-area">${floor.area} sqm</div>
                                <div class="floor-rooms">
                                    ${floor.rooms.map(room => `<span class="room-tag">${room}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('') : ''}
                    
                    <div class="plan-actions">
                        <button class="btn btn-details view-details" data-id="${plan.id}">View Details</button>
                        <button class="btn btn-whatsapp select-plan" data-id="${plan.id}">Select This Plan</button>
                    </div>
                </div>
            `;
            plansContainer.appendChild(planCard);
        });
        
        // Add event listeners to the buttons
        addPlanButtonListeners();
        
        // Initialize carousels
        initializeCarousels();
        
    } catch (error) {
        plansSpinner.style.display = 'none';
        plansContainer.innerHTML = '<p>Error loading plans. Please try again later.</p>';
    }
}

// Create image carousel HTML
function createImageCarousel(images, title) {
    if (!images || images.length === 0) {
        return `<img src="https://via.placeholder.com/400x300?text=No+Image" alt="${title}">`;
    }
    
    let carouselHTML = `
        <div class="carousel">
            <div class="carousel-images">
    `;
    
    images.forEach((image, index) => {
        carouselHTML += `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${image}" alt="${title} - Image ${index + 1}" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
            </div>
        `;
    });
    
    carouselHTML += `
            </div>
    `;
    
    if (images.length > 1) {
        carouselHTML += `
            <button class="carousel-prev">&#10094;</button>
            <button class="carousel-next">&#10095;</button>
            <div class="carousel-dots">
        `;
        
        images.forEach((_, index) => {
            carouselHTML += `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`;
        });
        
        carouselHTML += `
            </div>
        `;
    }
    
    carouselHTML += `</div>`;
    
    return carouselHTML;
}

// Initialize carousels
function initializeCarousels() {
    document.querySelectorAll('.carousel').forEach(carousel => {
        const items = carousel.querySelectorAll('.carousel-item');
        const dots = carousel.querySelectorAll('.dot');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        
        if (items.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dots.length > 0) carousel.querySelector('.carousel-dots').style.display = 'none';
            return;
        }
        
        let currentIndex = 0;
        
        function showSlide(index) {
            // Hide all items
            items.forEach(item => item.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show current item
            items[index].classList.add('active');
            dots[index].classList.add('active');
            
            currentIndex = index;
        }
        
        // Next slide
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= items.length) newIndex = 0;
                showSlide(newIndex);
            });
        }
        
        // Previous slide
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = items.length - 1;
                showSlide(newIndex);
            });
        }
        
        // Dot navigation
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                showSlide(index);
            });
        });
        
        // Auto slide if more than 1 image
        if (items.length > 1) {
            setInterval(() => {
                let newIndex = currentIndex + 1;
                if (newIndex >= items.length) newIndex = 0;
                showSlide(newIndex);
            }, 5000);
        }
    });
}

// Select a plan and redirect to WhatsApp
function selectPlan(planId) {
    // Find the plan by ID
    findPlanById(planId).then(plan => {
        if (!plan) {
            showNotification('Plan not found!', true);
            return;
        }
        
        // Create the WhatsApp message
        const message = `Hello Cedric! I'm interested in your ${plan.title} house plan.%0A%0A` +
                       `*Plan Details:*%0A` +
                       `- ${plan.description}%0A` +
                       `- Bedrooms: ${plan.bedrooms}%0A` +
                       `- Bathrooms: ${plan.bathrooms}%0A` +
                       `- Total Area: ${plan.totalArea} m²%0A` +
                       `- Stories: ${plan.stories}%0A` +
                       `- Price: R${plan.price.toLocaleString()}%0A%0A` +
                       `Please provide me with more information about this plan.`;
        
        // Create the WhatsApp URL
        const whatsappURL = `https://wa.me/27726659790?text=${message}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');
        
        showNotification('Opening WhatsApp to contact Cedric...');
    }).catch(error => {
        console.error('Error finding plan:', error);
        showNotification('Error selecting plan. Please try again.', true);
    });
}

// Find a plan by ID from either featured or all plans
async function findPlanById(planId) {
    try {
        // First try to get it from the featured plans
        const featuredPlans = await fetchFeaturedPlans();
        const featuredPlan = featuredPlans.find(p => p.id == planId);
        if (featuredPlan) return featuredPlan;
        
        // If not found in featured, try all plans
        const allPlans = await fetchPlans();
        return allPlans.find(p => p.id == planId);
    } catch (error) {
        console.error('Error finding plan:', error);
        return null;
    }
}

// View plan details
function viewPlanDetails(planId) {
    findPlanById(planId).then(plan => {
        if (!plan) {
            showNotification('Plan not found!', true);
            return;
        }
        
        // Create a detailed message
        let detailsMessage = `Plan Details:\n\n${plan.title}\n${plan.description}\n\n`;
        detailsMessage += `Bedrooms: ${plan.bedrooms}\n`;
        detailsMessage += `Bathrooms: ${plan.bathrooms}\n`;
        detailsMessage += `Total Area: ${plan.totalArea} m²\n`;
        detailsMessage += `Stories: ${plan.stories}\n`;
        detailsMessage += `Price: R${plan.price.toLocaleString()}\n\n`;
        
        // Add floor details if available
        if (plan.floors && plan.floors.length > 0) {
            detailsMessage += `Floor Plans:\n`;
            plan.floors.forEach(floor => {
                detailsMessage += `\n${floor.name} (${floor.area} m²):\n`;
                detailsMessage += `- ${floor.rooms.join('\n- ')}\n`;
            });
        }
        
        // Show details in an alert
        alert(detailsMessage);
    }).catch(error => {
        console.error('Error finding plan:', error);
        showNotification('Error loading plan details. Please try again.', true);
    });
}

// Add event listeners for both buttons after the plans are loaded
function addPlanButtonListeners() {
    // Add event listeners to select buttons
    document.querySelectorAll('.select-plan').forEach(button => {
        button.addEventListener('click', function() {
            const planId = this.getAttribute('data-id');
            selectPlan(planId);
        });
    });
    
    // Add event listeners to details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const planId = this.getAttribute('data-id');
            viewPlanDetails(planId);
        });
    });
}

// Setup admin functionality
function setupAdminFunctionality() {
    // This will be handled by the admin panel code
}

// Setup plans filtering
function setupPlansFiltering() {
    // Add filtering functionality if needed
}