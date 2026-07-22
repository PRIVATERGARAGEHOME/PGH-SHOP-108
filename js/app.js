(function () {
    'use strict';

    const config = window.PGH_CONFIG;
    const storeStatus = document.getElementById('storeStatus');
    const gridEl = document.getElementById('assets-grid');
    const cartCountSpan = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const productSearch = document.getElementById('productSearch');

    let assets = [];
    let filterCategory = 'all';
    let filterPriceType = 'all';
    let searchQuery = '';
    let cartIds = loadCartIds();
    let isFollowing = localStorage.getItem('pgh_follow') === 'true';

    if (!config?.supabaseUrl || !config?.supabasePublishableKey || !window.supabase) {
        showStoreError('Konfigurasi database belum lengkap. Hubungi admin.');
        return;
    }

    const db = window.supabase.createClient(
        config.supabaseUrl,
        config.supabasePublishableKey
    );

    function loadCartIds() {
        try {
            const value = JSON.parse(localStorage.getItem('cart') || '[]');
            if (!Array.isArray(value)) return [];
            return [...new Set(value.map((item) => {
                if (typeof item === 'object' && item !== null) return Number(item.id);
                return Number(item);
            }).filter(Number.isSafeInteger))];
        } catch {
            return [];
        }
    }

    function saveCartIds() {
        localStorage.setItem('cart', JSON.stringify(cartIds));
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function safeUrl(value) {
        if (!value) return null;
        try {
            const url = new URL(String(value), window.location.href);
            if (!['http:', 'https:'].includes(url.protocol)) return null;
            return url.href;
        } catch {
            return null;
        }
    }

    function normalizeProduct(row) {
        const images = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
        return {
            id: Number(row.id),
            legacyId: row.legacy_id == null ? null : Number(row.legacy_id),
            name: String(row.name || ''),
            desc: String(row.description || ''),
            price: Number(row.price) || 0,
            cat: String(row.category || 'aksesoris'),
            images,
            poly: String(row.poly_count || '-'),
            fmt: String(row.file_format || '-'),
            style: String(row.style || '-'),
            type: row.product_type === 'free' ? 'free' : 'premium',
            downloadLink: row.download_url || null,
            displayOrder: Number(row.display_order) || 0
        };
    }

    async function loadProducts() {
        setStoreStatus('Memuat produk...');
        const { data, error } = await db
            .from('products')
            .select('id,legacy_id,name,description,price,category,images,poly_count,file_format,style,product_type,download_url,display_order')
            .eq('is_published', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            showStoreError('Produk belum dapat dimuat. Pastikan SQL Supabase sudah dijalankan.');
            return;
        }

        assets = (data || []).map(normalizeProduct);
        cartIds = cartIds.filter((id) => assets.some((asset) => asset.id === id));
        saveCartIds();
        setStoreStatus('');
        renderAssets();
        renderCart();
        updateFollowUI();
        checkNewProducts();
        openSharedProduct();
    }

    function setStoreStatus(message) {
        if (!storeStatus) return;
        storeStatus.textContent = message;
        storeStatus.classList.remove('error');
        storeStatus.hidden = !message;
    }

    function showStoreError(message) {
        if (!storeStatus) return;
        storeStatus.textContent = message;
        storeStatus.classList.add('error');
        storeStatus.hidden = false;
        if (gridEl) gridEl.innerHTML = '';
    }

    function formatRupiah(value) {
        const amount = Number(value) || 0;
        if (amount === 0) return 'GRATIS';
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }

    function isInCart(id) {
        return cartIds.includes(Number(id));
    }

    function addToCart(id) {
        const asset = assets.find((item) => item.id === Number(id));
        if (!asset || asset.type !== 'premium') return;
        if (isInCart(asset.id)) {
            showNotif(`⚠️ ${asset.name} sudah ada di keranjang`);
            return;
        }
        cartIds.push(asset.id);
        saveCartIds();
        renderCart();
        renderAssets();
        showNotif(`✔ ${asset.name} ditambahkan ke keranjang`);
    }

    function removeFromCart(id) {
        cartIds = cartIds.filter((itemId) => itemId !== Number(id));
        saveCartIds();
        renderCart();
        renderAssets();
    }

    function renderCart() {
        const cart = cartIds
            .map((id) => assets.find((asset) => asset.id === id))
            .filter(Boolean);

        cartItemsDiv.innerHTML = cart.map((item) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)}</div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Hapus</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotalSpan.textContent = formatRupiah(total);
        cartCountSpan.textContent = String(cart.length);
        checkoutBtn.disabled = cart.length === 0;
    }

    function renderAssets() {
        if (!gridEl) return;
        const query = searchQuery.toLocaleLowerCase('id-ID');
        const filtered = assets.filter((asset) => {
            if (filterCategory !== 'all' && asset.cat !== filterCategory) return false;
            if (filterPriceType !== 'all' && asset.type !== filterPriceType) return false;
            if (query && !`${asset.name} ${asset.desc}`.toLocaleLowerCase('id-ID').includes(query)) return false;
            return true;
        });

        if (filtered.length === 0) {
            gridEl.innerHTML = '<div class="empty-message"><i class="fas fa-box-open fa-2x"></i><br><br>Produk tidak ditemukan.</div>';
            return;
        }

        gridEl.innerHTML = filtered.map((asset) => {
            const imageUrls = asset.images.map(safeUrl).filter(Boolean);
            const slides = imageUrls.length
                ? imageUrls.map((url) => `<div class="image-slide"><img src="${escapeHtml(url)}" alt="${escapeHtml(asset.name)}" loading="lazy" decoding="async"></div>`).join('')
                : '<div class="image-slide image-placeholder"><span>Gambar belum tersedia</span></div>';
            const dots = imageUrls.length > 1
                ? imageUrls.map((_, index) => `<div class="slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${asset.id}, ${index})"></div>`).join('')
                : '';
            const arrows = imageUrls.length > 1
                ? `<button class="slider-arrow prev" onclick="slideImage(${asset.id}, -1)" aria-label="Gambar sebelumnya"><i class="fas fa-chevron-left"></i></button>
                   <button class="slider-arrow next" onclick="slideImage(${asset.id}, 1)" aria-label="Gambar berikutnya"><i class="fas fa-chevron-right"></i></button>`
                : '';
            const shareButton = `<button class="share-btn" onclick="shareProduct(${asset.id})"><i class="fas fa-share-alt"></i> Share</button>`;
            let buttonsHtml;

            if (asset.type === 'free') {
                const label = asset.downloadLink ? 'Unduh Gratis' : 'Link Tidak Tersedia';
                const mutedStyle = asset.downloadLink ? '' : ' style="background:#95a5a6"';
                const downloadButton = `<button class="download-btn" onclick="downloadFreeAsset(${asset.id})"${mutedStyle}><i class="fas fa-download"></i> ${label}</button>`;
                buttonsHtml = `<div class="button-group">${downloadButton}${shareButton}</div>`;
            } else {
                const added = isInCart(asset.id);
                const addButton = `<button class="add-to-cart" ${added ? 'disabled' : ''} onclick="addToCart(${asset.id})">${added ? '✅ Di Keranjang' : '🛒 Add to Cart'}</button>`;
                buttonsHtml = `<div class="button-group">${addButton}${shareButton}</div>`;
            }

            return `
                <div class="asset-card" id="product-${asset.id}">
                    <div class="asset-image">
                        <div class="image-slider" id="slider-${asset.id}">${slides}</div>
                        ${arrows}
                        <div class="slider-nav">${dots}</div>
                        <div class="price-tag ${asset.type === 'free' ? 'free' : 'premium'}">${asset.type === 'free' ? '✨ FREE' : '💎 PREMIUM'}</div>
                    </div>
                    <div class="asset-info">
                        <h3>${escapeHtml(asset.name)}</h3>
                        <p class="asset-description">${escapeHtml(asset.desc)}</p>
                        <div class="asset-meta"><span>Poly: ${escapeHtml(asset.poly)}</span><span>${escapeHtml(asset.style)}</span><span>${escapeHtml(asset.fmt)}</span></div>
                        <div class="asset-price">${asset.price === 0 ? '<span class="free-badge-small">GRATIS 🎁</span>' : formatRupiah(asset.price)}</div>
                        ${buttonsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    function slideImage(assetId, direction) {
        const slider = document.getElementById(`slider-${assetId}`);
        if (!slider) return;
        const dots = slider.parentElement.querySelectorAll('.slider-dot');
        const slides = slider.querySelectorAll('.image-slide');
        if (slides.length < 2) return;
        let currentIndex = Array.from(dots).findIndex((dot) => dot.classList.contains('active'));
        if (currentIndex < 0) currentIndex = 0;
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = slides.length - 1;
        if (newIndex >= slides.length) newIndex = 0;
        slider.style.transform = `translateX(-${newIndex * 100}%)`;
        dots.forEach((dot, index) => dot.classList.toggle('active', index === newIndex));
    }

    function goToSlide(assetId, index) {
        const slider = document.getElementById(`slider-${assetId}`);
        if (!slider) return;
        const dots = slider.parentElement.querySelectorAll('.slider-dot');
        slider.style.transform = `translateX(-${Number(index) * 100}%)`;
        dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === Number(index)));
    }

    function downloadFreeAsset(assetId) {
        const asset = assets.find((item) => item.id === Number(assetId));
        const url = asset?.type === 'free' ? safeUrl(asset.downloadLink) : null;
        if (!asset || asset.type !== 'free') {
            showNotif('❌ Produk ini tidak bisa diunduh langsung.');
            return;
        }
        if (!url) {
            showNotif(`⚠️ Link download untuk ${asset.name} belum tersedia.`);
            return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        showNotif(`📥 Membuka download ${asset.name}...`);
    }

    async function shareProduct(id) {
        const asset = assets.find((item) => item.id === Number(id));
        if (!asset) return;
        const url = new URL(window.location.href);
        url.searchParams.set('product', String(asset.id));
        const shareData = { title: asset.name, text: `Lihat ${asset.name} di PGH 3D Asset`, url: url.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(url.href);
                showNotif('Link produk disalin! ✅');
            }
        } catch (error) {
            if (error?.name !== 'AbortError') showNotif('Link belum dapat dibagikan.');
        }
    }

    function openSharedProduct() {
        const requestedId = Number(new URLSearchParams(window.location.search).get('product'));
        if (!Number.isSafeInteger(requestedId)) return;
        const product = assets.find((item) => item.id === requestedId)
            || assets.find((item) => item.legacyId === requestedId);
        if (!product) return;
        filterCategory = 'all';
        filterPriceType = 'all';
        document.querySelectorAll('#categoryFilters .filter-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.filter === 'all');
        });
        document.querySelectorAll('#priceTypeFilters .filter-price-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.price === 'all');
        });
        renderAssets();
        requestAnimationFrame(() => {
            const element = document.getElementById(`product-${product.id}`);
            if (!element) return;
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-product');
        });
    }

    function updateFollowUI() {
        const followText = document.getElementById('followText');
        const followBtn = document.getElementById('followBtn');
        if (!followText || !followBtn) return;
        followText.textContent = isFollowing ? 'Mengikuti' : 'Ikuti';
        followBtn.style.background = isFollowing ? '#2ecc71' : 'var(--follow-bg)';
        followBtn.style.boxShadow = isFollowing ? '0 2px 8px rgba(46,204,113,0.4)' : 'none';
    }

    function checkNewProducts() {
        const lastCount = Number.parseInt(localStorage.getItem('pgh_product_count') || '0', 10);
        if (isFollowing && lastCount > 0 && assets.length > lastCount) {
            showNotif(`🎉 Ada ${assets.length - lastCount} produk baru di toko!`, 5000);
        }
        if (isFollowing) localStorage.setItem('pgh_product_count', String(assets.length));
    }

    function toggleFollow() {
        isFollowing = !isFollowing;
        localStorage.setItem('pgh_follow', String(isFollowing));
        if (isFollowing) localStorage.setItem('pgh_product_count', String(assets.length));
        updateFollowUI();
        showNotif(isFollowing ? '✅ Anda sekarang mengikuti toko.' : '❌ Anda berhenti mengikuti toko.');
    }

    function initDarkMode() {
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'enabled' || (savedTheme === null && prefersDark);
        document.body.classList.toggle('dark', isDark);
        updateDarkModeButton(isDark);
    }

    function updateDarkModeButton(isDark) {
        const button = document.getElementById('darkModeToggle');
        if (!button) return;
        button.innerHTML = isDark
            ? '<i class="fas fa-sun"></i> <span>Light Mode</span>'
            : '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
    }

    function toggleDarkMode() {
        const isDark = !document.body.classList.contains('dark');
        document.body.classList.toggle('dark', isDark);
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        updateDarkModeButton(isDark);
    }

    function showNotif(message, duration = 2800) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        window.setTimeout(() => notification.remove(), duration);
    }

    function toggleMobileMenu() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const icon = document.getElementById('menuIcon');
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        if (sidebar.classList.contains('show')) icon.classList.replace('fa-bars', 'fa-times');
        else icon.classList.replace('fa-times', 'fa-bars');
    }

    function closeMobileMenu() {
        document.getElementById('mobileSidebar').classList.remove('show');
        document.getElementById('sidebarOverlay').classList.remove('show');
        document.getElementById('menuIcon').classList.replace('fa-times', 'fa-bars');
    }

    document.querySelectorAll('#categoryFilters .filter-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('#categoryFilters .filter-btn').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            filterCategory = button.dataset.filter || 'all';
            renderAssets();
        });
    });

    document.querySelectorAll('#priceTypeFilters .filter-price-btn').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('#priceTypeFilters .filter-price-btn').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            filterPriceType = button.dataset.price || 'all';
            renderAssets();
        });
    });

    productSearch?.addEventListener('input', () => {
        searchQuery = productSearch.value.trim();
        renderAssets();
    });

    document.getElementById('followBtn')?.addEventListener('click', toggleFollow);
    document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
    document.getElementById('cartIcon')?.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });
    document.getElementById('closeCartBtn')?.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    cartOverlay?.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    checkoutBtn?.addEventListener('click', () => {
        const cart = cartIds.map((id) => assets.find((asset) => asset.id === id)).filter(Boolean);
        if (cart.length === 0) return;
        const itemsList = cart.map((item) => `• ${item.name} - ${formatRupiah(item.price)}`).join('\n');
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const message = `APAKAH INI MASIH ADA?\n${itemsList}\n\nTotal: ${formatRupiah(total)}\n\nMohon konfirmasi dan info pembayaran. Terima kasih.`;
        const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.downloadFreeAsset = downloadFreeAsset;
    window.shareProduct = shareProduct;
    window.slideImage = slideImage;
    window.goToSlide = goToSlide;
    window.toggleMobileMenu = toggleMobileMenu;
    window.closeMobileMenu = closeMobileMenu;

    initDarkMode();
    updateFollowUI();
    renderCart();
    loadProducts();
})();
