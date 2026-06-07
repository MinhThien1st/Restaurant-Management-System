// =========================================================================
// HUIT Restaurant — Homepage Interaction Logic
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Components
    initHeroSlider();
    initTestimonialsSlider();
    initFaqAccordion();
    initReservationForm();
    initNewsletterForm();
    initInteractiveStory();
    
    // 2. Load Dynamic Featured Foods
    loadFeaturedFoods();

    // 3. Premium Visual Enhancements
    initScrollReveal();
    initScrollProgress();
    initBackToTop();
    initNavbarScroll();
    initCounterAnimation();
});

// =========================================================================
// 1. HERO SLIDER
// =========================================================================
function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dotsContainer = document.querySelector(".hero-slider-dots");
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    // Create dots dynamically
    slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.className = `hero-slider-dot ${index === 0 ? "active" : ""}`;
        dot.addEventListener("click", () => {
            goToSlide(index);
            resetInterval();
        });
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll(".hero-slider-dot");
    
    function goToSlide(n) {
        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function startInterval() {
        slideInterval = setInterval(nextSlide, 5000); // Change image every 5 seconds
    }
    
    function resetInterval() {
        clearInterval(slideInterval);
        startInterval();
    }
    
    startInterval();
}

// =========================================================================
// 2. TESTIMONIALS SLIDER
// =========================================================================
function initTestimonialsSlider() {
    const slides = document.querySelectorAll(".testimonial-slide");
    const prevBtn = document.getElementById("test-prev");
    const nextBtn = document.getElementById("test-next");
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let testimonialInterval;
    
    function goToSlide(n) {
        slides[currentSlide].classList.remove("active");
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add("active");
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevSlide();
            resetInterval();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            resetInterval();
        });
    }
    
    function startInterval() {
        testimonialInterval = setInterval(nextSlide, 7000); // Autoplay 7s
    }
    
    function resetInterval() {
        clearInterval(testimonialInterval);
        startInterval();
    }
    
    startInterval();
}

// =========================================================================
// 3. FAQ ACCORDION
// =========================================================================
function initFaqAccordion() {
    const faqHeaders = document.querySelectorAll(".faq-header");
    
    faqHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const body = item.querySelector(".faq-body");
            const isActive = item.classList.contains("active");
            
            // Close all other FAQ items first
            document.querySelectorAll(".faq-item").forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                    otherItem.querySelector(".faq-body").style.maxHeight = null;
                }
            });
            
            // Toggle current FAQ item
            if (isActive) {
                item.classList.remove("active");
                body.style.maxHeight = null;
            } else {
                item.classList.add("active");
                body.style.maxHeight = body.scrollHeight + "px";
            }
        });
    });
}

// =========================================================================
// 4. RESERVATION FORM
// =========================================================================
function initReservationForm() {
    const form = document.getElementById("reservation-form");
    if (!form) return;
    
    // Set min date of date picker to today
    const dateInput = document.getElementById("res-date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Bạn cần đăng nhập để đặt bàn trước.", "warning");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
            return;
        }

        const name = document.getElementById("res-name").value.trim();
        const phone = document.getElementById("res-phone").value.trim();
        const guests = parseInt(document.getElementById("res-guests").value, 10);
        const date = document.getElementById("res-date").value;
        const time = document.getElementById("res-time").value;
        const notes = document.getElementById("res-notes") ? document.getElementById("res-notes").value.trim() : "";
        
        // Validation
        if (!name || !phone || !guests || !date || !time) {
            showToast("Vui lòng điền đầy đủ các thông tin bắt buộc.", "warning");
            return;
        }
        
        // Vietnam Phone number check regex
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            showToast("Số điện thoại không đúng định dạng Việt Nam.", "error");
            return;
        }
        
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const result = await apiFetch("/reservations", {
                method: "POST",
                body: JSON.stringify({
                    customerName: name,
                    phone: phone,
                    email: user.email || "",
                    reserveDate: date,
                    reserveTime: time,
                    numGuests: guests,
                    note: notes
                })
            });

            if (result) {
                showToast("Đặt bàn thành công! Đã chuyển thông tin đặt bàn của bạn vào hồ sơ.", "success");
                form.reset();
                setTimeout(() => {
                    window.location.href = "profile.html";
                }, 1500);
            }
        } catch (error) {
            // Error toast is handled in apiFetch
        }
    });
}

// =========================================================================
// 5. NEWSLETTER FORM
// =========================================================================
function initNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    if (!form) return;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = form.querySelector("input[type='email']");
        const email = emailInput.value.trim();
        
        if (!email) {
            showToast("Vui lòng nhập địa chỉ email của bạn.", "warning");
            return;
        }
        
        // Email pattern check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast("Địa chỉ email không hợp lệ.", "error");
            return;
        }
        
        showToast("Đăng ký nhận tin thành công! Bạn sẽ nhận được các ưu đãi sớm nhất.", "success");
        emailInput.value = "";
    });
}

// =========================================================================
// 6. DYNAMIC FEATURED FOODS FROM API
// =========================================================================
async function loadFeaturedFoods() {
    const grid = document.getElementById("featured-foods-grid");
    if (!grid) return;
    
    const defaultFoodImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop";
    
    try {
        // Fetch foods from server
        // Using /foods endpoint to fetch all foods
        const foods = await apiFetch("/foods");
        
        if (!foods || foods.length === 0) {
            showNoFoodsMessage(grid);
            return;
        }
        
        // Select 4 items that have real image (preferably not fallback)
        // Or just take the first 4 foods from the list
        // Let's filter to pick foods with valid images if possible, otherwise take the first 4
        let featured = foods.filter(f => f.imageUrl && !f.imageUrl.includes("placeholder")).slice(0, 4);
        if (featured.length < 4) {
            featured = foods.slice(0, 4);
        }
        
        grid.innerHTML = "";
        
        featured.forEach(food => {
            const card = document.createElement("div");
            card.className = "card food-card";
            
            const imgUrl = food.imageUrl && food.imageUrl.trim() !== "" ? food.imageUrl : defaultFoodImage;
            const catName = food.category ? food.category.name : "Món ăn";
            
            card.innerHTML = `
                <div class="food-img-wrapper" style="cursor: pointer;" onclick="showFoodDetails(${food.id})">
                    <img src="${imgUrl}" alt="${food.name}">
                    <span class="food-badge">${catName}</span>
                </div>
                <div class="food-info">
                    <h3 class="food-title" style="cursor: pointer;" onclick="showFoodDetails(${food.id})">${food.name}</h3>
                    <p class="food-desc" title="${food.description || ''}">${food.description || 'Hương vị thơm ngon độc đáo từ những đầu bếp đẳng cấp.'}</p>
                    <div class="food-footer">
                        <div class="food-price">${formatCurrency(food.price)}</div>
                        <button onclick="addFeaturedToCart(${food.id})" class="btn btn-primary btn-sm">🛒 Thêm</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error("Error loading featured foods:", error);
        showErrorMessage(grid);
    }
}

function showNoFoodsMessage(grid) {
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
            <p>Món ăn đặc sắc sẽ sớm được ra mắt.</p>
        </div>
    `;
}

function showErrorMessage(grid) {
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-danger);">
            <p>Không thể kết nối máy chủ để tải danh sách món ăn nổi bật.</p>
        </div>
    `;
}

// Helper to Add to Cart from Homepage
async function addFeaturedToCart(foodId) {
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("Bạn cần đăng nhập để thêm vào giỏ hàng.", "warning");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
        return;
    }

    // Verify if user is admin
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "ADMIN") {
        showToast("Tài khoản ADMIN không dùng chức năng giỏ hàng.", "warning");
        return;
    }

    try {
        await apiFetch("/cart", {
            method: "POST",
            body: JSON.stringify({ foodId: foodId, quantity: 1 })
        });

        showToast("Đã thêm món vào giỏ hàng!", "success");
        updateCartBadge();
    } catch (error) {
        // Error toast is handled in apiFetch
    }
}

// =========================================================================
// 7. INTERACTIVE STORY
// =========================================================================
function initInteractiveStory() {
    const clickTarget = document.getElementById("story-click-target");
    const indicatorBtns = document.querySelectorAll(".story-indicator-btn");
    
    const displayImg = document.getElementById("story-display-img");
    const textContainer = document.getElementById("story-text-container");
    const badge = document.getElementById("story-dynamic-badge");
    
    const badgeIcon = document.getElementById("story-badge-icon");
    const badgeTitle = document.getElementById("story-badge-title");
    const badgeDesc = document.getElementById("story-badge-desc");
    
    const storyTitle = document.getElementById("story-title");
    const storyDesc = document.getElementById("story-desc");
    
    const stat1Val = document.getElementById("story-stat-1-val");
    const stat1Lbl = document.getElementById("story-stat-1-lbl");
    const stat2Val = document.getElementById("story-stat-2-val");
    const stat2Lbl = document.getElementById("story-stat-2-lbl");
    const stat3Val = document.getElementById("story-stat-3-val");
    const stat3Lbl = document.getElementById("story-stat-3-lbl");

    if (!clickTarget || !indicatorBtns.length) return;

    let currentStory = 0;
    
    const storyData = [
        {
            image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=600&auto=format&fit=crop",
            badgeIcon: "🏆",
            badgeTitle: "Nguyễn Hoàng Nam",
            badgeDesc: "Bếp Trưởng Điều Hành (Executive Chef)",
            title: "Hành trình kiến tạo <br><span>nghệ thuật ẩm thực</span>",
            paragraphs: `
                <p>Tại HUIT Restaurant, mỗi món ăn không đơn thuần là sự kết hợp của các nguyên liệu, mà là cả một công trình nghệ thuật được chắt chiu từ niềm đam mê, kỹ thuật thượng thừa và sự am hiểu sâu sắc về văn hóa ẩm thực thế giới.</p>
                <p>Chúng tôi tự hào kế thừa nét tinh hoa truyền thống của ẩm thực Việt Nam, kết hợp khéo léo với các xu hướng ẩm thực phương Tây hiện đại để mang đến những trải nghiệm độc đáo, khác biệt và đầy bất ngờ cho thực khách.</p>
            `,
            stats: [
                { val: "10+", lbl: "NĂM KINH NGHIỆM" },
                { val: "100+", lbl: "MÓN ĂN MẪU" },
                { val: "15k+", lbl: "KHÁCH HÀNG TIN YÊU" }
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop",
            badgeIcon: "🥬",
            badgeTitle: "Hữu Cơ & Tươi Sạch",
            badgeDesc: "Tiêu Chuẩn VietGAP & Organic 100%",
            title: "Triết lý tinh tuyển <br><span>nguyên liệu sạch</span>",
            paragraphs: `
                <p>Chúng tôi tin rằng món ăn hảo hạng bắt đầu từ nguyên liệu hoàn hảo. 100% rau xanh, củ quả tại HUIT Restaurant được nuôi trồng hữu cơ từ các nông trại sạch Đà Lạt đạt chuẩn VietGAP.</p>
                <p>Các loại thịt, hải sản đều được nhập mới mỗi sáng và kiểm tra nghiêm ngặt về độ tươi ngon trước khi đưa vào chế biến. Không hóa chất, không phụ gia độc hại, trọn vẹn hương vị tự nhiên tinh khiết.</p>
            `,
            stats: [
                { val: "100%", lbl: "NGUYÊN LIỆU SẠCH" },
                { val: "0", lbl: "PHỤ GIA ĐỘC HẠI" },
                { val: "50+", lbl: "ĐỐI TÁC NÔNG TRẠI" }
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            badgeIcon: "🤝",
            badgeTitle: "Dịch Vụ Tận Tâm",
            badgeDesc: "Trải Nghiệm Chuẩn 5 Sao Cao Cấp",
            title: "Sứ mệnh lan toả <br><span>ấm áp yêu thương</span>",
            paragraphs: `
                <p>Không chỉ là thưởng thức ẩm thực, HUIT Restaurant mong muốn mang đến một không gian kết nối ấm cúng cho mỗi gia đình, bạn bè và đối tác. Từng chi tiết nhỏ đều được chăm chút tỉ mỉ.</p>
                <p>Đội ngũ phục vụ tận tâm, lịch thiệp được đào tạo chuẩn quốc tế, luôn sẵn sàng lắng nghe và đem đến sự hài lòng tuyệt đối cho quý khách trong từng bữa ăn trọn vẹn tại nhà hàng.</p>
            `,
            stats: [
                { val: "5⭐", lbl: "TIÊU CHUẨN DỊCH VỤ" },
                { val: "100%", lbl: "KHÁCH HÀNG HÀI LÒNG" },
                { val: "30'", lbl: "GIAO HÀNG TẬN NƠI" }
            ]
        }
    ];

    function updateStory(index) {
        currentStory = index;
        const data = storyData[currentStory];

        // 1. Remove active state from indicators
        indicatorBtns.forEach((btn, i) => {
            btn.classList.toggle("active", i === currentStory);
        });

        // 2. Remove animation classes to reset animation
        displayImg.classList.remove("animate-story-img");
        textContainer.classList.remove("animate-story-text");
        badge.classList.remove("animate-story-badge");

        // Force reflow/repaint
        void displayImg.offsetWidth;
        void textContainer.offsetWidth;
        void badge.offsetWidth;

        // 3. Update Content
        displayImg.src = data.image;
        badgeIcon.textContent = data.badgeIcon;
        badgeTitle.textContent = data.badgeTitle;
        badgeDesc.textContent = data.badgeDesc;
        storyTitle.innerHTML = data.title;
        storyDesc.innerHTML = data.paragraphs;
        
        stat1Val.textContent = data.stats[0].val;
        stat1Lbl.textContent = data.stats[0].lbl;
        stat2Val.textContent = data.stats[1].val;
        stat2Lbl.textContent = data.stats[1].lbl;
        stat3Val.textContent = data.stats[2].val;
        stat3Lbl.textContent = data.stats[2].lbl;

        // 4. Add animation classes back to trigger beautiful entry animations
        displayImg.classList.add("animate-story-img");
        textContainer.classList.add("animate-story-text");
        badge.classList.add("animate-story-badge");
    }

    // Add click listeners to vertical indicators
    indicatorBtns.forEach((btn, i) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // Avoid triggering clickTarget handler
            updateStory(i);
        });
    });

    // Add click listener to the image wrapper itself (cycles through stories)
    clickTarget.addEventListener("click", () => {
        const next = (currentStory + 1) % storyData.length;
        updateStory(next);
    });
}

// =========================================================================
// 8. SCROLL REVEAL ANIMATIONS (Intersection Observer)
// =========================================================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    if (!revealElements.length) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.15
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Don't unobserve section-title-wrapper to keep the underline
                if (!entry.target.classList.contains('section-title-wrapper')) {
                    // Keep observing for potential re-triggers on stagger children
                }
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));
}

// =========================================================================
// 9. SCROLL PROGRESS BAR
// =========================================================================
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
}

// =========================================================================
// 10. BACK TO TOP BUTTON
// =========================================================================
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
}

// =========================================================================
// 11. NAVBAR SCROLL EFFECT
// =========================================================================
function initNavbarScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

// =========================================================================
// 12. COUNTER ANIMATION (Animate numbers when scrolled into view)
// =========================================================================
function initCounterAnimation() {
    const statItems = document.querySelectorAll('.story-stat-item h4');
    if (!statItems.length) return;
    
    let animated = false;
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statItems.forEach(el => {
                    animateCounter(el);
                });
            }
        });
    }, { threshold: 0.5 });
    
    const statsContainer = document.getElementById('story-stats-container');
    if (statsContainer) {
        counterObserver.observe(statsContainer);
    }
}

function animateCounter(el) {
    const text = el.textContent.trim();
    // Extract number and suffix (e.g., "10+" -> num=10, suffix="+")
    const match = text.match(/^(\d+)(.*)/);
    if (!match) return;
    
    const targetNum = parseInt(match[1], 10);
    const suffix = match[2] || '';
    const duration = 1500; // ms
    const startTime = performance.now();
    
    el.classList.add('counter-animated');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(eased * targetNum);
        
        el.textContent = currentVal + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = targetNum + suffix;
        }
    }
    
    requestAnimationFrame(update);
}
