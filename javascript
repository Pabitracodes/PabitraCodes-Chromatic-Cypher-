/**
 * Pabitra Chromatic Cipher - JavaScript Implementation
 * Advanced color-based substitution cipher with HSV encoding
 */

class PabitraChromaCipher {
    constructor() {
        this.encodingMap = this.buildEncodingMap();
        this.decodingMap = this.buildDecodingMap();
        this.settings = {
            showUnmapped: true,
            layout: 'strip',
            theme: 'light'
        };
        
        this.initializeElements();
        this.bindEvents();
        this.applyInitialSettings();
    }

    /**
     * Build the character to HSV encoding map
     */
    buildEncodingMap() {
        const map = new Map();

        // Uppercase letters A-Z: Hue=234, Saturation=84%, Value=30-155 (steps of 5)
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < uppercase.length; i++) {
            map.set(uppercase[i], {
                hue: 234,
                saturation: 84,
                value: 30 + (i * 5)
            });
        }

        // Lowercase letters a-z: Hue=90, Saturation=84%, Value=30-155 (steps of 5)
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < lowercase.length; i++) {
            map.set(lowercase[i], {
                hue: 90,
                saturation: 84,
                value: 30 + (i * 5)
            });
        }

        // Numbers 0-9: Hue=1, Saturation=84%, Value=30-165 (steps of 15)
        const numbers = '0123456789';
        for (let i = 0; i < numbers.length; i++) {
            map.set(numbers[i], {
                hue: 1,
                saturation: 84,
                value: 30 + (i * 15)
            });
        }

        // Special characters with distinct hues
        const specialChars = {
            ' ': { hue: 0, saturation: 84, value: 50 },
            '.': { hue: 300, saturation: 84, value: 60 },
            ',': { hue: 60, saturation: 84, value: 65 },
            '?': { hue: 180, saturation: 84, value: 70 },
            '!': { hue: 15, saturation: 84, value: 75 },
            ':': { hue: 45, saturation: 84, value: 80 },
            ';': { hue: 75, saturation: 84, value: 85 },
            "'": { hue: 105, saturation: 84, value: 90 },
            '"': { hue: 135, saturation: 84, value: 95 },
            '-': { hue: 165, saturation: 84, value: 100 },
            '_': { hue: 195, saturation: 84, value: 105 },
            '/': { hue: 225, saturation: 84, value: 110 },
            '\\': { hue: 255, saturation: 84, value: 115 },
            '(': { hue: 285, saturation: 84, value: 120 },
            ')': { hue: 285, saturation: 84, value: 120 },
            '[': { hue: 315, saturation: 84, value: 125 },
            ']': { hue: 315, saturation: 84, value: 125 },
            '{': { hue: 345, saturation: 84, value: 130 },
            '}': { hue: 345, saturation: 84, value: 130 }
        };

        for (const [char, hsv] of Object.entries(specialChars)) {
            map.set(char, hsv);
        }

        return map;
    }

    /**
     * Build the HSV to character decoding map
     */
    buildDecodingMap() {
        const map = new Map();
        for (const [char, hsv] of this.encodingMap) {
            const key = `${hsv.hue}-${hsv.saturation}-${hsv.value}`;
            map.set(key, char);
        }
        return map;
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            inputText: document.getElementById('inputText'),
            encodeBtn: document.getElementById('encodeBtn'),
            decodeBtn: document.getElementById('decodeBtn'),
            copyHexBtn: document.getElementById('copyHexBtn'),
            copyMessageBtn: document.getElementById('copyMessageBtn'),
            colorBlocks: document.getElementById('colorBlocks'),
            decodedMessage: document.getElementById('decodedMessage'),
            showUnmappedToggle: document.getElementById('showUnmappedToggle'),
            layoutToggle: document.getElementById('layoutToggle'),
            themeToggle: document.getElementById('themeToggle'),
            tooltip: document.getElementById('tooltip')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Main action buttons
        this.elements.encodeBtn.addEventListener('click', () => this.encodeMessage());
        this.elements.decodeBtn.addEventListener('click', () => this.decodeFromBlocks());
        this.elements.copyHexBtn.addEventListener('click', () => this.copyHexPalette());
        this.elements.copyMessageBtn.addEventListener('click', () => this.copyDecodedMessage());

        // Toggle switches
        this.elements.showUnmappedToggle.addEventListener('change', (e) => {
            this.settings.showUnmapped = e.target.checked;
            this.updateColorBlocks();
        });

        this.elements.layoutToggle.addEventListener('change', (e) => {
            this.settings.layout = e.target.checked ? 'grid' : 'strip';
            this.elements.colorBlocks.setAttribute('data-layout', this.settings.layout);
        });

        this.elements.themeToggle.addEventListener('change', (e) => {
            this.settings.theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-color-scheme', this.settings.theme);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.encodeMessage();
            }
        });

        this.elements.inputText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.encodeMessage();
            }
        });

        // Tooltip events
        document.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
        document.addEventListener('scroll', () => this.hideTooltip());
    }

    /**
     * Apply initial settings
     */
    applyInitialSettings() {
        this.elements.showUnmappedToggle.checked = this.settings.showUnmapped;
        this.elements.layoutToggle.checked = this.settings.layout === 'grid';
        this.elements.themeToggle.checked = this.settings.theme === 'dark';
        this.elements.colorBlocks.setAttribute('data-layout', this.settings.layout);
        document.documentElement.setAttribute('data-color-scheme', this.settings.theme);
    }

    /**
     * Convert HSV to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} v - Value (0-100)
     * @returns {Object} RGB values (0-255)
     */
    hsvToRgb(h, s, v) {
        h = h / 360;
        s = s / 100;
        v = v / 100;

        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = v - c;

        let r, g, b;

        if (h < 1/6) {
            r = c; g = x; b = 0;
        } else if (h < 2/6) {
            r = x; g = c; b = 0;
        } else if (h < 3/6) {
            r = 0; g = c; b = x;
        } else if (h < 4/6) {
            r = 0; g = x; b = c;
        } else if (h < 5/6) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    /**
     * Convert RGB to HEX
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} HEX color code
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Get color data for a character
     * @param {string} char - Character to encode
     * @returns {Object} Color data with HSV, RGB, and HEX
     */
    getCharacterColor(char) {
        let hsv;
        
        if (this.encodingMap.has(char)) {
            hsv = this.encodingMap.get(char);
        } else {
            // Unmapped character - use gray
            hsv = { hue: 0, saturation: 0, value: 128 };
        }

        const rgb = this.hsvToRgb(hsv.hue, hsv.saturation, hsv.value);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

        return { char, hsv, rgb, hex };
    }

    /**
     * Encode the input message to color blocks
     */
    encodeMessage() {
        const text = this.elements.inputText.value;
        
        if (!text) {
            this.showEmptyState('Enter some text to encode');
            return;
        }

        // Add loading state
        this.elements.encodeBtn.classList.add('loading');
        
        setTimeout(() => {
            const colorData = [];
            
            for (const char of text) {
                const color = this.getCharacterColor(char);
                
                // Skip unmapped characters if setting is disabled
                if (!this.settings.showUnmapped && !this.encodingMap.has(char)) {
                    continue;
                }
                
                colorData.push(color);
            }

            this.renderColorBlocks(colorData);
            this.elements.encodeBtn.classList.remove('loading');
        }, 100);
    }

    /**
     * Render color blocks in the output area
     * @param {Array} colorData - Array of color data objects
     */
    renderColorBlocks(colorData) {
        if (colorData.length === 0) {
            this.showEmptyState('No characters to display');
            return;
        }

        const blocksContainer = document.createElement('div');
        blocksContainer.className = 'color-blocks';

        colorData.forEach((color, index) => {
            const block = document.createElement('div');
            block.className = 'color-block';
            block.style.backgroundColor = color.hex;
            block.setAttribute('data-hsv', `${color.hsv.hue}-${color.hsv.saturation}-${color.hsv.value}`);
            block.setAttribute('data-char', color.char);
            block.setAttribute('data-hex', color.hex);
            block.setAttribute('tabindex', '0');
            block.setAttribute('role', 'button');
            block.setAttribute('aria-label', `Character: ${color.char === ' ' ? 'space' : color.char}`);

            // Add hover events for tooltip
            block.addEventListener('mouseenter', (e) => this.showTooltip(e, color));
            block.addEventListener('mouseleave', () => this.hideTooltip());
            block.addEventListener('focus', (e) => this.showTooltip(e, color));
            block.addEventListener('blur', () => this.hideTooltip());

            blocksContainer.appendChild(block);
        });

        // Replace content
        this.elements.colorBlocks.innerHTML = '';
        this.elements.colorBlocks.appendChild(blocksContainer);
    }

    /**
     * Show empty state message
     * @param {string} message - Message to display
     */
    showEmptyState(message) {
        this.elements.colorBlocks.innerHTML = `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Update color blocks display when settings change
     */
    updateColorBlocks() {
        const text = this.elements.inputText.value;
        if (text) {
            this.encodeMessage();
        }
    }

    /**
     * Show tooltip with character information
     * @param {Event} e - Mouse or focus event
     * @param {Object} color - Color data object
     */
    showTooltip(e, color) {
        const tooltip = this.elements.tooltip;
        const charDisplay = color.char === ' ' ? 'Space' : color.char;
        
        tooltip.querySelector('.tooltip-char').textContent = `Character: '${charDisplay}'`;
        tooltip.querySelector('.tooltip-hsv').textContent = 
            `HSV: (${color.hsv.hue}°, ${color.hsv.saturation}%, ${color.hsv.value})`;
        tooltip.querySelector('.tooltip-hex').textContent = `HEX: ${color.hex}`;
        
        tooltip.classList.add('visible');
        this.updateTooltipPosition(e);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.elements.tooltip.classList.remove('visible');
    }

    /**
     * Update tooltip position
     * @param {Event} e - Mouse event
     */
    updateTooltipPosition(e) {
        if (!this.elements.tooltip.classList.contains('visible')) return;

        const tooltip = this.elements.tooltip;
        const offset = 10;
        
        tooltip.style.left = e.clientX + offset + 'px';
        tooltip.style.top = e.clientY - tooltip.offsetHeight - offset + 'px';

        // Adjust if tooltip goes outside viewport
        const rect = tooltip.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            tooltip.style.left = e.clientX - tooltip.offsetWidth - offset + 'px';
        }
        if (rect.top < 0) {
            tooltip.style.top = e.clientY + offset + 'px';
        }
    }

    /**
     * Decode color blocks back to text
     */
    decodeFromBlocks() {
        const blocks = this.elements.colorBlocks.querySelectorAll('.color-block');
        
        if (blocks.length === 0) {
            this.elements.decodedMessage.value = '';
            return;
        }

        let decodedText = '';
        
        blocks.forEach(block => {
            const hsvData = block.getAttribute('data-hsv');
            const originalChar = block.getAttribute('data-char');
            
            if (this.decodingMap.has(hsvData)) {
                decodedText += this.decodingMap.get(hsvData);
            } else {
                // Fallback to original character for unmapped
                decodedText += originalChar || '?';
            }
        });

        this.elements.decodedMessage.value = decodedText;
    }

    /**
     * Copy hex color palette to clipboard
     */
    async copyHexPalette() {
        const blocks = this.elements.colorBlocks.querySelectorAll('.color-block');
        
        if (blocks.length === 0) {
            this.showNotification('No colors to copy');
            return;
        }

        const hexColors = Array.from(blocks).map(block => 
            block.getAttribute('data-hex')
        );
        
        const uniqueColors = [...new Set(hexColors)];
        const colorString = uniqueColors.join(', ');

        try {
            await navigator.clipboard.writeText(colorString);
            this.showNotification('Hex palette copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy palette');
        }
    }

    /**
     * Copy decoded message to clipboard
     */
    async copyDecodedMessage() {
        const message = this.elements.decodedMessage.value;
        
        if (!message) {
            this.showNotification('No decoded message to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(message);
            this.showNotification('Decoded message copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy message');
        }
    }

    /**
     * Show notification message
     * @param {string} message - Notification text
     */
    showNotification(message) {
        // Create temporary notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-primary);
            color: var(--color-btn-primary-text);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PabitraChromaCipher();
});
