// Supabase Configuration
const SUPABASE_URL = 'https://qdodkjdyuggltvkwfwgy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2RramR5dWdnbHR2a3dmd2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTU5NjYsImV4cCI6MjA4MjY5MTk2Nn0.IjjWLZnTVA-4m-vqSeVlIehP9sWP6AKTz__JEcMkJXM';

// Initialize Supabase Client (use let to avoid redeclaration errors)
let supabaseClient;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase library not loaded');
}

// DOM Elements
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const savedMenuDiv = document.getElementById('savedMenu');
const menuDisplayDiv = document.getElementById('menuDisplay');

// Menu ID - Always use ID 1 for single shared menu
const MENU_ID = 1;

// Load saved menu on page load
window.addEventListener('DOMContentLoaded', () => {
    loadSavedMenu();
});

// Save menu
saveBtn.addEventListener('click', async () => {
    const menuData = collectMenuData();

    if (!validateMenu(menuData)) {
        showNotification('Lütfen en az bir seçim yapın!', 'error');
        return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Kaydediliyor...';

    try {
        // Prepare data for Supabase
        const supabaseData = {
            id: MENU_ID,
            aperatif: menuData.aperatif,
            corba: menuData.corba,
            ana_yemek: menuData.anaYemek,
            yan_yemekler: menuData.yanYemekler,
            salata: menuData.salata,
            tatli: menuData.tatli,
            icecekler: menuData.icecekler
        };

        // Upsert (Insert or Update) to Supabase
        const { data, error } = await supabaseClient
            .from('menu_selections')
            .upsert(supabaseData, { onConflict: 'id' })
            .select();

        if (error) {
            throw error;
        }

        // Display saved menu
        displaySavedMenu(menuData);

        showNotification('Menü başarıyla kaydedildi! Herkes bu menüyü görecek 🎉', 'success');
    } catch (error) {
        console.error('Supabase error:', error);
        showNotification('Kaydetme hatası: ' + error.message, 'error');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Menüyü Kaydet';
    }
});

// Clear selections
clearBtn.addEventListener('click', async () => {
    if (confirm('Tüm seçimleri temizlemek istediğinize emin misiniz? Bu herkes için geçerli olacak!')) {
        // Show loading state
        clearBtn.disabled = true;
        clearBtn.textContent = '🗑️ Temizleniyor...';

        try {
            // Delete from Supabase
            const { error } = await supabaseClient
                .from('menu_selections')
                .delete()
                .eq('id', MENU_ID);

            if (error) {
                throw error;
            }

            // Clear all inputs
            document.querySelectorAll('input[type="radio"]').forEach(input => {
                if (input.name !== 'ana-yemek') {
                    input.checked = false;
                }
            });
            document.querySelectorAll('input[type="checkbox"]').forEach(input => {
                input.checked = false;
            });

            // Remove selected class from all options
            document.querySelectorAll('.option').forEach(option => {
                option.classList.remove('selected');
            });

            // Hide saved menu display
            savedMenuDiv.style.display = 'none';

            showNotification('Seçimler temizlendi! Herkes için sıfırlandı.', 'info');
        } catch (error) {
            console.error('Supabase error:', error);
            showNotification('Temizleme hatası: ' + error.message, 'error');
        } finally {
            // Reset button state
            clearBtn.disabled = false;
            clearBtn.textContent = '🗑️ Seçimleri Temizle';
        }
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

// Load saved menu from Supabase
async function loadSavedMenu() {
    try {
        // Fetch from Supabase
        const { data, error } = await supabaseClient
            .from('menu_selections')
            .select('*')
            .eq('id', MENU_ID)
            .single();

        if (error) {
            // If no menu exists yet, that's okay
            if (error.code === 'PGRST116') {
                console.log('No menu saved yet');
                return;
            }
            throw error;
        }

        if (data) {
            // Convert Supabase data to menu format
            const menuData = {
                aperatif: data.aperatif,
                corba: data.corba,
                anaYemek: data.ana_yemek,
                yanYemekler: data.yan_yemekler || [],
                salata: data.salata,
                tatli: data.tatli,
                icecekler: data.icecekler || [],
                tarih: new Date(data.created_at).toLocaleDateString('tr-TR')
            };

            // Restore selections
            if (menuData.aperatif) {
                setRadioValue('aperatif', menuData.aperatif);
            }

            if (menuData.corba) {
                setRadioValue('corba', menuData.corba);
            }

            if (menuData.salata) {
                setRadioValue('salata', menuData.salata);
            }

            if (menuData.tatli) {
                setRadioValue('tatli', menuData.tatli);
            }

            if (menuData.yanYemekler && menuData.yanYemekler.length > 0) {
                menuData.yanYemekler.forEach(value => {
                    setCheckboxValue('yan', value);
                });
            }

            if (menuData.icecekler && menuData.icecekler.length > 0) {
                menuData.icecekler.forEach(value => {
                    setCheckboxValue('icecek', value);
                });
            }

            // Display saved menu
            displaySavedMenu(menuData);
        }
    } catch (error) {
        console.error('Error loading saved menu:', error);
        showNotification('Menü yüklenirken hata oluştu: ' + error.message, 'error');
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
function updateOptionVisualFeedback() {
    document.querySelectorAll('.option').forEach(option => {
        const input = option.querySelector('input');

        // Remove old listeners by cloning
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);

        const newInput = newOption.querySelector('input');

        newInput.addEventListener('change', () => {
            if (newInput.type === 'radio') {
                // Remove selected class from all options in the same group
                document.querySelectorAll(`input[name="${newInput.name}"]`).forEach(radio => {
                    radio.closest('.option').classList.remove('selected');
                });
            }

            if (newInput.checked) {
                newOption.classList.add('selected');
            } else {
                newOption.classList.remove('selected');
            }
        });

        // Set initial state
        if (newInput.checked) {
            newOption.classList.add('selected');
        }
    });
}

// Initialize visual feedback
updateOptionVisualFeedback();

// Add Custom Option Functionality
document.querySelectorAll('.add-custom-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = this.dataset.category;
        const type = this.dataset.type;
        const section = this.closest('.menu-section');
        const optionsDiv = section.querySelector('.options');

        // Check if input form already exists
        if (section.querySelector('.custom-option-input')) {
            return;
        }

        // Create input form
        const inputForm = document.createElement('div');
        inputForm.className = 'custom-option-input';
        inputForm.innerHTML = `
            <input type="text" placeholder="Yeni seçeneğin adını gir..." maxlength="100">
            <div class="custom-option-buttons">
                <button class="btn-add">Ekle</button>
                <button class="btn-cancel">İptal</button>
            </div>
        `;

        // Insert form before the add button
        this.parentNode.insertBefore(inputForm, this);

        const input = inputForm.querySelector('input');
        const addBtn = inputForm.querySelector('.btn-add');
        const cancelBtn = inputForm.querySelector('.btn-cancel');

        // Focus input
        input.focus();

        // Add button click
        addBtn.addEventListener('click', () => {
            const value = input.value.trim();
            if (!value) {
                showNotification('Lütfen bir isim girin!', 'error');
                return;
            }

            // Create new option
            const newOption = document.createElement('label');
            newOption.className = 'option';
            newOption.innerHTML = `
                <input type="${type}" name="${category}" value="${value}">
                <span>${value}</span>
            `;

            // Add to options
            optionsDiv.appendChild(newOption);

            // Remove input form
            inputForm.remove();

            // Update visual feedback
            updateOptionVisualFeedback();

            showNotification('Seçenek eklendi!', 'success');
        });

        // Cancel button click
        cancelBtn.addEventListener('click', () => {
            inputForm.remove();
        });

        // Enter key to add
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });

        // Escape key to cancel
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelBtn.click();
            }
        });
    });
});
