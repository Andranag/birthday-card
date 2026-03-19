document.addEventListener('DOMContentLoaded', function() {
    console.log('Birthday Card Script Loaded Successfully!');
    
    // Check if we have card data in URL (for sharing)
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    
    // Initialize IndexedDB database
    function initializeDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BirthdayCardDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
                if (!db.objectStoreNames.contains('recentImages')) {
                    db.createObjectStore('recentImages');
                }
            };
        });
    }
    
    // Initialize database on load
    initializeDatabase().catch(() => {
        console.log('Database initialization failed, but continuing...');
    });
    
    // Shared functions
    function applyTheme(theme) {
        // Handle custom themes
        if (theme && theme.startsWith('custom-')) {
            const color = theme.replace('custom-', '');
            applyCustomTheme(color);
        } else {
            // Apply preset theme colors
            const themeColors = {
                ocean: {
                    start: '#1e3c72',
                    end: '#2a5298',
                    accent: '#1e3c72',
                    hover: '#2a5298'
                },
                sunset: {
                    start: '#ff6b9d',
                    end: '#feca57',
                    accent: '#ff6b9d',
                    hover: '#ff5a8a'
                },
                sunshine: {
                    start: '#f7e733',
                    end: '#9b59b6',
                    accent: '#f7e733',
                    hover: '#e5d41f'
                },
                neutral: {
                    start: '#9b59b6',
                    end: '#EFB0C9',
                    accent: '#9b59b6',
                    hover: '#8e44ad'
                }
            };
            
            const colors = themeColors[theme];
            if (colors) {
                document.body.style.setProperty('--gradient-start', colors.start);
                document.body.style.setProperty('--gradient-end', colors.end);
                document.body.style.setProperty('--accent-color', colors.accent);
                document.body.style.setProperty('--accent-hover', colors.hover);
                
                updateTextColors(colors.start, colors.end);
            }
        }
    }
    
    function applyCustomTheme(color) {
        const lighterColor = adjustColor(color, 40);
        const darkerColor = adjustColor(color, -20);
        
        document.body.style.setProperty('--gradient-start', color);
        document.body.style.setProperty('--gradient-end', lighterColor);
        document.body.style.setProperty('--accent-color', color);
        document.body.style.setProperty('--accent-hover', darkerColor);
        
        updateTextColors(color, lighterColor);
    }
    
    function adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    function updateTextColors(startColor, endColor) {
        const startBrightness = getBrightness(startColor);
        const endBrightness = getBrightness(endColor);
        const avgBrightness = (startBrightness + endBrightness) / 2;
        
        if (avgBrightness > 128) {
            document.body.style.setProperty('--text-color', '#1a1a1a');
            document.body.style.setProperty('--text-shadow', '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.6)');
        } else {
            document.body.style.setProperty('--text-color', '#ffffff');
            document.body.style.setProperty('--text-shadow', '0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.8)');
        }
    }
    
    function getBrightness(hexColor) {
        const color = hexColor.replace('#', '');
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        
        return Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
    }
    
    function formatDate(dateString) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            return `${day}.${month}.${year}`;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
    
    function getImageFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BirthdayCardDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('images')) {
                    resolve(null);
                    return;
                }
                const transaction = db.transaction(['images'], 'readonly');
                const store = transaction.objectStore('images');
                
                const getRequest = store.get(key);
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    resolve(result ? result.data : null);
                };
                getRequest.onerror = () => reject(getRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
                if (!db.objectStoreNames.contains('recentImages')) {
                    db.createObjectStore('recentImages');
                }
            };
        });
    }
    
    function showCard(cardData) {
        const setupForm = document.getElementById('setup-form');
        const cardSection = document.getElementById('card-section');
        
        // Hide form, show card
        setupForm.style.display = 'none';
        cardSection.style.display = 'block';
        
        // Apply theme
        applyTheme(cardData.theme || 'neutral');
        
        // Populate card with data
        const nameDisplay = document.getElementById('name-display');
        const bdayAge = document.getElementById('bday-age');
        const bdayDate = document.getElementById('bday-date');
        const bdayImg = document.getElementById('bff-img');
        const giftImages = document.querySelectorAll('.gift-img');
        
        if (cardData.name) nameDisplay.textContent = cardData.name;
        if (cardData.age) bdayAge.textContent = cardData.age;
        if (cardData.date) bdayDate.textContent = formatDate(cardData.date);
        if (cardData.imageUrl) {
            bdayImg.src = cardData.imageUrl;
            bdayImg.alt = cardData.name || 'Profile Image';
        }
        
        // Gift interactions
        const handleGiftClick = function() {
            this.classList.toggle('revealed');
        };
        
        const handleGiftKeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('revealed');
            }
        };
        
        giftImages.forEach(gift => {
            gift.addEventListener('click', handleGiftClick, { passive: true });
            gift.addEventListener('keydown', handleGiftKeydown, { passive: true });
        });
        
        // Create new card button
        const createNewBtn = document.getElementById('create-new-btn');
        createNewBtn.addEventListener('click', function() {
            showForm();
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    function showForm() {
        const setupForm = document.getElementById('setup-form');
        const cardSection = document.getElementById('card-section');
        
        // Show form, hide card
        setupForm.style.display = 'block';
        cardSection.style.display = 'none';
        
        // Reset form completely
        const birthdayForm = document.getElementById('birthday-form');
        birthdayForm.reset();
        
        // Reset image input
        imageInput.value = '';
        
        // Reset theme selection
        document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
        themeInput.value = '';
        
        // Reset upload button to camera icon state
        resetUploadButton();
        
        // Reset submit button
        const submitBtn = birthdayForm.querySelector('button[type="submit"]');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Birthday Card';
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    function resetUploadButton() {
        const uploadOption = document.getElementById('custom-upload');
        const currentImage = uploadOption.querySelector('img');
        
        if (currentImage) {
            // Remove the uploaded image and restore camera icon
            currentImage.remove();
            
            // Create and restore camera icon
            const cameraIcon = document.createElement('div');
            cameraIcon.id = 'upload-icon';
            cameraIcon.className = 'upload-icon';
            cameraIcon.textContent = '📷';
            
            // Restore the upload text
            const uploadText = document.getElementById('upload-text');
            uploadText.textContent = 'Upload Photo';
            
            // Insert camera icon back
            uploadOption.insertBefore(cameraIcon, uploadText);
        }
    }
    
    function selectCustomImage(dataUrl, fileName) {
        // Update hidden input
        imageInput.value = dataUrl;
        
        // Find the current upload icon or image
        const uploadOption = document.getElementById('custom-upload');
        const currentIcon = document.getElementById('upload-icon');
        const currentImage = uploadOption.querySelector('img');
        
        // Remove whatever is currently there (icon or image)
        if (currentIcon) {
            currentIcon.remove();
        } else if (currentImage) {
            currentImage.remove();
        }
        
        // Create new image element
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = fileName;
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        
        // Add the new image
        const uploadText = document.getElementById('upload-text');
        uploadOption.insertBefore(img, uploadText);
        
        // Update text
        uploadText.textContent = fileName;
        
        // Try to save as recent image with fallback
        try {
            localStorage.setItem('recentProfileImage', dataUrl);
            localStorage.setItem('recentProfileImageName', fileName);
            console.log('Saved recent image to localStorage');
        } catch (quotaError) {
            console.log('LocalStorage quota exceeded, using sessionStorage fallback');
            try {
                sessionStorage.setItem('recentProfileImage', dataUrl);
                sessionStorage.setItem('recentProfileImageName', fileName);
                console.log('Saved recent image to sessionStorage');
            } catch (sessionError) {
                console.log('SessionStorage also failed, using IndexedDB fallback');
                storeRecentImageInIndexedDB(dataUrl, fileName);
            }
        }
    }
    
    function loadCardData(cardId) {
        // Try sessionStorage first
        let cardDataStr = sessionStorage.getItem(cardId);
        let cardData;
        
        if (cardDataStr) {
            console.log('Found data in sessionStorage');
            cardData = JSON.parse(cardDataStr);
            showCard(cardData);
            return;
        }
        
        // Try localStorage
        cardDataStr = localStorage.getItem(cardId);
        if (cardDataStr) {
            console.log('Found data in localStorage');
            cardData = JSON.parse(cardDataStr);
            
            // Try to get compressed image from sessionStorage
            const compressedImage = sessionStorage.getItem(cardId + '_img');
            if (compressedImage) {
                cardData.imageUrl = compressedImage;
                console.log('Found compressed image in sessionStorage');
                showCard(cardData);
                return;
            }
            
            // Try to get image from IndexedDB
            getImageFromIndexedDB(cardId).then(imageData => {
                if (imageData) {
                    cardData.imageUrl = imageData;
                    console.log('Found image in IndexedDB');
                    showCard(cardData);
                } else {
                    console.log('No image found in IndexedDB');
                    showCard(cardData);
                }
            }).catch(() => {
                console.log('IndexedDB access failed');
                showCard(cardData);
            });
        } else {
            console.log('No card data found, showing form');
            showForm();
        }
    }
    
    // Form handling
    const setupForm = document.getElementById('setup-form');
    const birthdayForm = document.getElementById('birthday-form');
    const submitBtn = birthdayForm.querySelector('button[type="submit"]');
    
    // Theme elements
    const themeOptions = document.querySelectorAll('.theme-option');
    const themeInput = document.getElementById('theme-input');
    const customColorPicker = document.getElementById('custom-color-picker');
    const customTheme = document.getElementById('custom-theme');
    
    // Image elements
    const imageOptions = document.querySelectorAll('.image-option');
    const imageInput = document.getElementById('image-input');
    const fileInput = document.getElementById('file-input');
    const customUpload = document.getElementById('custom-upload');
    
    // Form elements
    const nameInput = document.getElementById('name-input');
    const dateInput = document.getElementById('date-input');
    
    function calculateAge(birthDate) {
        // Handle DD-MM-YYYY format by converting to MM-DD-YYYY
        let dateToParse = birthDate;
        if (birthDate.includes('-')) {
            const parts = birthDate.split('-');
            if (parts.length === 3) {
                dateToParse = `${parts[1]}-${parts[0]}-${parts[2]}`;
            }
        }
        
        const today = new Date();
        const birth = new Date(dateToParse);
        
        // If date is invalid, return null
        if (isNaN(birth.getTime())) {
            return null;
        }
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            const theme = this.dataset.theme;
            if (theme) {
                themeInput.value = theme;
                applyTheme(theme);
            }
        });
    });
    
    // Custom color picker
    customColorPicker.addEventListener('input', function() {
        const color = this.value;
        
        themeOptions.forEach(opt => {
            if (opt !== customTheme) {
                opt.classList.remove('selected');
            }
        });
        
        customTheme.classList.add('selected');
        themeInput.value = 'custom-' + color;
        applyTheme('custom-' + color);
    });
    
    // Make custom theme clickable when not clicking the color input
    customTheme.addEventListener('click', function(e) {
        if (e.target !== customColorPicker) {
            customColorPicker.click();
        }
    });
    
    // Image selection
    customUpload.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File upload
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                selectCustomImage(dataUrl, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Date input auto-advance functionality
    const dateInputElement = document.getElementById('date-input');
    if (dateInputElement) {
        dateInputElement.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                formattedValue = value.substring(0, 2);
                if (value.length > 2) {
                    formattedValue += '-' + value.substring(2, 4);
                }
                if (value.length > 4) {
                    formattedValue += '-' + value.substring(4, 8);
                }
            }
            
            e.target.value = formattedValue;
            
            if (value.length === 2) {
                e.target.setSelectionRange(3, 3);
            } else if (value.length === 4) {
                e.target.setSelectionRange(6, 6);
            }
        });
        
        dateInputElement.addEventListener('keydown', function(e) {
            const value = e.target.value;
            const cursorPos = e.target.selectionStart;
            
            if (e.key === 'Backspace') {
                if (cursorPos > 0 && value[cursorPos - 1] === '-') {
                    e.preventDefault();
                    const newValue = value.substring(0, cursorPos - 1) + value.substring(cursorPos);
                    e.target.value = newValue;
                    e.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
                }
            }
        });
        
        dateInputElement.addEventListener('blur', function(e) {
            const value = e.target.value;
            const cleanValue = value.replace(/\D/g, '');
            
            if (cleanValue.length === 8) {
                const day = cleanValue.substring(0, 2);
                const month = cleanValue.substring(2, 4);
                const year = cleanValue.substring(4, 8);
                e.target.value = `${day}-${month}-${year}`;
            } else if (cleanValue.length > 4) {
                const day = cleanValue.substring(0, 2);
                const month = cleanValue.substring(2, 4);
                const year = cleanValue.substring(4);
                e.target.value = `${day}-${month}-${year}`;
            } else if (cleanValue.length > 2) {
                const day = cleanValue.substring(0, 2);
                const month = cleanValue.substring(2, 4);
                e.target.value = `${day}-${month}`;
            } else if (cleanValue.length > 0) {
                e.target.value = cleanValue;
            }
        });
    }
    
    // IndexedDB functions
    function storeImageInIndexedDB(key, imageData) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BirthdayCardDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                
                const addRequest = store.put({ data: imageData }, key);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
                if (!db.objectStoreNames.contains('recentImages')) {
                    db.createObjectStore('recentImages');
                }
            };
        });
    }
    
    function storeRecentImageInIndexedDB(imageData, fileName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BirthdayCardDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['recentImages'], 'readwrite');
                const store = transaction.objectStore('recentImages');
                
                const addRequest = store.put({ data: imageData, name: fileName }, 'recent');
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
                if (!db.objectStoreNames.contains('recentImages')) {
                    db.createObjectStore('recentImages');
                }
            };
        });
    }
    
    function compressImageWithCanvas(dataUrl, quality = 0.3, maxWidth = 400) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    }
    
    // Form submission
    birthdayForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        
        try {
            const name = nameInput.value;
            const date = dateInputElement.value;
            const theme = themeInput.value;
            const imageUrl = imageInput.value;
            
            const age = calculateAge(date);
            
            if (!name || !date || !imageUrl) {
                throw new Error('Please fill in all required fields and upload a profile image.');
            }
            
            const cardId = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Store card data with fallback methods
            try {
                const cardData = {
                    name: name,
                    age: age,
                    date: date,
                    theme: theme,
                    imageUrl: imageUrl,
                    timestamp: new Date().toISOString()
                };
                sessionStorage.setItem(cardId, JSON.stringify(cardData));
                console.log('Stored in sessionStorage');
                
                // Show the card immediately
                showCard(cardData);
                
                // Update URL for sharing
                window.history.pushState({}, '', `?id=${cardId}`);
                
            } catch (sessionError) {
                console.log('SessionStorage failed, using IndexedDB fallback');
                
                const cardData = {
                    name: name,
                    age: age,
                    date: date,
                    theme: theme,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(cardId, JSON.stringify(cardData));
                
                storeImageInIndexedDB(cardId, imageUrl).then(() => {
                    console.log('Stored image in IndexedDB');
                    showCard(cardData);
                    window.history.pushState({}, '', `?id=${cardId}`);
                }).catch(() => {
                    console.log('IndexedDB failed, using canvas compression');
                    
                    compressImageWithCanvas(imageUrl).then(compressedUrl => {
                        try {
                            sessionStorage.setItem(cardId + '_img', compressedUrl);
                            console.log('Stored compressed image in sessionStorage');
                        } catch (compressedError) {
                            console.log('Even compressed image failed, using minimal card');
                            localStorage.setItem(cardId + '_noimg', 'true');
                        }
                        
                        showCard(cardData);
                        window.history.pushState({}, '', `?id=${cardId}`);
                    });
                });
            }
            
        } catch (error) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            submitBtn.textContent = 'Error: ' + error.message;
            setTimeout(() => {
                submitBtn.textContent = originalText;
            }, 3000);
            
            console.error('Form submission error:', error);
        }
    });
    
    // Load saved data
    function loadSavedCard() {
        // Load the most recent image if it exists
        let recentImage = localStorage.getItem('recentProfileImage');
        let recentImageName = localStorage.getItem('recentProfileImageName');
        
        if (!recentImage) {
            // Try sessionStorage
            recentImage = sessionStorage.getItem('recentProfileImage');
            recentImageName = sessionStorage.getItem('recentProfileImageName');
        }
        
        if (!recentImage) {
            // Try IndexedDB
            getRecentImageFromIndexedDB().then(result => {
                if (result) {
                    recentImage = result.data;
                    recentImageName = result.name;
                    restoreRecentImage(recentImage, recentImageName);
                }
            }).catch(() => {
                console.log('No recent image found in any storage');
            });
        } else {
            restoreRecentImage(recentImage, recentImageName);
        }
        
        // Don't set default theme - let user choose
        console.log('No default theme set - user must choose');
    }
    
    function restoreRecentImage(recentImage, recentImageName) {
        // Replace camera icon with recent image
        const uploadIcon = document.getElementById('upload-icon');
        const uploadText = document.getElementById('upload-text');
        
        // Create image element to replace camera icon
        const img = document.createElement('img');
        img.src = recentImage;
        img.alt = recentImageName;
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        
        // Replace camera icon with image
        uploadIcon.parentNode.replaceChild(img, uploadIcon);
        
        // Update text
        uploadText.textContent = recentImageName;
        
        // Update the hidden input to use the recent image
        imageInput.value = recentImage;
    }
    
    function getRecentImageFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BirthdayCardDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('recentImages')) {
                    resolve(null);
                    return;
                }
                const transaction = db.transaction(['recentImages'], 'readonly');
                const store = transaction.objectStore('recentImages');
                
                const getRequest = store.get('recent');
                getRequest.onsuccess = () => resolve(getRequest.result);
                getRequest.onerror = () => reject(getRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
                if (!db.objectStoreNames.contains('recentImages')) {
                    db.createObjectStore('recentImages');
                }
            };
        });
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', function(e) {
        const urlParams = new URLSearchParams(window.location.search);
        const cardId = urlParams.get('id');
        
        if (cardId) {
            loadCardData(cardId);
        } else {
            showForm();
        }
    });
    
    // Initialize
    if (cardId) {
        // Load existing card from URL
        loadCardData(cardId);
    } else {
        // Show form and load recent images
        showForm();
        loadSavedCard();
        loadRecentImages(); // Load recent images gallery
    }
    
    // Preload critical images
    const criticalImages = [
        '/images/gift-cover.jpg',
        '/images/happy.gif',
        '/images/hot.gif',
        '/images/genius.gif',
        '/images/badass.gif',
        '/images/cheers.gif'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});
