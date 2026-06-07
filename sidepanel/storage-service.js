/**
 * BurgerPrints AI Mockup Generator - Storage Service
 * Manages chrome.storage for settings, history, and images
 */

const MAX_HISTORY_ITEMS = 20;
const MAX_AI_SETTING_CACHE_ITEMS = 20;
const CUSTOMER_PROFILES_KEY = 'customerProfiles';
const ACTIVE_CUSTOMER_PROFILE_KEY = 'activeCustomerProfileId';
const ONBOARDING_STATE_KEY = 'customerStyleOnboardingState';

class StorageService {
  /**
   * Get user settings with defaults
   */
  async getSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    return {
      theme: 'auto',
      language: 'vi',
      aiContentLanguage: settings?.aiContentLanguage || settings?.language || 'vi',
      countries: ['US'],
      gender: 'any',
      ageGroup: 'young_adult',
      groupType: 'solo',
      noPerson: false,
      style: 'lifestyle',
      scenes: ['outdoor'],
      displayMode: 'wearing',
      cameraAngle: 'full_body',
      lighting: 'natural',
      season: 'auto',
      count: 3,
      additionalPrompt: '',
      autoAddMockups: false,
      autoSuggestAi: false,
      useLearnedSellerStyleForContent: true,
      lastSupergroup: 'GENERAL',
      ...settings
    };
  }

  /**
   * Save user settings
   */
  async saveSettings(settings) {
    await chrome.storage.local.set({ settings });
  }

  async getCustomerProfiles() {
    const result = await chrome.storage.local.get(CUSTOMER_PROFILES_KEY);
    return Array.isArray(result[CUSTOMER_PROFILES_KEY]) ? result[CUSTOMER_PROFILES_KEY] : [];
  }

  async saveCustomerProfile(profile) {
    if (!profile?.id) throw new Error('Customer profile id is required.');

    const profiles = await this.getCustomerProfiles();
    const index = profiles.findIndex(item => item.id === profile.id);
    const now = Date.now();
    const nextProfile = {
      ...profile,
      createdAt: profile.createdAt || now,
      updatedAt: now
    };

    if (index >= 0) {
      profiles[index] = nextProfile;
    } else {
      profiles.unshift(nextProfile);
    }

    await chrome.storage.local.set({
      [CUSTOMER_PROFILES_KEY]: profiles,
      [ACTIVE_CUSTOMER_PROFILE_KEY]: nextProfile.id
    });
    return nextProfile;
  }

  async getActiveCustomerProfile() {
    const result = await chrome.storage.local.get([
      CUSTOMER_PROFILES_KEY,
      ACTIVE_CUSTOMER_PROFILE_KEY
    ]);
    const profiles = Array.isArray(result[CUSTOMER_PROFILES_KEY]) ? result[CUSTOMER_PROFILES_KEY] : [];
    return profiles.find(profile => profile.id === result[ACTIVE_CUSTOMER_PROFILE_KEY]) || null;
  }

  async setActiveCustomerProfile(profileId) {
    await chrome.storage.local.set({ [ACTIVE_CUSTOMER_PROFILE_KEY]: profileId || null });
  }

  async getOnboardingState() {
    const result = await chrome.storage.local.get(ONBOARDING_STATE_KEY);
    return result[ONBOARDING_STATE_KEY] || { status: 'new' };
  }

  async saveOnboardingState(state) {
    const nextState = { ...state, updatedAt: Date.now() };
    await chrome.storage.local.set({ [ONBOARDING_STATE_KEY]: nextState });
    return nextState;
  }

  /**
   * Get cached AI-generated setting options for a product fingerprint and language.
   */
  async getAiSettingOptions(fingerprint, language) {
    if (!fingerprint) return null;
    const cacheKey = language ? `${fingerprint}_${language}` : fingerprint;
    const { aiSettingOptionsCache } = await chrome.storage.local.get('aiSettingOptionsCache');
    return aiSettingOptionsCache?.[cacheKey]?.data || null;
  }

  /**
   * Save AI-generated setting options by product fingerprint and language.
   */
  async saveAiSettingOptions(fingerprint, data, language) {
    if (!fingerprint || !data) return;
    const cacheKey = language ? `${fingerprint}_${language}` : fingerprint;

    const { aiSettingOptionsCache } = await chrome.storage.local.get('aiSettingOptionsCache');
    const cache = aiSettingOptionsCache || {};
    cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };

    const sortedEntries = Object.entries(cache)
      .sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, MAX_AI_SETTING_CACHE_ITEMS);

    await chrome.storage.local.set({ aiSettingOptionsCache: Object.fromEntries(sortedEntries) });
  }

  /**
   * Get generation history (metadata only)
   */
  async getHistory() {
    const { history } = await chrome.storage.local.get('history');
    return history || [];
  }

  /**
   * Add a generation session to history
   */
  async addToHistory(session) {
    const history = await this.getHistory();

    const entry = {
      id: session.id || `session_${Date.now()}`,
      timestamp: Date.now(),
      productTitle: session.productTitle || 'Unknown Product',
      count: session.images?.length || 0,
      thumbnails: session.images?.slice(0, 3).map(img => {
        // Create a tiny thumbnail (reduce data URL size)
        return img.imageData?.substring(0, 200) + '...';
      }) || [],
      settings: session.settings || {}
    };

    history.unshift(entry);

    // Trim to max items and clean up old image data
    if (history.length > MAX_HISTORY_ITEMS) {
      const removed = history.splice(MAX_HISTORY_ITEMS);
      // Clean up stored images for removed entries
      const keysToRemove = removed.map(h => `images_${h.id}`);
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
      }
    }

    await chrome.storage.local.set({ history });
    return entry;
  }

  /**
   * Save generated images for a session
   */
  async saveImages(sessionId, images) {
    const key = `images_${sessionId}`;
    await chrome.storage.local.set({
      [key]: {
        images: images.map(img => ({
          id: img.id,
          imageData: img.imageData,
          description: img.description,
          audit: img.audit,
          timestamp: img.timestamp
        }))
      }
    });
  }

  /**
   * Get stored images for a session
   */
  async getImages(sessionId) {
    const key = `images_${sessionId}`;
    const data = await chrome.storage.local.get(key);
    return data[key]?.images || [];
  }

  /**
   * Delete a history entry and its images
   */
  async deleteHistoryEntry(sessionId) {
    const history = await this.getHistory();
    const filtered = history.filter(h => h.id !== sessionId);
    await chrome.storage.local.set({ history: filtered });
    await chrome.storage.local.remove(`images_${sessionId}`);
  }

  /**
   * Clear all history and images
   */
  async clearAllHistory() {
    const history = await this.getHistory();
    const keysToRemove = history.map(h => `images_${h.id}`);
    keysToRemove.push('history');
    await chrome.storage.local.remove(keysToRemove);
  }

  /**
   * Get session-scoped list of suggested product fingerprints
   */
  async getSessionSuggestedFingerprints() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) {
        const result = await chrome.storage.session.get('suggestedFingerprints');
        return Array.isArray(result.suggestedFingerprints) ? result.suggestedFingerprints : [];
      }
    } catch (err) {
      console.warn('[BP Storage] chrome.storage.session is not available:', err);
    }
    return [];
  }

  /**
   * Mark a fingerprint as suggested in the current session
   */
  async addSessionSuggestedFingerprint(fingerprint) {
    if (!fingerprint) return;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) {
        const list = await this.getSessionSuggestedFingerprints();
        if (!list.includes(fingerprint)) {
          list.push(fingerprint);
          await chrome.storage.session.set({ suggestedFingerprints: list });
        }
      }
    } catch (err) {
      console.warn('[BP Storage] Failed to write to chrome.storage.session:', err);
    }
  }

  /**
   * Get storage usage info
   */
  async getStorageUsage() {
    const bytesInUse = await chrome.storage.local.getBytesInUse(null);
    const manifest = chrome.runtime?.getManifest?.();
    const permissions = manifest?.permissions || [];
    const isUnlimited = permissions.includes('unlimitedStorage');
    const maxBytes = chrome.storage.local.QUOTA_BYTES || 10 * 1024 * 1024;

    return {
      used: bytesInUse,
      max: isUnlimited ? null : maxBytes,
      unlimited: isUnlimited,
      percentage: isUnlimited ? 0 : Math.round((bytesInUse / maxBytes) * 100),
      formattedUsed: formatBytes(bytesInUse),
      formattedMax: isUnlimited ? 'Unlimited' : formatBytes(maxBytes)
    };
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Export singleton
const storageService = new StorageService();
