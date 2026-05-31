// ==========================================
//       AUTHENTICATION & API LOGIC 
//  ==========================================
class AuthManager {
    constructor() {
        this.gorestToken = "ea943e6f511ccda4241a0bdcd6cfa831c1f5ef487e24c179402c4eece2e7c95a"; // API Gorest Public token
        this.apiUrl = "https://gorest.co.in/public/v2/users";
        this.resetEmailState = "";
        this.generatedOTP = "";
    }

    switchView(viewId) {
        const views = ['view-login', 'view-signup', 'view-forgot', 'view-otp', 'view-reset'];
        views.forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        this.clearMessages();
    }

    clearMessages() {
        const msgs = ['msg-login', 'msg-signup', 'msg-forgot', 'msg-otp', 'msg-reset'];
        msgs.forEach(id => document.getElementById(id).classList.add('hidden'));
    }

    showMessage(id, text, isSuccess = false) {
        const el = document.getElementById(id);
        el.innerText = text;
        el.className = `auth-message ${isSuccess ? 'success-msg' : 'error-msg'} fade-in block`;
    }

    async handleSignup(e) {
        e.preventDefault();

        const name = document.getElementById('reg-name').value.trim();
        const gender = document.getElementById('reg-gender').value;
        const mobile = document.getElementById('reg-mobile').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-pass').value;
        const pass2 = document.getElementById('reg-pass2').value;

        // Validations
        if (mobile.length !== 10) return this.showMessage('msg-signup', "Mobile number must be exactly 10 digits.");
        if (pass !== pass2) return this.showMessage('msg-signup', "Passwords do not match.");

        this.showMessage('msg-signup', "Registering User...", true);

        try {
            // Push to GoRest Database
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.gorestToken}`
                },
                body: JSON.stringify({
                    name,
                    gender,
                    email,
                    status: "active"
                })
            });
            const data = await response.json();

            if (data[0] && data[0].message === "has already been taken") {
                return this.showMessage('msg-signup', "Email already exists. Please try with another Email.");
            }

            const userObj = {
                name,
                email,
                mobile,
                password: pass
            };
            localStorage.setItem(email, JSON.stringify(userObj));

            this.showMessage('msg-signup', "Success! Please Login.", true);
            setTimeout(() => this.switchView('view-login'), 1500);
        } catch (err) {
            this.showMessage('msg-signup', "Network Error. Try again.");
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('log-email').value.trim();
        const pass = document.getElementById('log-pass').value;

        if (email.toLowerCase() === 'admin@gmail.com' && pass === '1234') {
            this.startSession('Admin');
            return;
        }

        const savedUserStr = localStorage.getItem(email);
        if (savedUserStr) {
            const user = JSON.parse(savedUserStr);
            if (user.password === pass) {
                this.startSession(user.name);
                return;
            }
        }
        this.showMessage('msg-login', "Invalid Email or Password");
    }

    handleForgot(e) {
        e.preventDefault();
        const email = document.getElementById('for-email').value.trim();

        if (!localStorage.getItem(email)) {
            return this.showMessage('msg-forgot', "Email not found in database.");
        }

        this.generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        this.resetEmailState = email;

        alert(`🔔 OTP NOTIFICATION:\n\nYour OTP is: ${this.generatedOTP}\n\n(Simulating email sent to ${email})`);
        this.switchView('view-otp');
    }

    handleVerifyOTP(e) {
        e.preventDefault();
        const inputOtp = document.getElementById('otp-input').value.trim();

        if (inputOtp === this.generatedOTP) {
            this.switchView('view-reset');
        } else {
            this.showMessage('msg-otp', "Incorrect OTP. Try again.");
        }
    }

    handleResetPass(e) {
        e.preventDefault();
        const pass1 = document.getElementById('new-pass').value;
        const pass2 = document.getElementById('new-pass2').value;

        if (pass1 !== pass2) return this.showMessage('msg-reset', "Passwords do not match.");

        let user = JSON.parse(localStorage.getItem(this.resetEmailState));
        user.password = pass1;
        localStorage.setItem(this.resetEmailState, JSON.stringify(user));

        this.showMessage('msg-reset', "Password changed! Redirecting...", true);
        setTimeout(() => this.switchView('view-login'), 1500);
    }

    // SESSION HANDLING
    startSession(name) {
        localStorage.setItem('activePilgrimSession', name);
        document.getElementById('auth-wrapper').classList.add('hidden');
        document.getElementById('website-view').classList.remove('hidden');
        document.getElementById('website-view').classList.add('flex');
        document.getElementById('nav-user-name').innerText = name.charAt(0).toUpperCase();

        renderNavbar();
        renderContent('home');
    }

    logout() {
        localStorage.removeItem('activePilgrimSession');
        document.getElementById('website-view').classList.add('hidden');
        document.getElementById('website-view').classList.remove('flex');
        document.getElementById('auth-wrapper').classList.remove('hidden');
        this.switchView('view-login');
        document.getElementById('form-login').reset();
    }
}

const authManager = new AuthManager();

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById('form-signup')
        .addEventListener('submit', (e) => authManager.handleSignup(e));

    document.getElementById('form-login')
        .addEventListener('submit', (e) => authManager.handleLogin(e));

    document.getElementById('form-forgot')
        .addEventListener('submit', (e) => authManager.handleForgot(e));

    document.getElementById('form-otp')
        .addEventListener('submit', (e) => authManager.handleVerifyOTP(e));

    document.getElementById('form-reset')
        .addEventListener('submit', (e) => authManager.handleResetPass(e));

    // Restore session if active
    const activeSession = localStorage.getItem('activePilgrimSession');
    if (activeSession) {
        authManager.startSession(activeSession);
    }

});

function switchAuthView(viewId) {
    authManager.switchView(viewId);
}

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.innerText = "🔒";
    } else {
        input.type = "password";
        icon.innerText = "👁️";
    }
}


/**
 * =========================================================================
 * 2. YOUR EXACT WEBSITE CODE (UNCHANGED)
 * =========================================================================
 */

// Application State
const appState = {
    currentView: 'home',
    selectedTemple: 'Tirupati',
    userBudget: 0
};

const templeData = {
    Tirupati: {
        name: "Tirumala Tirupati",
        description: "The spiritual capital of Andhra Pradesh, visited by millions annually.",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/1200px-Tirumala_090615.jpg",
            "https://i.pinimg.com/736x/61/03/3b/61033bca53e52525f5a55afd98014f93.jpg",
            "https://wallpapers.com/images/hd/lord-venkateswara-4k-with-lakshmi-and-bhumi-omi0tpe8n9moi1vb.jpg"

        ],
        timings: {
            bestTime: "September to February (Pleasant weather)",
            dailyOpen: "02:30 AM",
            dailyClose: "11:00 PM",
            darshanSlots: ["Free Darshan (10+ hrs wait)", "Special Entry ₹300 (2-3 hrs wait)"]
        },
        tickets: {
            method: "Online Booking Required 3 months in advance.",
            url: "https://ttdevasthanams.ap.gov.in",
            tips: ["Book exactly at 10 AM on release date", "Carry Aadhar Card", "Wear Traditional Dress"]
        },
        accommodation: [{
                type: "Free",
                name: "Tirumala Choultries",
                cost: 0,
                desc: "Basic amenities, first come first serve locker system."
            },
            {
                type: "Budget",
                name: "TTD Guest Houses",
                cost: 500,
                desc: "Clean, simple rooms near temple complex."
            },
            {
                type: "Luxury",
                name: "Private Hotels (Tirupati)",
                cost: 3000,
                desc: "AC, WiFi, Room Service (Located Downhill)."
            }
        ],
        food: [{
                item: "Laddu Prasadam",
                type: "Must Try",
                desc: "World famous sweet offered to the deity."
            },
            {
                item: "Annaprasadam",
                type: "Free Meal",
                desc: "Hygienic free meals provided by temple trust 24/7."
            },
            {
                item: "Pulihora",
                type: "Local",
                desc: "Tamarind rice available at various counters."
            }
        ],
        nearbyPlaces: [{
                name: "Akasaganga Teertham",
                dist: "3km",
                transport: "Free Dharma Ratha Bus",
                open: "06:00 AM - 06:00 PM",
                image: "https://www.taxiintirupati.com/images/visit-places/akasha-ganga.jpg"
            },
            {
                name: "Silathoranam",
                dist: "1km",
                transport: "Walk / Jeep",
                open: "08:00 AM - 06:00 PM",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Natural_stone_arch_in_tirumala.JPG/500px-Natural_stone_arch_in_tirumala.JPG"
            },
            {
                name: "Papavinasanam",
                dist: "5km",
                transport: "Taxi / Bus",
                open: "06:00 AM - 06:00 PM",
                image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw0NEAcNDQ0IDQ0ICAoICAgICA8ICQcNIBEWIiARExMkKDQsJCYxJx8fLTEtMTU3Ojo6IyszODM4NzQtOisBCgoKDg0NDw0NDysZFSUtNysrKys3LSsrNysrLSstKysrKysrKysrKysrLSsrKysrKysrKy0rKysrKystKys3K//AABEIAJsAzwMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAACBQEGB//EAFQQAAECAwMGCAoFCQUGBwAAAAIBAwAEEhETIgUhIzJCUhQxM0FRYnKRBkNhcYGCkrHB8FNjk6GiJDRzg7LC0eHxFWR0o/MHRLPT4vIWNVSElMPS/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAcEQEBAQACAwEAAAAAAAAAAAAAARESIQJBUYH/2gAMAwEAAhEDEQA/AMVlwbMOGHmFpXW1+pGUJUq4MFR1S6sVhti/ZRr2hqY41y8JJsUW8mH9I25t6OPKBM5sRfrIupdarlOzEH0CV8OLpoANg3Hm68Tk3+3mjTyX4T8KVFJZWWBHMYTExpQss4tXjtVPJZHzFpakjlS7tXoi4a+vyXhAwZ8H1Ss4jPZoRa1/rGm3Ngq0WkhWYEPR3o7w9MfHcl5S4ObLlIGrF5+TlyLttusHpjakPDSYZvq0GYv7u4MtHwbqCHR3QxeT6pbHY8PK+G/IXoMafcco4N3/AMY9NIZVl3xAgdbz7BGFXHEaaUSK2/NkWgJEiRICRIkSAkSJEgJEiRICRIkSAkSJHLYDscVfPAzcQUNSWxB4yOPMZZ8IBVbttRQbc7p7ap0QHxoTK3VgizLW1rblEJJM04YZZNCrKyq81zhrAguiuEaB/wCH5ILfU0D/AKfsQs0QbIgPbhhVAvPEtRcho1Siqb0LtHr4qv8AhwwAkMalAkXtw0L5W4hiKFWrFFCnZqjWxMNNuDa5VGtkXK6y7qvBQtujoe1XepGCVUXQi0cSyLK+kynhq0pgptUXgAB0O3nsdKedBj2EvMA4NYEJD0gtcfE5Z4hxVRrZJyrMS+No00d5gsw1rmrMOmyJY3K+vRI83kDwiGZvAdVsDbS8q1G/fG8LwKtiECr0CdcRRokLzEyDQ1uEiDvRizmX2gNgUdZFste0Lx2rcozWc2eA9FHFjPHKbFRgrjI0bRvCgu258K2xSbn5akkJ+Wz7ITYITkBp2xxFjxX/AIluzAWgM2tu8mNvq22/GG{TRUNCATED}Q3R-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"
            }
        ]
    },

    Madurai: {
        name: "Meenakshi Amman Temple",
        description: "Historic temple dedicated to Goddess Meenakshi in Tamil Nadu.",
        images: [
            "https://i.pinimg.com/736x/fb/76/d3/fb76d3ece5b52c30e81728de0d810b9a.jpg",
            "https://plus.unsplash.com/premium_photo-1697729444936-8c6a6f643312?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFkdXJhaSUyMHRlbXBsZXxlbnwwfHwwfHx8MA%3D%3D",
            "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/c7/72/4e/madurai-meenakshi-temple.jpg?w=1200&h=-1&s=1"
        ],
        timings: {
            bestTime: "October to March",
            dailyOpen: "05:00 AM",
            dailyClose: "10:00 PM",
            darshanSlots: ["Free Darshan", "Special Darshan ₹100"]
        },
        tickets: {
            method: "Available at temple counter & online.",
            url: "https://www.maduraimeenakshi.org",
            tips: ["Visit early morning", "Avoid festival rush"]
        },
        accommodation: [{
            type: "Budget",
            name: "Temple Guest Rooms",
            cost: 700,
            desc: "Affordable stay near temple."
        }],
        food: [{
            item: "Pongal",
            type: "Local",
            desc: "Traditional South Indian breakfast."
        }],
        nearbyPlaces: [{
            name: "Thirumalai Nayakar Palace",
            dist: "2km",
            transport: "Auto / Taxi",
            open: "09:00 AM - 05:00 PM",
            image: "https://upload.wikimedia.org/wikipedia/commons/8/83/Ruins_of_Thirumalai_Nayak_palace_in_Madurai_%281%29.jpg"
        }]
    },

    Varanasi: {
        name: "Kashi Vishwanath Temple",
        description: "One of the 12 Jyotirlingas located in Varanasi.",
        images: [
            "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoLQDyRdJwWaVm_glQCELQESrWRyzQeNXCGMMuaQoBijQ99q8XtGcj16TNDbbXdiAcJfsaZ5YmliCVsQI8xIrmeaWU3uv9vlUIp0BI9PUZin3zqMnPgoumOstIPA2nD7qFW_l4T7kNvq-s=w810-h468-n-k-no",
            "https://cdn.vayaadventures.com/wp-content/uploads/iStock-1164329797-Varanasi-1-e1705171841552.jpg",
            "https://qph.cf2.quoracdn.net/main-qimg-cecfa9e6c8db2671f9b7fcf12a826826-lq"
        ],
        timings: {
            bestTime: "November to February",
            dailyOpen: "03:00 AM",
            dailyClose: "11:00 PM",
            darshanSlots: ["Mangala Aarti", "General Darshan"]
        },
        tickets: {
            method: "Online & Offline booking available.",
            url: "https://www.shrikashivishwanath.org",
            tips: ["Book Aarti in advance", "Keep ID proof"]
        },
        accommodation: [{
            type: "Budget",
            name: "Dharamshalas",
            cost: 500,
            desc: "Basic pilgrim accommodation."
        }],
        food: [{
            item: "Kachori Sabzi",
            type: "Must Try",
            desc: "Popular Varanasi breakfast."
        }],
        nearbyPlaces: [{
            name: "Dashashwamedh Ghat",
            dist: "500m",
            transport: "Walk",
            open: "Open 24 Hours",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1srbA-yr-cuQPgr75ZW1yZrb7MYmYnoFFNw&s"
        }]
    }
};


class TempleService {
    constructor() {
        this.baseUrl = "https://api.templeguide.com";
    }

    async getDetails(templeName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(templeData[templeName]);
            }, 600);
        });
    }
}

const service = new TempleService();

const navItems = [{
        id: 'home',
        label: 'Home'
    },
    {
        id: 'timings',
        label: 'Timings & Best Time'
    },
    {
        id: 'tickets',
        label: 'Book Tickets'
    },
    {
        id: 'rooms',
        label: 'Accommodation'
    },
    {
        id: 'food',
        label: 'Food Guide'
    },
    {
        id: 'nearby',
        label: 'Nearby Places'
    },
    {
        id: 'budget',
        label: 'Budget Calculator'
    }
];

const renderNavbar = () => {
    const navContainer = document.getElementById('main-navbar');
    const mobileMenu = document.getElementById('mobile-menu');

    const linksHtml = navItems.map(item => `
        <li class="list-none flex items-center">
            <a href="#" 
               onclick="handleNavClick(event, '${item.id}')"
               class="nav-link py-2 px-1 block text-center whitespace-nowrap text-white">
               ${item.label}
            </a>
        </li>
    `).join('');

    navContainer.innerHTML = linksHtml;
    mobileMenu.innerHTML = `<ul class="space-y-2 flex flex-col">${linksHtml}</ul>`;
};

function handleNavClick(event, viewId) {
    if (event) event.preventDefault();

    document.getElementById('mobile-menu').classList.add('hidden');

    appState.currentView = viewId;
    renderContent(viewId);
}

async function renderContent(viewId) {
    const container = document.getElementById('app-container');

    if (typeof carouselInterval !== 'undefined' && carouselInterval) clearInterval(carouselInterval);

    container.innerHTML = `
        <div class="loader-wrapper flex flex-col justify-center items-center h-64">
            <div class="loader"></div>
            <h2 class="loader-text">Loading sacred guide...</h2>
        </div>`;

    const data = await service.getDetails(appState.selectedTemple);

    let contentHtml = '';

    switch (viewId) {
        case 'home':
            contentHtml = `
                <div class="text-center fade-in home-view-layout">
                    <h2 class="temple-primary-title">${data.name}</h2>
                    <p class="temple-primary-desc">${data.description}</p>
                    
                    <div class="carousel-container relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl group">
                        <div id="carousel-slides" class="w-full h-full relative">
                            ${data.images.map((img, index) => `
                                <div class="slide absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}">
                                    <img src="${img}" alt="Temple View ${index + 1}" class="w-full h-full object-cover">
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="changeSlide(-1)" class="carousel-btn prev-btn" aria-label="Previous Slide">&#10094;</button>
                        <button onclick="changeSlide(1)" class="carousel-btn next-btn" aria-label="Next Slide">&#10095;</button>
                    </div>
                    
                    <div class="quick-status-grid">
                        <div class="status-card border-orange">
                            <h3 class="status-card-title">Today's Timings</h3>
                            <p class="status-card-value">${data.timings.dailyOpen} - ${data.timings.dailyClose}</p>
                        </div>
                        <div class="status-card border-green">
                            <h3 class="status-card-title">Darshan Status</h3>
                            <p class="status-card-value">Special Entry Available</p>
                        </div>
                        <div class="status-card border-blue">
                            <h3 class="status-card-title">Weather</h3>
                            <p class="status-card-value">24°C, Pleasant</p>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(startCarousel, 100);
            break;

        case 'timings':
            contentHtml = `
                <div class="max-w-3xl mx-auto bg-card-glow p-8 rounded-xl shadow-lg fade-in card-view-layout">
                    <h2 class="view-section-title">Timings & Best Time to Visit</h2>
                    <div class="space-y-6 flex flex-col gap-6">
                        <div class="timing-info-row">
                            <div class="info-icon saffron-bg">📅</div>
                            <div>
                                <h4 class="info-title">Seasonal Advice</h4>
                                <p class="info-desc">${data.timings.bestTime}</p>
                            </div>
                        </div>
                        <div class="timing-info-row">
                            <div class="info-icon saffron-bg">⏰</div>
                            <div>
                                <h4 class="info-title">Daily Schedule</h4>
                                <p class="info-desc"><strong>Opens:</strong> ${data.timings.dailyOpen}</p>
                                <p class="info-desc"><strong>Closes:</strong> ${data.timings.dailyClose}</p>
                            </div>
                        </div>
                        <div class="darshan-info-box">
                            <h4 class="darshan-box-title">Available Darshan Types</h4>
                            <ul class="darshan-list">
                                ${data.timings.darshanSlots.map(slot => `<li>${slot}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'tickets':
            contentHtml = `
                <div class="max-w-3xl mx-auto bg-card-glow p-8 rounded-xl shadow-lg fade-in card-view-layout">
                    <h2 class="view-section-title">Booking Tickets</h2>
                    <div class="booking-notice-warning">
                        <p class="notice-text">⚠️ <strong>Important Note:</strong> ${data.tickets.method}</p>
                    </div>
                    <h3 class="info-subtitle">Bespoke Tips & Guidelines:</h3>
                    <ul class="guidelines-list">
                        ${data.tickets.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                    <a href="${data.tickets.url}" target="_blank" rel="noopener" class="btn btn-primary block w-full text-center py-3 font-bold shadow-md go-official-btn">
                        Go to Official Booking Portal
                    </a>
                </div>
            `;
            break;

        case 'rooms':
            contentHtml = `
                <div class="fade-in card-view-layout">
                    <h2 class="view-section-title text-center">Accommodation Options</h2>
                    <div class="rooms-grid">
                        ${data.accommodation.map(room => `
                            <div class="room-card flex flex-col">
                                <div class="room-avatar">🛏️</div>
                                <div class="room-body flex-grow">
                                    <div class="room-title-row">
                                        <h3 class="room-name">${room.name}</h3>
                                        <span class="room-badge">${room.type}</span>
                                    </div>
                                    <p class="room-desc">${room.desc}</p>
                                </div>
                                <div class="room-footer border-t">
                                    <span class="room-price">₹${room.cost}<span class="price-suffix">/day</span></span>
                                    <button class="room-details-btn">Details &rarr;</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;

        case 'food':
            contentHtml = `
                <div class="max-w-4xl mx-auto fade-in card-view-layout">
                    <h2 class="view-section-title text-center">Best Food & Prasadam Guide</h2>
                    <div class="food-grid">
                        ${data.food.map(f => `
                            <div class="food-card">
                                <div class="food-icon">🍛</div>
                                <div class="food-body">
                                    <h4 class="food-item-title">${f.item}</h4>
                                    <p class="food-item-desc">${f.desc}</p>
                                    <span class="food-item-type">${f.type}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;

        case 'nearby':
            contentHtml = `
                <div class="space-y-6 fade-in max-w-4xl mx-auto card-view-layout">
                    <h2 class="view-section-title text-center">Nearby Spiritual Attractions</h2>
                    <div class="notice-info-box">
                        <p>Explore these beautiful places easily without a personal guide.</p>
                    </div>
                    <div class="attractions-list">
                        ${data.nearbyPlaces.map(place => `
                            <div class="attraction-card">
                                <img src="${place.image}" alt="${place.name}" class="attraction-img">
                                <div class="attraction-body flex-grow">
                                    <h3 class="attraction-name">${place.name}</h3>
                                    <p class="attraction-dist">Distance from temple: <strong>${place.dist}</strong></p>
                                </div>
                                <div class="attraction-info-badges">
                                    <div class="badge badge-open">
                                        <span class="badge-label">Hours</span>
                                        <strong>${place.open}</strong>
                                    </div>
                                    <div class="badge badge-transit">
                                        <span class="badge-label">Transport</span>
                                        <strong>${place.transport}</strong>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;

        case 'budget':
            contentHtml = `
                <div class="max-w-xl mx-auto bg-card-glow p-8 rounded-xl shadow-lg fade-in card-view-layout">
                    <h2 class="view-section-title budget-title">
                        <span>💰</span> Smart Trip Budget Estimator
                    </h2>
                    
                    <form id="budget-form" onsubmit="calculateBudget(event)" class="space-y-5 budget-form">
                        <div class="form-group">
                            <label for="people">Number of People</label>
                            <input type="number" id="people" required min="1" value="1">
                        </div>
                        
                        <div class="form-group">
                            <label for="transport">Transport Cost (Round trip per person)</label>
                            <input type="number" id="transport" placeholder="e.g., 1500" min="0">
                        </div>
                        
                        <div class="form-group">
                            <label for="acc-type">Accommodation Type</label>
                            <select id="acc-type">
                                <option value="0">Free (Choultries)</option>
                                <option value="500">Budget (₹500/day)</option>
                                <option value="3000">Luxury (₹3000/day)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="days">Days of Stay</label>
                            <input type="number" id="days" value="1" min="1">
                        </div>
                        
                        <button type="submit" class="btn btn-success block w-full py-3 font-bold shadow-md budget-calc-btn">
                            Calculate Total Cost
                        </button>
                    </form>

                    <div id="budget-result" class="hidden budget-result-box fade-in">
                        <p class="budget-result-label">Estimated Total Cost</p>
                        <p class="budget-result-value" id="total-cost">₹0</p>
                        <p class="budget-result-footnote">*Includes estimated food cost of ₹300/person/day</p>
                    </div>
                </div>
            `;
            break;
    }

    container.innerHTML = contentHtml;
}

// ==========================================
//       Budget Calculation Logic
// ==========================================
function calculateBudget(event) {
    event.preventDefault();

    const people = parseInt(document.getElementById('people').value) || 0;
    const transport = parseInt(document.getElementById('transport').value) || 0;
    const roomCost = parseInt(document.getElementById('acc-type').value) || 0;
    const days = parseInt(document.getElementById('days').value) || 0;

    const foodCostPerDay = 300;

    const totalTransport = transport * people;
    const roomsNeeded = Math.ceil(people / 2);
    const totalRoom = roomCost * days * roomsNeeded;
    const totalFood = foodCostPerDay * people * days;

    const total = totalTransport + totalRoom + totalFood;

    const resultDiv = document.getElementById('budget-result');
    const costText = document.getElementById('total-cost');

    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('fade-in');
    costText.innerText = `₹${total.toLocaleString("en-IN")}`;
}

function changeTemple(templeName) {
    appState.selectedTemple = templeName;
    
    // Sync header dropdowns if mobile or desktop
    const selects = ['temple-select'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = templeName;
    });

    appState.currentView = 'home';
    renderContent('home');
}

// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const menu = document.getElementById('mobile-menu');
            if (menu) menu.classList.toggle('hidden');
        });
    }
});

// ==========================================
// CAROUSEL LOGIC
// ==========================================
let carouselInterval = null;
let currentSlideIndex = 0;

function startCarousel() {
    currentSlideIndex = 0;
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        changeSlide(1);
    }, 3000);
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    slides[currentSlideIndex].classList.remove('opacity-100');
    slides[currentSlideIndex].classList.add('opacity-0');

    currentSlideIndex += direction;

    if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;

    slides[currentSlideIndex].classList.remove('opacity-0');
    slides[currentSlideIndex].classList.add('opacity-100');

    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => changeSlide(1), 3000);
}
