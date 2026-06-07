/**
 * BurgerPrints AI Mockup Generator - i18n & Localization Service
 * Manages translation files loading and dynamic DOM localization
 */

class I18NService {
  constructor() {
    this.translations = {};
    this.currentLanguage = 'vi';
  }

  /**
   * Initialize i18n service
   */
  async init() {
    // 1. Get saved language setting (default to 'vi')
    try {
      const { settings } = await chrome.storage.local.get('settings');
      this.currentLanguage = settings?.language || 'vi';
    } catch (err) {
      console.warn('[i18n] Failed to read settings from storage, using default "vi"', err);
      this.currentLanguage = 'vi';
    }

    // 2. Load translations
    await this.loadTranslations(this.currentLanguage);

    // 3. Localize current document
    this.localizeDocument();
  }

  /**
   * Load translations file from extension package
   */
  async loadTranslations(lang) {
    try {
      const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.translations = await response.json();
      this.currentLanguage = lang;
      console.log(`[i18n] Loaded translations for: ${lang}`);
    } catch (err) {
      console.error(`[i18n] Failed to load translations for: ${lang}, falling back to chrome.i18n`, err);
      this.translations = {};
      this.currentLanguage = lang;
    }
  }

  /**
   * Translate a key with optional placeholders
   */
  t(key, placeholders = []) {
    // 1. Try custom translation object first (enables dynamic changes)
    let message = this.translations[key]?.message;

    // 2. Fallback to native chrome.i18n if UI language matches or translations failed
    if (!message) {
      message = chrome.i18n.getMessage(key);
    }

    // 3. Fallback to key itself if not found
    if (!message) {
      return key;
    }

    // Replace placeholders ($1, $2, etc.)
    if (placeholders.length > 0) {
      placeholders.forEach((val, i) => {
        message = message.replace(new RegExp(`\\$${i + 1}`, 'g'), val);
      });
    }

    return message;
  }

  /**
   * Localize all elements in the document based on data attributes
   */
  localizeDocument() {
    document.documentElement.setAttribute('lang', this.currentLanguage);

    // 1. Localize text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation !== key) {
        // If element has no children, safely replace textContent.
        // Otherwise, if it has a specific text node structure or we want to preserve sub-HTML,
        // we replace innerHTML or only text node.
        // For our app, we place data-i18n on leaf nodes, so textContent is safest.
        if (el.children.length === 0) {
          el.textContent = translation;
        } else {
          // If element has icon/spans inside, replace elements having specific text classes
          const textSpan = el.querySelector('.sp-btn__text, .sp-tab-btn__text, .sp-switch__label');
          if (textSpan) {
            textSpan.textContent = translation;
          } else {
            // Fallback for simple elements with icons mixed inside text (but no structured spans)
            // e.g. "📷 Product". We only replace if it's safe.
            el.innerHTML = translation;
          }
        }
      }
    });

    // 2. Localize placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation !== key) {
        el.setAttribute('placeholder', translation);
      }
    });

    // 3. Localize tooltips (title attribute)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation !== key) {
        el.setAttribute('title', translation);
      }
    });
  }

  /**
   * Change UI language and localize page dynamically
   */
  async changeLanguage(lang) {
    if (lang === this.currentLanguage) return;
    await this.loadTranslations(lang);
    this.localizeDocument();

    // Trigger window event so other scripts can handle language-specific updates
    window.dispatchEvent(new CustomEvent('languagechanged', { detail: { language: lang } }));
  }
}

// Export as global singleton
window.i18n = new I18NService();
