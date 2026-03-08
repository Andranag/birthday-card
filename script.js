document.addEventListener('DOMContentLoaded', function() {
    const setupForm = document.getElementById('setup-form');
    const birthdayCard = document.getElementById('birthday-card');
    const birthdayForm = document.getElementById('birthday-form');
    const resetBtn = document.getElementById('reset-btn');
    const giftImages = document.querySelectorAll('.gift-img');
    const imageOptions = document.querySelectorAll('.image-option');
    const selectedPreview = document.getElementById('selected-image-preview');
    const selectedName = document.getElementById('selected-image-name');
    const imageInput = document.getElementById('image-input');
    const fileInput = document.getElementById('file-input');
    const customUpload = document.getElementById('custom-upload');
    const genderOptions = document.querySelectorAll('.gender-option');
    const genderInput = document.getElementById('gender-input');
    const backgroundOptions = document.querySelectorAll('.background-option');
    const selectedBgPreview = document.getElementById('selected-bg-preview');
    const selectedBgName = document.getElementById('selected-bg-name');
    const backgroundInput = document.getElementById('background-input');
    const bgFileInput = document.getElementById('bg-file-input');
    const bgCustomUpload = document.getElementById('bg-custom-upload');
    const recentPhotos = document.getElementById('recent-photos');
    const recentPhotoImg = document.getElementById('recent-photo-img');
    const recentPhotoLabel = document.getElementById('recent-photo-label');
    const prevPhotoBtn = document.getElementById('prev-photo');
    const nextPhotoBtn = document.getElementById('next-photo');
    
    // Photo history management
    let photoHistory = [];
    let currentPhotoIndex = 0;
    
    // Load saved data from localStorage
    loadSavedCard();
    loadPhotoHistory();
    
    // Photo navigation
    recentPhotos.addEventListener('click', function() {
        selectRecentPhoto();
    });
    
    prevPhotoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navigatePhotoHistory(-1);
    });
    
    nextPhotoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navigatePhotoHistory(1);
    });
    
    function loadPhotoHistory() {
        const saved = localStorage.getItem('photoHistory');
        if (saved) {
            photoHistory = JSON.parse(saved);
        } else {
            // Initialize with default photo
            photoHistory = [{
                url: 'images/sofia.jpg',
                name: 'Default',
                timestamp: new Date().toISOString()
            }];
        }
        updateRecentPhotoDisplay();
    }
    
    function savePhotoHistory() {
        localStorage.setItem('photoHistory', JSON.stringify(photoHistory));
    }
    
    function addToPhotoHistory(imageUrl, imageName) {
        // Check if image already exists in history
        const existingIndex = photoHistory.findIndex(photo => photo.url === imageUrl);
        if (existingIndex !== -1) {
            // Move to front if exists
            photoHistory.splice(existingIndex, 1);
        }
        
        // Add to front
        photoHistory.unshift({
            url: imageUrl,
            name: imageName,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 photos
        if (photoHistory.length > 10) {
            photoHistory = photoHistory.slice(0, 10);
        }
        
        currentPhotoIndex = 0;
        updateRecentPhotoDisplay();
        savePhotoHistory();
    }
    
    function updateRecentPhotoDisplay() {
        if (photoHistory.length === 0) return;
        
        const currentPhoto = photoHistory[currentPhotoIndex];
        recentPhotoImg.src = currentPhoto.url;
        
        // Update label
        if (photoHistory.length === 1) {
            recentPhotoLabel.textContent = 'Recent';
        } else {
            recentPhotoLabel.textContent = `${currentPhotoIndex + 1}/${photoHistory.length}`;
        }
        
        // Update button states
        prevPhotoBtn.disabled = currentPhotoIndex === 0;
        nextPhotoBtn.disabled = currentPhotoIndex === photoHistory.length - 1;
        
        // Update hidden input
        imageInput.value = currentPhoto.url;
    }
    
    function navigatePhotoHistory(direction) {
        const newIndex = currentPhotoIndex + direction;
        if (newIndex >= 0 && newIndex < photoHistory.length) {
            currentPhotoIndex = newIndex;
            updateRecentPhotoDisplay();
            selectRecentPhoto();
        }
    }
    
    function selectRecentPhoto() {
        // Remove previous selection
        imageOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to recent photos
        recentPhotos.classList.add('selected');
        
        // Update preview
        const currentPhoto = photoHistory[currentPhotoIndex];
        selectedPreview.src = currentPhoto.url;
        selectedName.textContent = currentPhoto.name;
        imageInput.value = currentPhoto.url;
    }
    
    // Gender selection
    genderOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectGender(this);
        });
    });
    
    function selectGender(option) {
        // Remove previous selection
        genderOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        
        // Update hidden input
        const gender = option.dataset.gender;
        genderInput.value = gender;
        
        // Apply theme
        applyTheme(gender);
    }
    
    function applyTheme(gender) {
        // Remove all theme classes
        document.body.classList.remove('masculine-theme', 'feminine-theme', 'nonbinary-theme', 'neutral-theme');
        
        // Add new theme class
        document.body.classList.add(`${gender}-theme`);
    }
    
    // Background selection
    backgroundOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (this.id === 'bg-custom-upload') {
                bgFileInput.click();
            } else {
                selectBackground(this);
            }
        });
    });
    
    // Background file upload
    bgFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                selectCustomBackground(dataUrl, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
    
    function selectBackground(option) {
        // Remove previous selection
        backgroundOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        
        // Update preview
        const backgroundValue = option.dataset.background;
        const backgroundName = option.querySelector('span').textContent;
        
        selectedBgPreview.style.background = backgroundValue.startsWith('gradient') ? 
            'linear-gradient(purple, #EFB0C9)' : 
            `url('${backgroundValue}')`;
        selectedBgPreview.style.backgroundSize = 'cover';
        selectedBgPreview.style.backgroundPosition = 'center';
        
        selectedBgName.textContent = backgroundName;
        backgroundInput.value = backgroundValue;
    }
    
    function selectCustomBackground(dataUrl, fileName) {
        // Remove previous selection
        backgroundOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to upload option
        bgCustomUpload.classList.add('selected');
        
        // Update preview
        selectedBgPreview.style.background = `url('${dataUrl}')`;
        selectedBgPreview.style.backgroundSize = 'cover';
        selectedBgPreview.style.backgroundPosition = 'center';
        
        selectedBgName.textContent = fileName;
        backgroundInput.value = dataUrl;
    }
    
    // Image selection
    imageOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (this.id === 'custom-upload') {
                fileInput.click();
            } else if (this.id === 'recent-photos') {
                selectRecentPhoto();
            } else {
                selectImage(this);
            }
        });
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
    
    function selectImage(option) {
        // Remove previous selection
        imageOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        
        // Update preview
        const imageUrl = option.dataset.image;
        const imageName = option.querySelector('span').textContent;
        
        selectedPreview.src = imageUrl;
        selectedName.textContent = imageName;
        imageInput.value = imageUrl;
    }
    
    function selectCustomImage(dataUrl, fileName) {
        // Remove previous selection
        imageOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to upload option
        customUpload.classList.add('selected');
        
        // Update preview
        selectedPreview.src = dataUrl;
        selectedName.textContent = fileName;
        imageInput.value = dataUrl;
        
        // Add to photo history
        addToPhotoHistory(dataUrl, fileName);
    }
    
    // Form submission
    birthdayForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name-input').value;
        const age = document.getElementById('age-input').value;
        const date = document.getElementById('date-input').value;
        const gender = genderInput.value;
        const imageUrl = imageInput.value;
        const backgroundValue = backgroundInput.value;
        
        // Add current image to history if it's not already there
        if (imageUrl && !photoHistory.some(photo => photo.url === imageUrl)) {
            const imageName = selectedName.textContent;
            addToPhotoHistory(imageUrl, imageName);
        }
        
        // Update card content
        document.getElementById('name-display').textContent = name;
        document.getElementById('bday-age').textContent = `${age} years old`;
        document.getElementById('bday-date').textContent = formatDate(date);
        
        // Update image
        document.getElementById('bff-img').src = imageUrl;
        
        // Apply theme to card
        applyTheme(gender);
        
        // Apply background
        applyBackground(backgroundValue);
        
        // Save to localStorage
        saveCardData(name, age, date, gender, imageUrl, backgroundValue);
        
        // Show card, hide form
        setupForm.classList.add('hidden');
        birthdayCard.classList.remove('hidden');
        
        // Reset gift reveals
        resetGifts();
    });
    
    function applyBackground(backgroundValue) {
        if (backgroundValue === 'gradient') {
            document.body.classList.remove('has-custom-background');
            document.body.style.background = '';
        } else {
            document.body.classList.add('has-custom-background');
            document.body.style.background = `url('${backgroundValue}') no-repeat center center/cover fixed`;
        }
    }
    
    // Reset button
    resetBtn.addEventListener('click', function() {
        setupForm.classList.remove('hidden');
        birthdayCard.classList.add('hidden');
        birthdayForm.reset();
        
        // Reset to most recent photo
        currentPhotoIndex = 0;
        updateRecentPhotoDisplay();
        selectRecentPhoto();
        
        // Reset gender to neutral
        const neutralOption = document.querySelector('[data-gender="neutral"]');
        selectGender(neutralOption);
        
        // Reset background to gradient
        const gradientOption = document.querySelector('[data-background="gradient"]');
        selectBackground(gradientOption);
        
        // Reset background display
        document.body.classList.remove('has-custom-background');
        document.body.style.background = '';
    });
    
    // Gift interactions
    giftImages.forEach(gift => {
        gift.addEventListener('click', function() {
            this.classList.toggle('revealed');
        });
        
        gift.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('revealed');
            }
        });
    });
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
    
    function saveCardData(name, age, date, gender, imageUrl, backgroundValue) {
        const cardData = {
            name,
            age,
            date,
            gender,
            imageUrl,
            backgroundValue,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('birthdayCardData', JSON.stringify(cardData));
    }
    
    function loadSavedCard() {
        const savedData = localStorage.getItem('birthdayCardData');
        if (savedData) {
            const cardData = JSON.parse(savedData);
            
            // Check if data is from today (optional: you can remove this check)
            const today = new Date().toDateString();
            const savedDate = new Date(cardData.timestamp).toDateString();
            
            if (today === savedDate) {
                // Populate form with saved data
                document.getElementById('name-input').value = cardData.name;
                document.getElementById('age-input').value = cardData.age;
                document.getElementById('date-input').value = cardData.date;
                
                // Set gender
                if (cardData.gender) {
                    const genderOption = document.querySelector(`[data-gender="${cardData.gender}"]`);
                    if (genderOption) {
                        selectGender(genderOption);
                    }
                }
                
                // Set image
                imageInput.value = cardData.imageUrl;
                selectedPreview.src = cardData.imageUrl;
                
                // Find and select matching option or mark as custom
                let found = false;
                imageOptions.forEach(option => {
                    if (option.dataset.image === cardData.imageUrl) {
                        selectImage(option);
                        found = true;
                    }
                });
                
                if (!found) {
                    selectedName.textContent = 'Custom Image';
                    customUpload.classList.add('selected');
                }
                
                // Set background
                if (cardData.backgroundValue) {
                    backgroundInput.value = cardData.backgroundValue;
                    
                    // Find and select matching background option
                    let bgFound = false;
                    backgroundOptions.forEach(option => {
                        if (option.dataset.background === cardData.backgroundValue) {
                            selectBackground(option);
                            bgFound = true;
                        }
                    });
                    
                    if (!bgFound) {
                        selectedBgName.textContent = 'Custom Background';
                        selectedBgPreview.style.background = `url('${cardData.backgroundValue}')`;
                        selectedBgPreview.style.backgroundSize = 'cover';
                        selectedBgPreview.style.backgroundPosition = 'center';
                        bgCustomUpload.classList.add('selected');
                    }
                }
                
                // Auto-submit the form to show the card
                birthdayForm.dispatchEvent(new Event('submit'));
            }
        }
    }
    
    function resetGifts() {
        giftImages.forEach(gift => {
            gift.classList.remove('revealed');
        });
    }
});
