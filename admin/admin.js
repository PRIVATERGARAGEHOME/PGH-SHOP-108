(function () {
    'use strict';

    const config = window.PGH_CONFIG;
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const saveProductButton = document.getElementById('saveProductButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const existingImagesEl = document.getElementById('existingImages');
    const adminSearch = document.getElementById('adminSearch');
    const toast = document.getElementById('toast');

    let products = [];
    let currentImages = [];
    let removedImageUrls = [];
    let toastTimer;

    if (!window.supabase || !config?.supabaseUrl || !config?.supabasePublishableKey) {
        loginError.textContent = 'Konfigurasi Supabase belum lengkap.';
        loginButton.disabled = true;
        return;
    }

    const db = window.supabase.createClient(
        config.supabaseUrl,
        config.supabasePublishableKey
    );

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function safeUrl(value, forAdminPreview = false) {
        if (!value) return null;
        let normalized = String(value);
        if (forAdminPreview && normalized.startsWith('images/')) normalized = `../${normalized}`;
        try {
            const url = new URL(normalized, window.location.href);
            if (!['http:', 'https:'].includes(url.protocol)) return null;
            return url.href;
        } catch {
            return null;
        }
    }

    function formatRupiah(value) {
        const amount = Number(value) || 0;
        return amount === 0 ? 'GRATIS' : `Rp ${amount.toLocaleString('id-ID')}`;
    }

    function showToast(message, isError = false) {
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function setButtonLoading(button, isLoading, loadingText) {
        if (!button.dataset.originalText) button.dataset.originalText = button.innerHTML;
        button.disabled = isLoading;
        button.innerHTML = isLoading
            ? `<i class="fas fa-circle-notch fa-spin"></i> ${escapeHtml(loadingText)}`
            : button.dataset.originalText;
    }

    async function verifyAdmin() {
        const { data, error } = await db.rpc('is_admin');
        if (error) throw new Error('Database belum siap. Jalankan file SQL sesuai panduan.');
        return data === true;
    }

    async function initializeSession() {
        const { data: { session } } = await db.auth.getSession();
        if (!session) {
            showLogin();
            return;
        }

        try {
            const isAdmin = await verifyAdmin();
            if (!isAdmin) {
                await db.auth.signOut();
                showLogin('Akun ini belum terdaftar sebagai admin.');
                return;
            }
            await showDashboard();
        } catch (error) {
            showLogin(error.message);
        }
    }

    function showLogin(message = '') {
        dashboard.hidden = true;
        loginPage.hidden = false;
        loginError.textContent = message;
    }

    async function showDashboard() {
        loginPage.hidden = true;
        dashboard.hidden = false;
        loginError.textContent = '';
        await loadProducts();
    }

    async function handleLogin(event) {
        event.preventDefault();
        loginError.textContent = '';
        setButtonLoading(loginButton, true, 'Memeriksa...');

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const { error } = await db.auth.signInWithPassword({ email, password });

        if (error) {
            loginError.textContent = 'Email atau password salah.';
            setButtonLoading(loginButton, false, '');
            return;
        }

        try {
            const isAdmin = await verifyAdmin();
            if (!isAdmin) {
                await db.auth.signOut();
                loginError.textContent = 'Akun ini belum diberi akses admin.';
                setButtonLoading(loginButton, false, '');
                return;
            }
            loginForm.reset();
            setButtonLoading(loginButton, false, '');
            await showDashboard();
        } catch (verificationError) {
            await db.auth.signOut();
            loginError.textContent = verificationError.message;
            setButtonLoading(loginButton, false, '');
        }
    }

    async function loadProducts() {
        productList.innerHTML = '<p class="loading"><i class="fas fa-circle-notch fa-spin"></i> Memuat produk...</p>';
        const { data, error } = await db
            .from('products')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            productList.innerHTML = `<p class="empty-list">${escapeHtml(error.message)}</p>`;
            showToast('Produk tidak dapat dimuat.', true);
            return;
        }

        products = data || [];
        updateStats();
        renderProductList();
    }

    function updateStats() {
        document.getElementById('totalProducts').textContent = String(products.length);
        document.getElementById('premiumProducts').textContent = String(products.filter((item) => item.product_type === 'premium').length);
        document.getElementById('freeProducts').textContent = String(products.filter((item) => item.product_type === 'free').length);
        document.getElementById('draftProducts').textContent = String(products.filter((item) => !item.is_published).length);
    }

    function renderProductList() {
        const query = adminSearch.value.trim().toLocaleLowerCase('id-ID');
        const filtered = products.filter((product) => {
            return !query || `${product.name} ${product.description || ''}`.toLocaleLowerCase('id-ID').includes(query);
        });

        if (filtered.length === 0) {
            productList.innerHTML = '<p class="empty-list">Produk tidak ditemukan.</p>';
            return;
        }

        productList.innerHTML = filtered.map((product) => {
            const images = Array.isArray(product.images) ? product.images : [];
            const preview = safeUrl(images[0], true);
            const thumbnail = preview
                ? `<img src="${escapeHtml(preview)}" alt="${escapeHtml(product.name)}" loading="lazy">`
                : '<div class="product-thumb-empty"><i class="fas fa-image"></i></div>';
            return `
                <article class="product-row">
                    ${thumbnail}
                    <div class="product-info">
                        <h3>${escapeHtml(product.name)}</h3>
                        <div class="product-meta">
                            <span class="badge ${product.product_type}">${product.product_type === 'free' ? 'GRATIS' : 'PREMIUM'}</span>
                            ${product.is_published ? '' : '<span class="badge draft">DRAFT</span>'}
                            <span>${formatRupiah(product.price)}</span>
                            <span>${escapeHtml(product.category)}</span>
                            <span>Urutan ${Number(product.display_order) || 0}</span>
                        </div>
                    </div>
                    <div class="row-actions">
                        <button class="edit-button" type="button" onclick="editProduct(${Number(product.id)})" title="Edit produk"><i class="fas fa-pen"></i></button>
                        <button class="delete-button" type="button" onclick="deleteProduct(${Number(product.id)})" title="Hapus produk"><i class="fas fa-trash"></i></button>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderExistingImages() {
        if (currentImages.length === 0) {
            existingImagesEl.innerHTML = '<p class="muted">Belum ada gambar.</p>';
            return;
        }

        existingImagesEl.innerHTML = currentImages.map((url, index) => {
            const preview = safeUrl(url, true);
            if (!preview) return '';
            return `
                <div class="image-item">
                    <img src="${escapeHtml(preview)}" alt="Gambar produk ${index + 1}">
                    <button type="button" onclick="removeExistingImage(${index})" title="Hapus gambar"><i class="fas fa-times"></i></button>
                </div>
            `;
        }).join('');
    }

    function editProduct(id) {
        const product = products.find((item) => Number(item.id) === Number(id));
        if (!product) return;
        document.getElementById('productId').value = String(product.id);
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productType').value = product.product_type || 'premium';
        document.getElementById('productPrice').value = String(product.price || 0);
        document.getElementById('productCategory').value = product.category || 'aksesoris';
        document.getElementById('productOrder').value = String(product.display_order || 0);
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPoly').value = product.poly_count || '';
        document.getElementById('productFormat').value = product.file_format || '';
        document.getElementById('productStyle').value = product.style || '';
        document.getElementById('downloadUrl').value = product.download_url || '';
        document.getElementById('isPublished').checked = Boolean(product.is_published);
        currentImages = Array.isArray(product.images) ? [...product.images] : [];
        removedImageUrls = [];
        document.getElementById('productImages').value = '';
        document.getElementById('formTitle').textContent = `Edit ${product.name}`;
        cancelEditButton.hidden = false;
        updatePriceState();
        renderExistingImages();
        document.getElementById('editorPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function removeExistingImage(index) {
        const removed = currentImages.splice(Number(index), 1)[0];
        if (removed) removedImageUrls.push(removed);
        renderExistingImages();
    }

    function resetProductForm() {
        productForm.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productType').value = 'premium';
        document.getElementById('productPrice').value = '15000';
        document.getElementById('productCategory').value = 'aksesoris';
        document.getElementById('productOrder').value = String(Math.max(0, ...products.map((item) => Number(item.display_order) || 0)) + 1);
        document.getElementById('isPublished').checked = true;
        document.getElementById('formTitle').textContent = 'Tambah Produk Baru';
        currentImages = [];
        removedImageUrls = [];
        cancelEditButton.hidden = true;
        updatePriceState();
        renderExistingImages();
    }

    function updatePriceState() {
        const isFree = document.getElementById('productType').value === 'free';
        const priceInput = document.getElementById('productPrice');
        if (isFree) priceInput.value = '0';
        priceInput.disabled = isFree;
    }

    function slugify(value) {
        return String(value)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'product';
    }

    async function optimizeImage(file) {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} bukan file gambar.`);
        if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} lebih besar dari 15 MB.`);

        try {
            const bitmap = await createImageBitmap(file);
            const maxDimension = 1600;
            const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            const context = canvas.getContext('2d');
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Gambar gagal dioptimalkan.')), 'image/webp', 0.82);
            });
            if (blob.size > 5 * 1024 * 1024) throw new Error(`${file.name} masih lebih besar dari 5 MB.`);
            return { blob, extension: 'webp', contentType: 'image/webp' };
        } catch (error) {
            if (file.size <= 5 * 1024 * 1024) {
                const extensionByType = {
                    'image/jpeg': 'jpg',
                    'image/png': 'png',
                    'image/webp': 'webp'
                };
                return {
                    blob: file,
                    extension: extensionByType[file.type] || 'jpg',
                    contentType: file.type
                };
            }
            throw error;
        }
    }

    async function uploadImages(files, productName) {
        const uploadedUrls = [];
        for (const file of files) {
            const optimized = await optimizeImage(file);
            const uniqueId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const path = `products/${slugify(productName)}/${uniqueId}.${optimized.extension}`;
            const { error } = await db.storage
                .from('product-images')
                .upload(path, optimized.blob, { contentType: optimized.contentType, upsert: false });
            if (error) throw new Error(`Upload ${file.name} gagal: ${error.message}`);
            const { data } = db.storage.from('product-images').getPublicUrl(path);
            uploadedUrls.push(data.publicUrl);
        }
        return uploadedUrls;
    }

    function storagePathFromUrl(value) {
        if (!value) return null;
        try {
            const url = new URL(value);
            const marker = '/storage/v1/object/public/product-images/';
            const markerIndex = url.pathname.indexOf(marker);
            if (markerIndex < 0) return null;
            return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
        } catch {
            return null;
        }
    }

    async function deleteStorageImages(urls) {
        const paths = urls.map(storagePathFromUrl).filter(Boolean);
        if (paths.length === 0) return;
        const { error } = await db.storage.from('product-images').remove(paths);
        if (error) console.warn('Sebagian gambar gagal dihapus:', error.message);
    }

    async function handleProductSave(event) {
        event.preventDefault();
        const id = Number(document.getElementById('productId').value) || null;
        const name = document.getElementById('productName').value.trim();
        const type = document.getElementById('productType').value;
        const files = Array.from(document.getElementById('productImages').files || []);
        let newUploadedUrls = [];

        if (!name) {
            showToast('Nama produk wajib diisi.', true);
            return;
        }

        setButtonLoading(saveProductButton, true, 'Menyimpan...');
        try {
            newUploadedUrls = await uploadImages(files, name);
            const payload = {
                name,
                description: document.getElementById('productDescription').value.trim(),
                price: type === 'free' ? 0 : Number(document.getElementById('productPrice').value) || 0,
                category: document.getElementById('productCategory').value,
                images: [...currentImages, ...newUploadedUrls],
                poly_count: document.getElementById('productPoly').value.trim(),
                file_format: document.getElementById('productFormat').value.trim(),
                style: document.getElementById('productStyle').value.trim(),
                product_type: type,
                download_url: document.getElementById('downloadUrl').value.trim() || null,
                is_published: document.getElementById('isPublished').checked,
                display_order: Number(document.getElementById('productOrder').value) || 0
            };

            const query = id
                ? db.from('products').update(payload).eq('id', id)
                : db.from('products').insert(payload);
            const { error } = await query;
            if (error) throw new Error(error.message);

            await deleteStorageImages(removedImageUrls);
            showToast(id ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
            await loadProducts();
            resetProductForm();
        } catch (error) {
            await deleteStorageImages(newUploadedUrls);
            showToast(error.message || 'Produk gagal disimpan.', true);
        } finally {
            setButtonLoading(saveProductButton, false, '');
        }
    }

    async function deleteProduct(id) {
        const product = products.find((item) => Number(item.id) === Number(id));
        if (!product) return;
        const confirmed = window.confirm(`Hapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`);
        if (!confirmed) return;

        const { error } = await db.from('products').delete().eq('id', product.id);
        if (error) {
            showToast(error.message, true);
            return;
        }

        await deleteStorageImages(Array.isArray(product.images) ? product.images : []);
        showToast('Produk berhasil dihapus.');
        if (Number(document.getElementById('productId').value) === Number(id)) resetProductForm();
        await loadProducts();
    }

    loginForm.addEventListener('submit', handleLogin);
    productForm.addEventListener('submit', handleProductSave);
    adminSearch.addEventListener('input', renderProductList);
    document.getElementById('productType').addEventListener('change', updatePriceState);
    document.getElementById('resetFormButton').addEventListener('click', () => {
        resetProductForm();
        document.getElementById('editorPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    cancelEditButton.addEventListener('click', resetProductForm);
    document.getElementById('logoutButton').addEventListener('click', async () => {
        await db.auth.signOut();
        products = [];
        resetProductForm();
        showLogin();
    });
    document.getElementById('togglePassword').addEventListener('click', () => {
        const passwordInput = document.getElementById('loginPassword');
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        document.querySelector('#togglePassword i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    window.editProduct = editProduct;
    window.deleteProduct = deleteProduct;
    window.removeExistingImage = removeExistingImage;

    resetProductForm();
    initializeSession();
})();
