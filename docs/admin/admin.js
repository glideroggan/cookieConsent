// ==========================================
// COOKIE CONSENT ADMIN PANEL
// ==========================================

// API Configuration
// API Configuration - Update this to point to your Cookie Consent API
const API_BASE_URL = window.COOKIE_CONSENT_CONFIG?.apiUrl || 'http://localhost:5220/api/admin';

// Data containers
let categories = [];
let globalConfig = {};
let cookieDetails = [];

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    showAlert('Loading admin panel...', 'info');
    
    try {
        // Test API connection first
        await fetch(`${API_BASE_URL}/global-config`);
        
        await loadGlobalConfig();
        await loadCategories();
        await loadCookieDetails();
        populateCategorySelects();
        
        // Show the first tab by default
        showTab('global');
        
        // Remove loading message
        const loadingAlert = document.querySelector('.alert');
        if (loadingAlert && loadingAlert.textContent.includes('Loading')) {
            loadingAlert.remove();
        }
        
        console.log('Admin panel loaded successfully');
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        showAlert('Failed to load data. Please ensure the API server is running on http://localhost:5220', 'error');
    }
});

// ==========================================
// API HELPER FUNCTIONS
// ==========================================

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        return method === 'DELETE' ? null : await response.json();
    } catch (error) {
        console.error(`API request failed: ${method} ${endpoint}`, error);
        throw error;
    }
}

// ==========================================
// TAB NAVIGATION
// ==========================================

function showTab(tabName, event = null) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to selected nav tab (if called from a click event)
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // If called programmatically, find and activate the corresponding nav tab
        const navTab = document.querySelector(`[onclick="showTab('${tabName}', event)"]`);
        if (navTab) {
            navTab.classList.add('active');
        }
    }
    
    console.log(`Switched to ${tabName} tab`);
}

// ==========================================
// GLOBAL CONFIGURATION
// ==========================================

async function loadGlobalConfig() {
    try {
        globalConfig = await apiRequest('/global-config');
        
        document.getElementById('consent-version').value = globalConfig.version || '';
        document.getElementById('consent-description').value = globalConfig.description || '';
        document.getElementById('privacy-policy-url').value = globalConfig.privacyPolicyUrl || '';
    } catch (error) {
        console.error('Failed to load global config:', error);
        showAlert('Failed to load global configuration', 'error');
    }
}

async function saveGlobalConfig() {
    const version = document.getElementById('consent-version').value.trim();
    const description = document.getElementById('consent-description').value.trim();
    const privacyPolicyUrl = document.getElementById('privacy-policy-url').value.trim();
    
    if (!description) {
        showAlert('Please fill in the description field', 'error');
        return;
    }
    
    try {
        const updatedConfig = {
            version: version || globalConfig.version,
            description,
            privacyPolicyUrl: privacyPolicyUrl || null
        };
          globalConfig = await apiRequest('/global-config', 'PUT', updatedConfig);
        
        // Reload the form fields with the updated data from the server
        await loadGlobalConfig();
        
        showAlert('✅ Global configuration saved successfully!', 'success');
        console.log('Global configuration updated:', globalConfig);
    } catch (error) {
        console.error('Failed to save global config:', error);
        showAlert(`Failed to save global configuration: ${error.message}`, 'error');
    }
}

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

async function loadCategories() {
    try {
        categories = await apiRequest('/categories');
        
        const categoriesContainer = document.getElementById('categories-list');
        categoriesContainer.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p class="loading">No categories defined yet.</p>';
            return;
        }
        
        categories.forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            
            categoryCard.innerHTML = `
                <div class="category-header">
                    <div>
                        <h3 class="category-title">${category.name}</h3>
                        <span class="category-key">${category.key}</span>
                    </div>
                    <div class="category-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editCategory(${category.id})">Edit</button>
                        ${!category.required ? `<button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">Delete</button>` : ''}
                    </div>
                </div>
                
                <p class="category-description">${category.description}</p>
                
                <div class="category-badges">
                    <span class="badge ${category.required ? 'required' : 'optional'}">
                        ${category.required ? 'Required' : 'Optional'}
                    </span>
                </div>
            `;
            
            categoriesContainer.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        showAlert('Failed to load categories', 'error');
    }
}

function showAddCategoryForm() {
    document.getElementById('add-category-form').style.display = 'block';
    document.getElementById('new-category-key').focus();
}

function hideAddCategoryForm() {
    document.getElementById('add-category-form').style.display = 'none';
    clearCategoryForm();
}

function clearCategoryForm() {
    document.getElementById('new-category-key').value = '';
    document.getElementById('new-category-name').value = '';
    document.getElementById('new-category-description').value = '';
    document.getElementById('new-category-required').checked = false;
}

async function addCategory() {
    const key = document.getElementById('new-category-key').value.trim();
    const name = document.getElementById('new-category-name').value.trim();
    const description = document.getElementById('new-category-description').value.trim();
    const required = document.getElementById('new-category-required').checked;
    
    if (!key || !name || !description) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Validate key format (lowercase, no spaces)
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
        showAlert('Category key must be lowercase letters, numbers, and underscores only, starting with a letter', 'error');
        return;
    }
    
    try {
        const newCategory = { key, name, description, required };
        await apiRequest('/categories', 'POST', newCategory);
        
        hideAddCategoryForm();
        await loadCategories();
        populateCategorySelects();
        await loadCookieDetails();
        
        showAlert(`✅ Category "${name}" added successfully!`, 'success');
        console.log(`Category "${name}" added with key "${key}"`);
    } catch (error) {
        console.error('Failed to add category:', error);
        showAlert(`Failed to add category: ${error.message}`, 'error');
    }
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Populate edit form
    document.getElementById('edit-category-original-key').value = category.key;
    document.getElementById('edit-category-key').value = category.key;
    document.getElementById('edit-category-name').value = category.name;
    document.getElementById('edit-category-description').value = category.description;
    document.getElementById('edit-category-required').checked = category.required;
    
    // Store the category ID for updating
    document.getElementById('edit-category-modal').dataset.categoryId = categoryId;
    
    // Show modal
    document.getElementById('edit-category-modal').classList.add('show');
}

function hideEditCategoryModal() {
    document.getElementById('edit-category-modal').classList.remove('show');
}

async function updateCategory() {
    const categoryId = parseInt(document.getElementById('edit-category-modal').dataset.categoryId);
    const newKey = document.getElementById('edit-category-key').value.trim();
    const name = document.getElementById('edit-category-name').value.trim();
    const description = document.getElementById('edit-category-description').value.trim();
    const required = document.getElementById('edit-category-required').checked;
    
    if (!newKey || !name || !description) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Validate key format
    if (!/^[a-z][a-z0-9_]*$/.test(newKey)) {
        showAlert('Category key must be lowercase letters, numbers, and underscores only, starting with a letter', 'error');
        return;
    }
    
    try {
        const updatedCategory = {
            key: newKey,
            name,
            description,
            required
        };
        
        await apiRequest(`/categories/${categoryId}`, 'PUT', updatedCategory);
        
        hideEditCategoryModal();
        await loadCategories();
        populateCategorySelects();
        await loadCookieDetails();
        
        showAlert(`✅ Category "${name}" updated successfully!`, 'success');
        console.log(`Category updated: ID ${categoryId}`);
    } catch (error) {
        console.error('Failed to update category:', error);
        showAlert(`Failed to update category: ${error.message}`, 'error');
    }
}

async function deleteCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (category.required) {
        showAlert('Cannot delete required categories', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the "${category.name}" category?\n\nThis will also delete all associated cookie information.`)) {
        try {
            await apiRequest(`/categories/${categoryId}`, 'DELETE');
            
            await loadCategories();
            populateCategorySelects();
            await loadCookieDetails();
            
            showAlert(`✅ Category "${category.name}" deleted successfully!`, 'success');
            console.log(`Category "${category.name}" deleted`);
        } catch (error) {
            console.error('Failed to delete category:', error);
            showAlert(`Failed to delete category: ${error.message}`, 'error');
        }
    }
}

// ==========================================
// COOKIE DETAILS MANAGEMENT
// ==========================================

function populateCategorySelects() {
    const selects = document.querySelectorAll('#new-cookie-category');
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select category...</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    });
}

async function loadCookieDetails() {
    try {
        cookieDetails = await apiRequest('/cookie-details');
        
        const container = document.getElementById('cookie-details-container');
        container.innerHTML = '';
        
        if (categories.length === 0) {
            container.innerHTML = '<p class="loading">No categories defined yet. Add categories first.</p>';
            return;
        }
        
        categories.forEach(category => {
            const categoryCookies = cookieDetails.filter(cookie => cookie.categoryId === category.id);
            
            const categorySection = document.createElement('div');
            categorySection.className = 'cookie-category';
            
            categorySection.innerHTML = `
                <div class="cookie-category-header">
                    <h3 class="cookie-category-title">${category.name}</h3>
                    <span class="cookie-count">${categoryCookies.length} cookie${categoryCookies.length !== 1 ? 's' : ''}</span>
                </div>
                
                <table class="cookies-table">
                    <thead>
                        <tr>
                            <th>Cookie Name</th>
                            <th>Purpose</th>
                            <th>Duration</th>
                            <th>Provider</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="cookies-${category.id}">
                        ${categoryCookies.length === 0 ? 
                            '<tr><td colspan="5" style="text-align: center; color: #6c757d; font-style: italic;">No cookies defined for this category</td></tr>' :
                            categoryCookies.map((cookie) => `
                                <tr>
                                    <td><span class="cookie-name">${cookie.name}</span></td>
                                    <td>${cookie.purpose}</td>
                                    <td>${cookie.duration}</td>
                                    <td>${cookie.provider}</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="deleteCookie(${cookie.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            `;
            
            container.appendChild(categorySection);
        });
    } catch (error) {
        console.error('Failed to load cookie details:', error);
        showAlert('Failed to load cookie details', 'error');
    }
}

function showAddCookieForm() {
    if (categories.length === 0) {
        showAlert('Please add at least one category before adding cookies', 'error');
        return;
    }
    
    document.getElementById('add-cookie-form').style.display = 'block';
    document.getElementById('new-cookie-category').focus();
}

function hideAddCookieForm() {
    document.getElementById('add-cookie-form').style.display = 'none';
    clearCookieForm();
}

function clearCookieForm() {
    document.getElementById('new-cookie-category').value = '';
    document.getElementById('new-cookie-name').value = '';
    document.getElementById('new-cookie-purpose').value = '';
    document.getElementById('new-cookie-duration').value = '';
    document.getElementById('new-cookie-provider').value = '';
}

async function addCookieInfo() {
    const categoryId = parseInt(document.getElementById('new-cookie-category').value);
    const name = document.getElementById('new-cookie-name').value.trim();
    const purpose = document.getElementById('new-cookie-purpose').value.trim();
    const duration = document.getElementById('new-cookie-duration').value.trim();
    const provider = document.getElementById('new-cookie-provider').value.trim();
    
    if (!categoryId || !name || !purpose || !duration || !provider) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const newCookie = {
            categoryId,
            name,
            purpose,
            duration,
            provider
        };
        
        await apiRequest('/cookie-details', 'POST', newCookie);
        
        hideAddCookieForm();
        await loadCookieDetails();
        
        const categoryName = categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
        showAlert(`✅ Cookie "${name}" added to ${categoryName} successfully!`, 'success');
        console.log(`Cookie "${name}" added to category ID "${categoryId}"`);
    } catch (error) {
        console.error('Failed to add cookie:', error);
        showAlert(`Failed to add cookie: ${error.message}`, 'error');
    }
}

async function deleteCookie(cookieId) {
    const cookie = cookieDetails.find(c => c.id === cookieId);
    if (!cookie) {
        console.error('Cookie not found in local data:', cookieId);
        return;
    }
    
    if (confirm(`Are you sure you want to delete the "${cookie.name}" cookie?`)) {
        try {
            await apiRequest(`/cookie-details/${cookieId}`, 'DELETE');
            
            // Reload the cookie list to reflect the deletion
            await loadCookieDetails();
            
            showAlert(`✅ Cookie "${cookie.name}" deleted successfully!`, 'success');
            console.log(`Cookie "${cookie.name}" deleted successfully`);
        } catch (error) {
            console.error('Failed to delete cookie:', error);
            showAlert(`Failed to delete cookie: ${error.message}`, 'error');
        }
    }
}

// ==========================================
// EXPORT FUNCTIONALITY
// ==========================================

function exportConfig() {
    const config = {
        globalConfig: globalConfig,
        categories: categories,
        cookieDetails: cookieDetails,
        metadata: {
            exported: new Date().toISOString(),
            version: '1.0',
            source: 'Cookie Consent Admin Panel'
        }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookie-consent-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showAlert('✅ Configuration exported to JSON file!', 'success');
    console.log('Configuration exported');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showAlert(message, type = 'info') {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    // Insert at the top of the active tab content
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const section = activeTab.querySelector('.section');
        if (section) {
            section.insertBefore(alert, section.firstChild);
        }
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// ESC key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            openModal.classList.remove('show');
        }
    }
});

console.log('Cookie Consent Admin Panel loaded successfully');
