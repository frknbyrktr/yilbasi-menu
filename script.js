// DOM Elements
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const savedMenuDiv = document.getElementById('savedMenu');
const menuDisplayDiv = document.getElementById('menuDisplay');

// Storage key
const STORAGE_KEY = 'yilbasi_menu_2025';

// Load saved menu on page load
window.addEventListener('DOMContentLoaded', () => {
    loadSavedMenu();
});

// Save menu
saveBtn.addEventListener('click', () => {
    const menuData = collectMenuData();

    if (!validateMenu(menuData)) {
        showNotification('Lütfen en az bir seçim yapın!', 'error');
        return;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuData));

    // Display saved menu
    displaySavedMenu(menuData);

    showNotification('Menü başarıyla kaydedildi!', 'success');
});

// Clear selections
clearBtn.addEventListener('click', () => {
    if (confirm('Tüm seçimleri temizlemek istediğinize emin misiniz?')) {
        // Clear all inputs
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            if (input.name !== 'ana-yemek') {
                input.checked = false;
            }
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        // Hide saved menu display
        savedMenuDiv.style.display = 'none';

        showNotification('Seçimler temizlendi!', 'info');
    }
});

// Collect menu data from form
function collectMenuData() {
    const data = {
        aperatif: getRadioValue('aperatif'),
        corba: getRadioValue('corba'),
        anaYemek: getRadioValue('ana-yemek'),
        yanYemekler: getCheckboxValues('yan'),
        salata: getRadioValue('salata'),
        tatli: getRadioValue('tatli'),
        icecekler: getCheckboxValues('icecek'),
        tarih: new Date().toLocaleDateString('tr-TR')
    };

    return data;
}

// Get radio button value
function getRadioValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : null;
}

// Get checkbox values
function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Validate menu
function validateMenu(data) {
    // Check if at least one item is selected (besides ana-yemek which is always selected)
    return data.aperatif ||
           data.corba ||
           data.yanYemekler.length > 0 ||
           data.salata ||
           data.tatli ||
           data.icecekler.length > 0;
}

// Display saved menu
function displaySavedMenu(data) {
    let html = '';

    if (data.aperatif) {
        html += `<p><strong>Aperatif:</strong> ${data.aperatif}</p>`;
    }

    if (data.corba) {
        html += `<p><strong>Çorba:</strong> ${data.corba}</p>`;
    }

    html += `<p><strong>Ana Yemek:</strong> ${data.anaYemek}</p>`;

    if (data.yanYemekler.length > 0) {
        html += `<p><strong>Yan Yemekler:</strong> ${data.yanYemekler.join(', ')}</p>`;
    }

    if (data.salata) {
        html += `<p><strong>Salata:</strong> ${data.salata}</p>`;
    }

    if (data.tatli) {
        html += `<p><strong>Tatlı:</strong> ${data.tatli}</p>`;
    }

    if (data.icecekler.length > 0) {
        html += `<p><strong>İçecekler:</strong> ${data.icecekler.join(', ')}</p>`;
    }

    html += `<p style="margin-top: 20px; color: #666; font-style: italic;"><strong>Kayıt Tarihi:</strong> ${data.tarih}</p>`;

    menuDisplayDiv.innerHTML = html;
    savedMenuDiv.style.display = 'block';

    // Scroll to saved menu
    savedMenuDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Load saved menu from localStorage
function loadSavedMenu() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
        try {
            const data = JSON.parse(savedData);

            // Restore selections
            if (data.aperatif) {
                setRadioValue('aperatif', data.aperatif);
            }

            if (data.corba) {
                setRadioValue('corba', data.corba);
            }

            if (data.salata) {
                setRadioValue('salata', data.salata);
            }

            if (data.tatli) {
                setRadioValue('tatli', data.tatli);
            }

            if (data.yanYemekler) {
                data.yanYemekler.forEach(value => {
                    setCheckboxValue('yan', value);
                });
            }

            if (data.icecekler) {
                data.icecekler.forEach(value => {
                    setCheckboxValue('icecek', value);
                });
            }

            // Display saved menu
            displaySavedMenu(data);
        } catch (e) {
            console.error('Error loading saved menu:', e);
        }
    }
}

// Set radio button value
function setRadioValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
    }
}

// Set checkbox value
function setCheckboxValue(name, value) {
    const checkbox = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (checkbox) {
        checkbox.checked = true;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    if (type === 'error') {
        notification.style.background = '#f44336';
    } else if (type === 'info') {
        notification.style.background = '#2196F3';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add visual feedback for selected options
document.querySelectorAll('.option').forEach(option => {
    const input = option.querySelector('input');

    input.addEventListener('change', () => {
        if (input.type === 'radio') {
            // Remove selected class from all options in the same group
            document.querySelectorAll(`input[name="${input.name}"]`).forEach(radio => {
                radio.closest('.option').classList.remove('selected');
            });
        }

        if (input.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    // Set initial state
    if (input.checked) {
        option.classList.add('selected');
    }
});
