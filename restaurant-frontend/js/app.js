const API_BASE = "http://localhost:8080/api";

// Progress bar control
function showProgress(percent) {
    let progress = document.getElementById("page-load-progress");
    if (!progress) {
        progress = document.createElement("div");
        progress.id = "page-load-progress";
        progress.className = "load-progress";
        document.body.appendChild(progress);
    }
    progress.style.transform = `scaleX(${percent / 100})`;
    if (percent >= 100) {
        setTimeout(() => {
            progress.style.transform = "scaleX(0)";
        }, 400);
    }
}

// API Fetch Helper
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    showProgress(30);

    try {
        showProgress(60);
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            showProgress(100);
            showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "error");
            logout();
            return null;
        }

        const data = await response.json();
        
        if (!response.ok) {
            showProgress(100);
            const msg = data.message || "Đã xảy ra lỗi hệ thống.";
            // Handle stale token: user was deleted or DB was reset
            if (msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("không tìm thấy user")) {
                showToast("Tài khoản không tồn tại. Đang đăng xuất...", "error");
                setTimeout(() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "login.html";
                }, 1500);
                return null;
            }
            throw new Error(msg);
        }
        
        showProgress(100);
        return data;
    } catch (error) {
        showProgress(100);
        console.error("API Error:", error);
        if (error.message && !error.message.includes("Tài khoản không tồn tại")) {
            showToast(error.message, "error");
        }
        throw error;
    }
}

// Check Auth state & Update Navbar
function initNavbar() {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    const navActions = document.getElementById("nav-actions");
    const navLinks = document.getElementById("nav-links");

    if (!navActions) return;

    if (token && userJson) {
        const user = JSON.parse(userJson);
        const isAdmin = user.role === "ADMIN";

        // Dynamic links
        let linksHtml = `
            <li><a href="index.html" id="nav-home">Trang Chủ</a></li>
            <li><a href="menu.html" id="nav-menu">Thực Đơn</a></li>
        `;
        if (isAdmin) {
            linksHtml += `<li><a href="admin.html" id="nav-admin">Quản Trị (Dashboard)</a></li>`;
        } else {
            linksHtml += `<li><a href="orders.html" id="nav-orders">Đơn Mua</a></li>`;
        }
        linksHtml += `<li><a href="profile.html" id="nav-profile">Hồ Sơ</a></li>`;
        navLinks.innerHTML = linksHtml;

        // Dynamic actions
        const avatarHtml = user.avatarUrl 
            ? `<img src="${user.avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-orange); box-shadow: 0 2px 8px rgba(0,0,0,0.15);" alt="avatar">` 
            : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">${user.fullName.charAt(0).toUpperCase()}</div>`;

        navActions.innerHTML = `
            ${!isAdmin ? `
            <a href="cart.html" class="cart-icon-btn">
                <i data-lucide="shopping-cart" style="width: 18px; height: 18px;"></i>
                <span class="cart-badge" id="cart-badge-count">0</span>
            </a>` : ''}
            <div style="display: flex; align-items: center; gap: 1rem;">
                <a href="profile.html" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit;">
                    ${avatarHtml}
                    <span style="font-weight: 600; font-size: 0.92rem; color: var(--text-secondary);">
                        Hi, <strong style="color: var(--text-primary);">${user.fullName}</strong>
                    </span>
                </a>
                <button onclick="logout()" class="btn btn-secondary btn-sm">Đăng xuất</button>
            </div>
        `;

        if (!isAdmin) {
            updateCartBadge();
        }
    } else {
        navLinks.innerHTML = `
            <li><a href="index.html" id="nav-home">Trang Chủ</a></li>
            <li><a href="menu.html" id="nav-menu">Thực Đơn</a></li>
        `;
        navActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary btn-sm">Đăng Nhập</a>
            <a href="register.html" class="btn btn-primary btn-sm">Đăng Ký</a>
        `;
    }

    // Set Active class on navbar links based on path
    const path = window.location.pathname.split("/").pop();
    const linkIdMap = {
        "index.html": "nav-home",
        "": "nav-home",
        "menu.html": "nav-menu",
        "orders.html": "nav-orders",
        "admin.html": "nav-admin",
        "profile.html": "nav-profile"
    };
    const activeId = linkIdMap[path];
    if (activeId) {
        const activeLink = document.getElementById(activeId);
        if (activeLink) activeLink.classList.add("active");
    }
}

// Update Cart Count
async function updateCartBadge() {
    const badge = document.getElementById("cart-badge-count");
    if (!badge) return;

    try {
        const cartItems = await apiFetch("/cart");
        if (cartItems) {
            const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalQty;
            badge.style.display = totalQty > 0 ? "flex" : "none";
        }
    } catch (e) {
        badge.style.display = "none";
    }
}

// Log out function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Đã đăng xuất thành công.", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 800);
}

// Toast utility
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = '<i data-lucide="check-circle" style="color: var(--color-success); width: 18px; height: 18px;"></i>';
    if (type === "error") icon = '<i data-lucide="alert-triangle" style="color: var(--color-danger); width: 18px; height: 18px;"></i>';
    if (type === "warning") icon = '<i data-lucide="alert-circle" style="color: var(--color-warning); width: 18px; height: 18px;"></i>';

    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Animate in
    setTimeout(() => toast.classList.add("active"), 10);

    // Remove toast
    setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Currency Formatter
function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

// Date Formatter
function formatDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

// Init navbar on DOM content loaded
document.addEventListener("DOMContentLoaded", initNavbar);

// =========================================================================
// FOOD DETAILS MODAL GLOBAL UTILITY
// =========================================================================
let currentDetailQty = 1;

async function showFoodDetails(foodId) {
    // 1. Ensure modal container exists in DOM
    let modal = document.getElementById("global-food-detail-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "global-food-detail-modal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; padding: 2.5rem; border-radius: var(--radius-lg);">
                <button class="modal-close" onclick="closeFoodDetailModal()">&times;</button>
                <div id="global-food-detail-modal-body">
                    <!-- Loaded dynamically -->
                    <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">Đang tải chi tiết...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on clicking outside the content box
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeFoodDetailModal();
            }
        });
    }

    // Reset qty
    currentDetailQty = 1;

    // Show modal container (with spinner)
    modal.classList.add("active");

    try {
        // Fetch specific food by ID
        const food = await apiFetch(`/foods/${foodId}`);
        if (!food) {
            closeFoodDetailModal();
            return;
        }

        const defaultFoodImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop";
        const imgUrl = food.imageUrl && food.imageUrl.trim() !== "" ? food.imageUrl : defaultFoodImage;
        const catName = food.category ? food.category.name : "Món ăn";

        const token = localStorage.getItem("token");
        let reviewFormHtml = "";
        if (token) {
            reviewFormHtml = `
                <div id="add-review-container" style="margin-bottom: 2rem; background: #f9fafb; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h4 style="font-weight: 600; margin-bottom: 1rem; font-size: 0.95rem;">Viết đánh giá của bạn</h4>
                    <form id="submit-review-form" onsubmit="submitReview(event, ${food.id})">
                        <div style="display:flex; align-items:center; gap: 0.5rem; margin-bottom: 1rem;">
                            <span style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">Đánh giá sao:</span>
                            <div class="star-rating-input" style="display:flex; gap:0.25rem; font-size:1.5rem; color: var(--accent-gold); cursor:pointer;">
                                <span class="star-input-btn" onclick="setRatingValue(1)" onmouseover="highlightStars(1)" onmouseout="resetStars()">★</span>
                                <span class="star-input-btn" onclick="setRatingValue(2)" onmouseover="highlightStars(2)" onmouseout="resetStars()">★</span>
                                <span class="star-input-btn" onclick="setRatingValue(3)" onmouseover="highlightStars(3)" onmouseout="resetStars()">★</span>
                                <span class="star-input-btn" onclick="setRatingValue(4)" onmouseover="highlightStars(4)" onmouseout="resetStars()">★</span>
                                <span class="star-input-btn" onclick="setRatingValue(5)" onmouseover="highlightStars(5)" onmouseout="resetStars()">★</span>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <textarea id="review-comment" class="form-control" rows="2" placeholder="Chia sẻ cảm nhận của bạn về hương vị món ăn..." required style="font-size:0.9rem;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-sm" style="padding:0.5rem 1.25rem;">Gửi đánh giá</button>
                    </form>
                </div>
            `;
        } else {
            reviewFormHtml = `
                <div style="text-align: center; padding: 1.5rem; background: #f9fafb; border-radius: var(--radius-md); border: 1px dashed var(--border-color); font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 2rem;">
                    Bạn cần <a href="login.html" style="color:var(--accent-orange); font-weight:600;">đăng nhập</a> để gửi đánh giá món ăn.
                </div>
            `;
        }

        const body = document.getElementById("global-food-detail-modal-body");
        body.innerHTML = `
            <div class="food-detail-grid">
                <div class="food-detail-img-wrapper">
                    <img src="${imgUrl}" alt="${food.name}">
                </div>
                <div class="food-detail-info">
                    <div>
                        <span class="food-badge" style="position: static; margin-bottom: 0.5rem; display: inline-block;">${catName}</span>
                        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.8rem; color: var(--text-primary); line-height: 1.25;">${food.name}</h2>
                        <div class="food-detail-meta">
                            <span class="food-detail-tag"><i data-lucide="sprout" style="width: 14px; height: 14px; color: var(--accent-orange);"></i> 100% Hữu cơ</span>
                            <span class="food-detail-tag"><i data-lucide="flame" style="width: 14px; height: 14px; color: var(--accent-orange);"></i> Phục vụ nóng</span>
                            <span class="food-detail-tag"><i data-lucide="clock" style="width: 14px; height: 14px; color: var(--accent-orange);"></i> 15 phút</span>
                        </div>
                        <p style="color: var(--text-secondary); margin-top: 1.25rem; font-size: 0.95rem; line-height: 1.6;">${food.description || 'Hương vị thơm ngon độc đáo được lựa chọn kỹ lưỡng và chế biến nghệ thuật bởi các đầu bếp đẳng cấp của HUIT Restaurant.'}</p>
                    </div>
                    
                    <div>
                        <div style="font-size: 1.8rem; font-weight: 800; color: var(--accent-orange); margin-top: 1.5rem;" id="detail-price-display">
                            ${formatCurrency(food.price)}
                        </div>
                        <div class="food-detail-qty-wrapper">
                            <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-secondary);">Số lượng:</div>
                            <div class="cart-item-qty" style="margin: 0; gap: 0.75rem;">
                                <button class="qty-btn" onclick="adjustDetailQty(-1)">&minus;</button>
                                <span class="qty-val" id="detail-qty-val" style="font-size: 1rem; width: 24px; text-align: center;">1</span>
                                <button class="qty-btn" onclick="adjustDetailQty(1)">&plus;</button>
                            </div>
                        </div>
                        <button onclick="submitDetailAddToCart(${food.id})" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 0.85rem; font-weight: 700; gap: 0.6rem;">
                            🛒 Thêm Vào Giỏ Hàng
                        </button>
                    </div>
                </div>
            </div>
            
            <hr style="border:0; border-top:1px solid var(--border-color); margin: 2rem 0;">
            
            <!-- Reviews section -->
            <div class="food-reviews-section">
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">Khách Hàng Đánh Giá</h3>
                ${reviewFormHtml}
                <div id="modal-reviews-list">
                    <div style="text-align: center; padding: 1rem; color: var(--text-secondary);">Đang tải đánh giá...</div>
                </div>
            </div>
        `;
        
        currentRatingValue = 5;
        window.setRatingValue(5);
        loadModalReviews(food.id);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (e) {
        console.error("Error showing food details", e);
        closeFoodDetailModal();
    }
}

function closeFoodDetailModal() {
    const modal = document.getElementById("global-food-detail-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

function adjustDetailQty(amount) {
    const qtyVal = document.getElementById("detail-qty-val");
    if (!qtyVal) return;

    currentDetailQty += amount;
    if (currentDetailQty < 1) currentDetailQty = 1;
    qtyVal.textContent = currentDetailQty;
}

async function submitDetailAddToCart(foodId) {
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
            body: JSON.stringify({ foodId: foodId, quantity: currentDetailQty })
        });

        showToast("Đã thêm món vào giỏ hàng!", "success");
        closeFoodDetailModal();
        updateCartBadge();
    } catch (error) {
        // Error toast is handled in apiFetch
    }
}

// =========================================================================
// DYNAMIC LUCIDE SCRIPT LOADER & INITIALIZER
// =========================================================================
function loadLucideIcons() {
    if (!document.getElementById("lucide-icons-script")) {
        const script = document.createElement("script");
        script.id = "lucide-icons-script";
        script.src = "https://unpkg.com/lucide@latest";
        script.onload = () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        };
        document.head.appendChild(script);
    } else {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Load icons on DOM content load
document.addEventListener("DOMContentLoaded", loadLucideIcons);

// =========================================================================
// FOOD REVIEWS GLOBAL HANDLERS
// =========================================================================
let currentRatingValue = 5;

window.setRatingValue = function(val) {
    currentRatingValue = val;
    const stars = document.querySelectorAll(".star-input-btn");
    stars.forEach((star, idx) => {
        if (idx < val) {
            star.style.color = "var(--accent-gold)";
        } else {
            star.style.color = "#d1d5db";
        }
    });
};

window.highlightStars = function(val) {
    const stars = document.querySelectorAll(".star-input-btn");
    stars.forEach((star, idx) => {
        if (idx < val) {
            star.style.color = "var(--accent-gold)";
        } else {
            star.style.color = "#d1d5db";
        }
    });
};

window.resetStars = function() {
    window.setRatingValue(currentRatingValue);
};

window.submitReview = async function(event, foodId) {
    event.preventDefault();
    const comment = document.getElementById("review-comment").value.trim();
    if (!comment) return;

    try {
        const response = await apiFetch("/reviews", {
            method: "POST",
            body: JSON.stringify({
                foodId: foodId,
                rating: currentRatingValue,
                comment: comment
            })
        });

        if (response) {
            showToast("Cảm ơn bạn đã đánh giá món ăn!", "success");
            document.getElementById("submit-review-form").reset();
            window.setRatingValue(5);
            loadModalReviews(foodId);
        }
    } catch (e) {
        // Handled by apiFetch
    }
};

async function loadModalReviews(foodId) {
    const list = document.getElementById("modal-reviews-list");
    if (!list) return;

    try {
        const reviews = await apiFetch(`/reviews/food/${foodId}`);
        list.innerHTML = "";

        if (!reviews || reviews.length === 0) {
            list.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:1.5rem 0;">Món ăn này chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>`;
            return;
        }

        reviews.forEach(rv => {
            let stars = "";
            for (let i = 1; i <= 5; i++) {
                stars += i <= rv.rating ? "★" : "☆";
            }

            const item = document.createElement("div");
            item.style.borderBottom = "1px solid var(--border-color)";
            item.style.padding = "1rem 0";
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                    <div>
                        <strong style="font-size:0.92rem;">${rv.user.fullName}</strong>
                        <span style="color:var(--accent-gold); margin-left:0.5rem; font-size:1rem;">${stars}</span>
                    </div>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${formatDate(rv.createdAt)}</span>
                </div>
                <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.4; margin:0;">${rv.comment || ''}</p>
            `;
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = `<p style="color:var(--color-danger); font-size:0.9rem;">Không thể tải danh sách đánh giá.</p>`;
    }
}

