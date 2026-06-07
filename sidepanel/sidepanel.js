/**
 * BurgerPrints AI Mockup Generator - Side Panel Main Logic
 * Handles UI interactions, state management, and orchestrates AI workflow
 */

(function () {
  'use strict';

  // ====== STATE ======
  const state = {
    productData: null,
    theme: 'auto',
    selectedCountries: ['US'],
    selectedScenes: ['outdoor'],
    referenceImageUrls: [],
    selectedReferenceImageUrls: new Set(),
    currentSupergroup: 'GENERAL',
    aiSuggestions: null,
    generatedResults: [],
    selectedImages: new Set(),
    isGenerating: false,
    isAddingMockups: false,
    autoAddMockups: false,
    historyExpanded: false,
    currentTab: 'generate',
    settingOptions: null,
    aiOptionsFingerprint: null,
    isSuggesting: false,
    aiStatusHideTimer: null,
    aiStatusTickTimer: null,
    aiStatusStartedAt: null,
    autoSuggestAi: false,
    useLearnedSellerStyleForContent: true,
    activeCustomerProfile: null,
    draftCustomerProfile: null,
    isAnalyzingCustomerProfile: false,
    customerOnboardingStatus: 'new',
    activeUIMode: 'form',
    chatStep: 0,
    chatMessages: [],
    aiPresets: [],
    activePresetIndex: null
  };

  // ====== DOM REFERENCES ======
  const dom = {
    // Settings
    settingsToggle: document.getElementById('btn-settings-toggle'),
    themeToggle: document.getElementById('btn-theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    settingsPanel: document.getElementById('tab-settings'),
    apiKeyInput: document.getElementById('input-api-key'),
    saveKeyBtn: document.getElementById('btn-save-key'),
    apiKeyStatus: document.getElementById('api-key-status'),
    storageBarFill: document.getElementById('storage-bar-fill'),
    storageInfo: document.getElementById('storage-info'),
    clearHistoryBtn: document.getElementById('btn-clear-history'),

    // Product
    productPreview: document.getElementById('product-preview'),
    refreshProductBtn: document.getElementById('btn-refresh-product'),

    // Generation settings
    categoryBadge: document.getElementById('category-badge'),
    aiSuggestBtn: document.getElementById('btn-ai-suggest'),
    aiSuggestStatus: document.getElementById('ai-suggest-status'),
    productAiSuggestStatus: document.getElementById('ai-suggest-product-status'),
    aiPresetsContainer: document.getElementById('ai-presets-container'),
    fieldModelDemo: document.getElementById('field-model-demo'),
    fieldScene: document.getElementById('field-scene'),
    fieldDisplay: document.getElementById('field-display'),
    fieldStyle: document.getElementById('field-style'),
    fieldCameraLight: document.getElementById('field-camera-light'),
    fieldSeason: document.getElementById('field-season'),
    countryChips: document.getElementById('country-chips'),
    sceneChips: document.getElementById('scene-chips'),
    genderSelect: document.getElementById('select-gender'),
    ageSelect: document.getElementById('select-age'),
    groupSelect: document.getElementById('select-group'),
    noPersonToggle: document.getElementById('toggle-no-person'),
    displayModeSelect: document.getElementById('select-display-mode'),
    styleSelect: document.getElementById('select-style'),
    cameraSelect: document.getElementById('select-camera'),
    lightingSelect: document.getElementById('select-lighting'),
    seasonSelect: document.getElementById('select-season'),
    countSlider: document.getElementById('slider-count'),
    countDisplay: document.getElementById('count-display'),
    additionalInput: document.getElementById('input-additional'),
    languageSelect: document.getElementById('select-language'),
    aiContentLanguageSelect: document.getElementById('select-ai-content-language'),
    autoSuggestAiToggle: document.getElementById('toggle-auto-suggest-ai'),
    customerProfileBar: document.getElementById('customer-profile-bar'),
    customerProfileChip: document.getElementById('btn-customer-profile-chip'),
    customerProfileChipName: document.getElementById('customer-profile-chip-name'),
    customerProfileStatus: document.getElementById('customer-profile-status'),
    customerProfileSummary: document.getElementById('customer-profile-summary'),
    customerProfileName: document.getElementById('customer-profile-name'),
    customerProfileSetupBtn: document.getElementById('btn-customer-profile-setup'),
    customerProfileEditBtn: document.getElementById('btn-customer-profile-edit'),
    customerProfileDisableBtn: document.getElementById('btn-customer-profile-disable'),
    learnedStyleContentToggle: document.getElementById('toggle-use-learned-style-content'),

    // Seller writing style onboarding
    onboarding: document.getElementById('customer-style-onboarding'),
    onboardingSteps: document.querySelectorAll('.sp-onboarding-screen'),
    onboardingStartBtn: document.getElementById('btn-onboarding-start'),
    onboardingSkipBtn: document.getElementById('btn-onboarding-skip'),
    onboardingCloseBtn: document.getElementById('btn-onboarding-cancel-analysis'),
    onboardingBackBtn: document.getElementById('btn-onboarding-source-back'),
    onboardingReviewBackBtn: document.getElementById('btn-onboarding-review-back'),
    onboardingAnalyzeBtn: document.getElementById('btn-onboarding-analyze'),
    onboardingSaveBtn: document.getElementById('btn-onboarding-save-profile'),
    onboardingProfileName: document.getElementById('onboarding-profile-name'),
    customerUrlsContainer: document.getElementById('customer-urls-container'),
    customerBriefInput: document.getElementById('input-customer-brief'),
    profileAnalysisStatus: document.getElementById('profile-analysis-status'),
    profileReviewName: document.getElementById('profile-review-name'),
    profileReviewAudience: document.getElementById('profile-review-audience'),
    profileReviewCopy: document.getElementById('profile-review-copy'),
    profileReviewVisual: document.getElementById('profile-review-visual'),
    profileReviewRules: document.getElementById('profile-review-rules'),

    // Chat Agent
    chatContainer: document.getElementById('chat-container'),
    chatHistory: document.getElementById('chat-history'),
    chatTyping: document.getElementById('chat-typing'),
    chatQuickReplies: document.getElementById('chat-quick-replies'),
    chatInput: document.getElementById('chat-input'),
    chatSendBtn: document.getElementById('btn-chat-send'),
    modeAgentBtn: document.getElementById('btn-mode-agent'),
    modeFormBtn: document.getElementById('btn-mode-form'),

    // Generate
    generateBtn: document.getElementById('btn-generate'),

    // Progress
    progressSection: document.getElementById('progress-section'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    progressText: document.getElementById('progress-text'),

    // Results
    resultsSection: document.getElementById('results-section'),
    resultsCount: document.getElementById('results-count'),
    resultsGrid: document.getElementById('results-grid'),
    autoAddToggle: document.getElementById('toggle-auto-add-mockups'),
    autoAddStatus: document.getElementById('auto-add-status'),
    addSelectedMockupsBtn: document.getElementById('btn-add-selected-mockups'),
    downloadSelectedBtn: document.getElementById('btn-download-selected'),
    downloadAllBtn: document.getElementById('btn-download-all'),

    // History
    historyList: document.getElementById('history-list')
  };

  const OPTION_LIMIT = 6;

  const SETTING_OPTION_CATALOG = {
    scenes: [
      { id: 'outdoor', i18nKey: 'scene_outdoor', prompt: 'an outdoor urban or nature setting with beautiful scenery' },
      { id: 'indoor', i18nKey: 'scene_indoor', prompt: 'an indoor home setting with natural lighting' },
      { id: 'studio', i18nKey: 'scene_studio', prompt: 'a professional photography studio with clean background' },
      { id: 'street', i18nKey: 'scene_street', prompt: 'a trendy street fashion photography setting' },
      { id: 'cafe', i18nKey: 'scene_cafe', prompt: 'a cozy cafe environment with tasteful table styling' },
      { id: 'beach', i18nKey: 'scene_beach', prompt: 'a sunny beach setting with clear blue sky' },
      { id: 'park', i18nKey: 'scene_park', prompt: 'a beautiful park with greenery and soft sunlight' },
      { id: 'gym', i18nKey: 'scene_gym', prompt: 'a modern fitness gym with clean equipment' },
      { id: 'kitchen', i18nKey: 'scene_kitchen', prompt: 'a cozy kitchen counter with morning light near a window' },
      { id: 'office', i18nKey: 'scene_office', prompt: 'a modern office desk setup with laptop and stationery' },
      { id: 'living_room', i18nKey: 'scene_living_room', prompt: 'a stylish modern living room with elegant furniture' },
      { id: 'bedroom', i18nKey: 'scene_bedroom', prompt: 'a cozy bedroom with soft bedding and warm lighting' },
      { id: 'bathroom', i18nKey: 'scene_bathroom', prompt: 'a clean modern bathroom with warm ambient lighting' },
      { id: 'dining_room', i18nKey: 'scene_dining_room', prompt: 'an elegant dining room table with tasteful decor' },
      { id: 'front_door', i18nKey: 'scene_front_door', prompt: 'the front entrance of a beautiful home' },
      { id: 'jewelry_studio', label: '💍 Jewelry Studio', prompt: 'a premium jewelry studio set with refined props' },
      { id: 'vanity_table', label: '🪞 Vanity Table', prompt: 'a clean vanity table with elegant personal accessories' },
      { id: 'pool', i18nKey: 'scene_pool', prompt: 'a bright poolside setting with blue water' },
      { id: 'playground', i18nKey: 'scene_playground', prompt: 'a colorful children playground with soft natural light' },
      { id: 'balcony', i18nKey: 'scene_balcony', prompt: 'a cozy balcony with morning sunlight and plants' }
    ],
    displayModes: [
      { id: 'wearing', i18nKey: 'disp_wearing', prompt: 'wearing' },
      { id: 'holding', i18nKey: 'disp_holding', prompt: 'holding in hands' },
      { id: 'placed_on', i18nKey: 'disp_placed_on', prompt: 'placed naturally on a surface' },
      { id: 'hanging', i18nKey: 'disp_hanging', prompt: 'hanging on the wall as a displayed art piece' },
      { id: 'spread', i18nKey: 'disp_spread', prompt: 'spread or draped naturally' },
      { id: 'wrapped', i18nKey: 'disp_wrapped', prompt: 'wrapped around or draped over shoulders' },
      { id: 'worn_on_head', i18nKey: 'disp_worn_on_head', prompt: 'wearing on head' },
      { id: 'worn_on_face', label: '😷 Worn on face', prompt: 'wearing on face' },
      { id: 'worn_on_feet', i18nKey: 'disp_worn_on_feet', prompt: 'wearing on feet' },
      { id: 'worn_on_hand', label: '✋ Worn on hand', prompt: 'worn on the hand with the product clearly visible' },
      { id: 'worn_on_finger', label: '💍 Worn on finger', prompt: 'worn on a finger with the product clearly visible' },
      { id: 'flat_lay', i18nKey: 'disp_flat_lay', prompt: 'laid flat in an artistic flat-lay arrangement, photographed from above' },
      { id: 'next_to', i18nKey: 'disp_next_to', prompt: 'placed next to relevant lifestyle props' }
    ],
    photographyStyles: [
      { id: 'lifestyle', i18nKey: 'style_lifestyle', prompt: 'modern natural lifestyle photography' },
      { id: 'editorial', i18nKey: 'style_editorial', prompt: 'high-end editorial magazine photography' },
      { id: 'minimal', i18nKey: 'style_minimal', prompt: 'clean minimalist product photography' },
      { id: 'cozy', i18nKey: 'style_cozy', prompt: 'warm cozy inviting photography with soft tones' },
      { id: 'street', i18nKey: 'style_street', prompt: 'urban street style photography' },
      { id: 'tropical', i18nKey: 'style_tropical', prompt: 'bright tropical vacation photography' },
      { id: 'sport', i18nKey: 'style_sport', prompt: 'dynamic sporty active lifestyle photography' },
      { id: 'festive', i18nKey: 'style_festive', prompt: 'festive holiday celebration photography' },
      { id: 'interior_design', i18nKey: 'style_interior_design', prompt: 'professional interior design photography' },
      { id: 'product_hero', i18nKey: 'style_product_hero', prompt: 'hero product shot with beautiful bokeh background' },
      { id: 'luxury', label: '💎 Luxury', prompt: 'premium luxury commercial product photography' },
      { id: 'flat_lay', i18nKey: 'style_flat_lay', prompt: 'artistic flat-lay photography from above' }
    ],
    cameraAngles: [
      { id: 'full_body', i18nKey: 'cam_full_body', prompt: 'full body shot showing head to toe' },
      { id: 'medium_shot', i18nKey: 'cam_medium_shot', prompt: 'medium shot from waist up' },
      { id: 'close_up', i18nKey: 'cam_close_up', prompt: 'close-up detail shot focusing on the product' },
      { id: 'macro_detail', label: '🔎 Macro Detail', prompt: 'macro detail shot showing fine product texture and detail' },
      { id: 'three_quarter', i18nKey: 'cam_three_quarter', prompt: '3/4 angle shot at 45 degrees' },
      { id: 'eye_level', i18nKey: 'cam_eye_level', prompt: 'eye-level straight-on shot' },
      { id: 'top_down', i18nKey: 'cam_top_down', prompt: 'top-down overhead shot looking directly down' },
      { id: 'wide_shot', i18nKey: 'cam_wide_shot', prompt: 'wide angle shot showing full environment context' },
      { id: 'hand_close_up', label: '✋ Hand Close-up', prompt: 'close-up shot of the hand holding or wearing the product' }
    ],
    lightingOptions: [
      { id: 'natural', i18nKey: 'light_natural', prompt: 'soft natural daylight' },
      { id: 'golden_hour', i18nKey: 'light_golden_hour', prompt: 'warm golden hour sunset lighting' },
      { id: 'morning_soft', i18nKey: 'light_morning_soft', prompt: 'gentle soft morning light' },
      { id: 'studio', i18nKey: 'light_studio', prompt: 'professional studio lighting setup' },
      { id: 'warm_ambient', i18nKey: 'light_warm_ambient', prompt: 'warm ambient indoor lighting' },
      { id: 'softbox', label: '💡 Softbox', prompt: 'large softbox lighting with clean commercial shadows' },
      { id: 'neon', i18nKey: 'light_neon', prompt: 'colorful neon urban lighting' },
      { id: 'christmas', i18nKey: 'light_christmas', prompt: 'warm twinkling Christmas lights glow' },
      { id: 'bright_daylight', i18nKey: 'light_bright_daylight', prompt: 'bright clear daylight' }
    ]
  };

  const SUPERGROUP_OPTION_IDS = {
    WEARABLE: {
      scenes: ['street', 'outdoor', 'studio', 'cafe', 'park', 'gym'],
      displayModes: ['wearing', 'holding', 'flat_lay', 'placed_on'],
      photographyStyles: ['lifestyle', 'editorial', 'street', 'minimal', 'sport', 'product_hero'],
      cameraAngles: ['full_body', 'medium_shot', 'three_quarter', 'close_up', 'wide_shot'],
      lightingOptions: ['natural', 'golden_hour', 'studio', 'bright_daylight', 'morning_soft']
    },
    KIDS: {
      scenes: ['playground', 'park', 'bedroom', 'studio', 'outdoor'],
      displayModes: ['wearing', 'holding', 'flat_lay', 'placed_on'],
      photographyStyles: ['lifestyle', 'cozy', 'minimal', 'festive', 'product_hero'],
      cameraAngles: ['full_body', 'medium_shot', 'eye_level', 'close_up'],
      lightingOptions: ['bright_daylight', 'natural', 'morning_soft', 'studio', 'warm_ambient']
    },
    DRINKWARE: {
      scenes: ['kitchen', 'cafe', 'office', 'living_room', 'studio', 'balcony'],
      displayModes: ['holding', 'placed_on', 'next_to', 'flat_lay'],
      photographyStyles: ['cozy', 'lifestyle', 'minimal', 'product_hero', 'flat_lay'],
      cameraAngles: ['close_up', 'three_quarter', 'eye_level', 'top_down', 'medium_shot'],
      lightingOptions: ['morning_soft', 'natural', 'warm_ambient', 'studio', 'softbox']
    },
    HOME_LIVING: {
      scenes: ['living_room', 'bedroom', 'bathroom', 'dining_room', 'front_door', 'studio'],
      displayModes: ['hanging', 'spread', 'wrapped', 'placed_on', 'flat_lay'],
      photographyStyles: ['interior_design', 'cozy', 'minimal', 'lifestyle', 'product_hero'],
      cameraAngles: ['eye_level', 'wide_shot', 'close_up', 'top_down', 'three_quarter'],
      lightingOptions: ['warm_ambient', 'natural', 'morning_soft', 'studio', 'softbox']
    },
    ACCESSORIES: {
      scenes: ['studio', 'street', 'outdoor', 'jewelry_studio', 'vanity_table', 'office'],
      displayModes: ['holding', 'worn_on_head', 'worn_on_hand', 'worn_on_finger', 'placed_on', 'flat_lay'],
      photographyStyles: ['lifestyle', 'minimal', 'luxury', 'product_hero', 'street', 'editorial'],
      cameraAngles: ['close_up', 'macro_detail', 'hand_close_up', 'three_quarter', 'eye_level'],
      lightingOptions: ['studio', 'softbox', 'natural', 'warm_ambient', 'golden_hour']
    },
    GENERAL: {
      scenes: ['outdoor', 'studio', 'indoor', 'cafe', 'living_room', 'office'],
      displayModes: ['wearing', 'holding', 'placed_on', 'flat_lay', 'next_to'],
      photographyStyles: ['lifestyle', 'minimal', 'product_hero', 'cozy', 'editorial'],
      cameraAngles: ['close_up', 'eye_level', 'three_quarter', 'medium_shot', 'wide_shot'],
      lightingOptions: ['natural', 'studio', 'morning_soft', 'warm_ambient', 'bright_daylight']
    }
  };

  // ====== TAB NAVIGATION ======
  function switchTab(tabId) {
    state.currentTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.sp-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update tab contents
    document.querySelectorAll('.sp-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    // Update settings toggle active state on header
    dom.settingsToggle.classList.toggle('sp-header__settings-btn--active', tabId === 'settings');
  }

  // ====== PRODUCT CATEGORY DETECTION ======
  const SUPERGROUP_PATTERNS = {
    WEARABLE: /t-?shirt|tee|hoodie|sweat|tank.?top|polo|jacket|bomber|hawaiian|hawaii|long.?sleeve|legging|pajama|swim|sport|active|sneaker|footwear|jogger|vest|áo|quần|váy|đầm|giày|dép/i,
    KIDS: /kid|child|infant|onesie|baby|youth|toddler|newborn|trẻ em|em bé|sơ sinh|thiếu nhi/i,
    DRINKWARE: /mug|tumbler|travel.?mug|cup|drinkware|can.?cooler|cốc|ly|tách|bình nước|bình giữ nhiệt|thủy tinh/i,
    HOME_LIVING: /canvas|poster|blanket|pillow|doormat|rug|mat|towel|tapestry|flag|puzzle|table.?runner|wood.?print|metal.?print|hooded.?blanket|tranh|chăn|gối|thảm|khăn/i,
    ACCESSORIES: /phone.?case|tote.?bag|hat|cap|ornament|acrylic|leather|keychain|wallet|passport|bag|mask|gaiter|car.?seat|sun.?shade|ốp|túi|mũ|nón|móc khóa|ví|khẩu trang/i
  };

  const SUPERGROUP_CONFIGS = {
    WEARABLE: {
      i18nKey: 'sg_wearable', color: '#4F46E5',
      showModel: true, showScene: true, showDisplay: true, showStyle: true, showCamera: true, showSeason: false,
      defaultScenes: ['outdoor'], defaultDisplay: 'wearing', defaultStyle: 'lifestyle',
      defaultAngle: 'full_body', defaultLighting: 'natural', defaultNoPerson: false
    },
    KIDS: {
      i18nKey: 'sg_kids', color: '#F59E0B',
      showModel: true, showScene: true, showDisplay: true, showStyle: true, showCamera: true, showSeason: false,
      defaultScenes: ['park'], defaultDisplay: 'wearing', defaultStyle: 'lifestyle',
      defaultAngle: 'full_body', defaultLighting: 'bright_daylight', defaultNoPerson: false,
      defaultAge: 'child'
    },
    DRINKWARE: {
      i18nKey: 'sg_drinkware', color: '#10B981',
      showModel: true, showScene: true, showDisplay: true, showStyle: true, showCamera: true, showSeason: false,
      defaultScenes: ['kitchen'], defaultDisplay: 'holding', defaultStyle: 'cozy',
      defaultAngle: 'close_up', defaultLighting: 'morning_soft', defaultNoPerson: false
    },
    HOME_LIVING: {
      i18nKey: 'sg_home_living', color: '#0D9488',
      showModel: false, showScene: true, showDisplay: true, showStyle: true, showCamera: true, showSeason: false,
      defaultScenes: ['living_room'], defaultDisplay: 'hanging', defaultStyle: 'interior_design',
      defaultAngle: 'eye_level', defaultLighting: 'warm_ambient', defaultNoPerson: true
    },
    ACCESSORIES: {
      i18nKey: 'sg_accessories', color: '#EC4899',
      showModel: true, showScene: true, showDisplay: true, showStyle: true, showCamera: true, showSeason: true,
      defaultScenes: ['outdoor'], defaultDisplay: 'holding', defaultStyle: 'lifestyle',
      defaultAngle: 'close_up', defaultLighting: 'natural', defaultNoPerson: false
    },
    GENERAL: {
      i18nKey: 'sg_general', color: '#6B7280',
      showModel: true, showScene: true, showDisplay: true, showStyle: true, showCamera: true, showSeason: true,
      defaultScenes: ['outdoor'], defaultDisplay: 'wearing', defaultStyle: 'lifestyle',
      defaultAngle: 'full_body', defaultLighting: 'natural', defaultNoPerson: false
    }
  };

  function detectSupergroup(productType) {
    if (!productType) return 'GENERAL';
    const text = productType.toLowerCase();
    // KIDS must be checked before WEARABLE since kid apparel matches both
    if (SUPERGROUP_PATTERNS.KIDS.test(text)) return 'KIDS';
    if (SUPERGROUP_PATTERNS.DRINKWARE.test(text)) return 'DRINKWARE';
    if (SUPERGROUP_PATTERNS.HOME_LIVING.test(text)) return 'HOME_LIVING';
    if (SUPERGROUP_PATTERNS.ACCESSORIES.test(text)) return 'ACCESSORIES';
    if (SUPERGROUP_PATTERNS.WEARABLE.test(text)) return 'WEARABLE';
    return 'GENERAL';
  }

  function applySupergroupDefaults(supergroup) {
    const normalizedSupergroup = SUPERGROUP_CONFIGS[supergroup] ? supergroup : 'GENERAL';
    const config = SUPERGROUP_CONFIGS[normalizedSupergroup];
    const optionSets = getFallbackOptionSets(normalizedSupergroup);
    state.currentSupergroup = normalizedSupergroup;

    // Update category badge
    dom.categoryBadge.textContent = i18n.t(config.i18nKey);
    dom.categoryBadge.style.background = config.color;
    dom.categoryBadge.hidden = normalizedSupergroup === 'GENERAL';

    // Show/Hide field groups
    dom.fieldModelDemo.style.display = config.showModel ? '' : 'none';
    dom.fieldSeason.style.display = config.showSeason ? '' : 'none';

    // Apply smart defaults
    state.selectedScenes = [...config.defaultScenes];
    renderSettingOptions(optionSets, {
      scenes: state.selectedScenes,
      displayMode: config.defaultDisplay,
      style: config.defaultStyle,
      cameraAngle: config.defaultAngle,
      lighting: config.defaultLighting
    });
    dom.noPersonToggle.checked = config.defaultNoPerson;
    handleNoPersonToggle();

    if (config.defaultAge) {
      dom.ageSelect.value = config.defaultAge;
    }

    // Enable AI Suggest button if product image exists
    dom.aiSuggestBtn.disabled = !hasSelectedReferenceImages() || !geminiService.apiKey || state.isSuggesting;
  }

  function handleNoPersonToggle() {
    const noPerson = dom.noPersonToggle.checked;
    const modelFields = dom.fieldModelDemo.querySelectorAll('.sp-field--sub:not(:last-child)');
    modelFields.forEach(field => {
      field.style.opacity = noPerson ? '0.4' : '1';
      field.style.pointerEvents = noPerson ? 'none' : '';
    });
  }

  function getCatalogOption(group, id) {
    return SETTING_OPTION_CATALOG[group]?.find(option => option.id === id) || null;
  }

  function getOptionLabel(option) {
    if (!option) return '';
    if (option.i18nKey) {
      const translated = i18n.t(option.i18nKey);
      if (translated !== option.i18nKey) return translated;
    }
    return option.label || option.id;
  }

  function getCatalogForPrompt() {
    return Object.fromEntries(Object.entries(SETTING_OPTION_CATALOG).map(([group, options]) => [
      group,
      options.map(option => ({
        id: option.id,
        label: getOptionLabel(option),
        prompt: option.prompt
      }))
    ]));
  }

  function getFallbackOptionSets(supergroup = 'GENERAL') {
    const idsByGroup = SUPERGROUP_OPTION_IDS[supergroup] || SUPERGROUP_OPTION_IDS.GENERAL;
    return Object.fromEntries(Object.entries(idsByGroup).map(([group, ids]) => [
      group,
      ids.map((id, index) => {
        const option = getCatalogOption(group, id);
        return {
          id,
          label: getOptionLabel(option),
          prompt: option?.prompt || id,
          recommended: index === 0,
          source: 'fallback'
        };
      }).filter(option => option.prompt)
    ]));
  }

  function normalizeOptionId(id) {
    return String(id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 48);
  }

  function normalizeOptionSet(group, options, fallbackOptions) {
    const seen = new Set();
    const normalized = [];

    (Array.isArray(options) ? options : []).forEach((option, index) => {
      const id = normalizeOptionId(option?.id);
      if (!id || seen.has(id)) return;

      const catalogOption = getCatalogOption(group, id);
      const label = String(option?.label || getOptionLabel(catalogOption) || id).trim();
      const prompt = String(option?.prompt || catalogOption?.prompt || label).trim();
      if (!label || !prompt) return;

      seen.add(id);
      normalized.push({
        id,
        label,
        prompt,
        reason: String(option?.reason || '').trim(),
        recommended: option?.recommended === true || index === 0,
        source: catalogOption ? 'catalog' : 'ai'
      });
    });

    (fallbackOptions || []).forEach((option) => {
      if (normalized.length >= Math.min(OPTION_LIMIT, 4) || seen.has(option.id)) return;
      seen.add(option.id);
      normalized.push({ ...option, recommended: normalized.length === 0 });
    });

    const limited = normalized.slice(0, OPTION_LIMIT);
    const recommendedIndex = Math.max(0, limited.findIndex(option => option.recommended));
    return limited.map((option, index) => ({
      ...option,
      recommended: index === recommendedIndex
    }));
  }

  function normalizeAiOptionSets(suggestions, fallbackOptionSets) {
    const optionSets = suggestions?.optionSets || {};
    return Object.fromEntries(Object.keys(SETTING_OPTION_CATALOG).map(group => [
      group,
      normalizeOptionSet(group, optionSets[group], fallbackOptionSets[group])
    ]));
  }

  function getRecommendedOptionId(options, fallbackId) {
    return options?.find(option => option.recommended)?.id || options?.[0]?.id || fallbackId;
  }

  function getCurrentOptionSets() {
    return state.settingOptions || getFallbackOptionSets(state.currentSupergroup);
  }

  function getCurrentSettingOption(group, id) {
    const optionSets = getCurrentOptionSets();
    return (optionSets[group] || []).find(option => option.id === id) || getCatalogOption(group, id);
  }

  function getCurrentSettingLabel(group, id) {
    const option = getCurrentSettingOption(group, id);
    if (option) return getOptionLabel(option);
    return id || '';
  }

  function getAgentSettingReplies(group, valuePrefix = '', limit = 5) {
    const optionSets = getCurrentOptionSets();
    const options = (optionSets[group] || []).slice(0, limit);
    const primaryIndex = Math.max(0, options.findIndex(option => option.recommended));
    return options
      .map((option, index) => ({
        label: option.label,
        value: valuePrefix ? `${valuePrefix}|${option.id}` : option.id,
        primary: index === primaryIndex
      }));
  }

  function getDisplayModeReplies() {
    const options = getAgentSettingReplies('displayModes', '', 5);
    if (options.length > 0) return options;
    return [
      { label: aiText('👤 Đang mặc (wear)', '👤 Wearing'), value: 'wearing', primary: true },
      { label: aiText('🤲 Đang cầm (hold)', '🤲 Holding'), value: 'holding' },
      { label: aiText('📦 Đặt trên bề mặt', '📦 Placed on surface'), value: 'placed_on' }
    ];
  }

  function getSceneReplies() {
    const optionSets = getCurrentOptionSets();
    const sceneOptions = (optionSets.scenes || []).slice(0, 5).map((opt, index) => ({
      label: opt.label,
      value: `scene|${opt.id}`,
      primary: opt.recommended === true || index === 0
    }));

    if (sceneOptions.length > 0) return sceneOptions;
    return [
      { label: aiText('🌳 Ngoài trời', '🌳 Outdoor'), value: 'scene|outdoor', primary: true },
      { label: aiText('🏠 Trong nhà', '🏠 Indoor'), value: 'scene|indoor' },
      { label: aiText('📸 Studio', '📸 Studio'), value: 'scene|studio' }
    ];
  }

  function getStyleReplies() {
    const options = getAgentSettingReplies('photographyStyles', 'style', 5);
    if (options.length > 0) return options;
    return [
      { label: aiText('🌿 Đời thường', '🌿 Lifestyle'), value: 'style|lifestyle', primary: true },
      { label: aiText('✨ Tối giản', '✨ Minimal'), value: 'style|minimal' },
      { label: aiText('📰 Tạp chí', '📰 Editorial'), value: 'style|editorial' }
    ];
  }

  function getPresetReplies() {
    return state.aiPresets.map((preset, index) => {
      const { name } = getPresetDisplayInfo(preset, index);
      return {
        label: `${index === state.activePresetIndex ? '✓ ' : ''}${name}`,
        value: `preset|${index}`,
        primary: index === (state.activePresetIndex ?? 0)
      };
    });
  }

  function getPresetDisplayInfo(preset, index) {
    const fallbackName = i18n.t(`preset_fallback_name_${index + 1}`) || `Preset ${index + 1}`;
    const fallbackDesc = i18n.t(`preset_fallback_desc_${index + 1}`) || aiText('Đề xuất thiết lập mockup', 'Suggested mockup setup');
    const name = String(preset?.name || '').trim() || fallbackName;
    const description = String(preset?.description || '').trim() || fallbackDesc;
    const personLabel = preset?.needsPerson === false
      ? aiText('Không người mẫu', 'No model')
      : aiText('Có người mẫu', 'With model');
    const metaItems = [
      { icon: '📍', text: getCurrentSettingLabel('scenes', preset?.scene) },
      { icon: '👚', text: getCurrentSettingLabel('displayModes', preset?.displayMode) },
      { icon: '🎨', text: getCurrentSettingLabel('photographyStyles', preset?.style) },
      { icon: '📷', text: getCurrentSettingLabel('cameraAngles', preset?.cameraAngle) },
      { icon: '💡', text: getCurrentSettingLabel('lightingOptions', preset?.lighting) },
      { icon: preset?.needsPerson === false ? '🚫' : '🧑', text: personLabel }
    ].filter(item => item.text);

    return { name, description, metaItems };
  }

  function renderAgentPresetCardsHtml() {
    const selectText = aiText('Chọn thiết lập này', 'Choose this setup');
    return `
      <div class="sp-chat-preset-list">
        ${state.aiPresets.map((preset, index) => {
          const { name, description, metaItems } = getPresetDisplayInfo(preset, index);
          const isSelected = index === state.activePresetIndex;
          return `
            <button type="button"
                    class="sp-chat-preset-card ${isSelected ? 'sp-chat-preset-card--selected' : ''}"
                    data-value="preset|${index}"
                    data-label="${escapeHtml(name)}">
              <span class="sp-chat-preset-card__check">${isSelected ? '✓' : ''}</span>
              <span class="sp-chat-preset-card__main">
                <span class="sp-chat-preset-card__title">${escapeHtml(name)}</span>
                <span class="sp-chat-preset-card__desc">${escapeHtml(description)}</span>
                <span class="sp-chat-preset-card__meta">
                  ${metaItems.map(item => `
                    <span class="sp-chat-preset-card__badge">
                      <span>${item.icon}</span>${escapeHtml(item.text)}
                    </span>
                  `).join('')}
                </span>
              </span>
              <span class="sp-chat-preset-card__action">${selectText}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function attachAgentPresetCardHandlers(container = dom.chatHistory?.lastElementChild) {
    if (!container) return;
    container.querySelectorAll('.sp-chat-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const parts = String(card.dataset.value || '').split('|');
        const presetIndex = parseInt(parts[1], 10);
        if (parts[0] === 'preset' && Number.isInteger(presetIndex)) {
          const preset = state.aiPresets[presetIndex];
          if (preset) {
            applyPreset(preset, {
              presetIndex,
              skipAgentRefresh: true,
              silent: true
            });
          }
        }
        handleUserChatResponse(card.dataset.value, card.dataset.label);
      });
    });
  }

  function syncPresetCardSelection() {
    if (!dom.aiPresetsContainer) return;
    dom.aiPresetsContainer.querySelectorAll('.sp-preset-card').forEach(card => {
      const index = parseInt(card.dataset.index, 10);
      card.classList.toggle('sp-preset-card--selected', index === state.activePresetIndex);
    });
  }

  function syncAgentPresetCardSelection() {
    if (!dom.chatHistory) return;
    dom.chatHistory.querySelectorAll('.sp-chat-preset-card').forEach(card => {
      const parts = String(card.dataset.value || '').split('|');
      const index = parseInt(parts[1], 10);
      const isSelected = parts[0] === 'preset' && index === state.activePresetIndex;
      card.classList.toggle('sp-chat-preset-card--selected', isSelected);

      const check = card.querySelector('.sp-chat-preset-card__check');
      if (check) check.textContent = isSelected ? '✓' : '';
    });
  }

  function refreshAgentQuickRepliesForCurrentStep() {
    if (state.activeUIMode !== 'agent') return;
    if (state.chatStep === 'preset') {
      showQuickReplies([]);
      return;
    }
    if (state.chatStep === 1) showQuickReplies(getDisplayModeReplies());
    if (state.chatStep === 3) showQuickReplies(getSceneReplies());
    if (state.chatStep === 4) showQuickReplies(getStyleReplies());
  }

  function syncAgentAfterPresetUpdate() {
    if (state.activeUIMode !== 'agent') return;

    const isAtInitialDisplayStep = state.chatStep === 1 && state.chatMessages.length <= 2;
    if (state.aiPresets.length > 0 && isAtInitialDisplayStep) {
      initChatFlow();
      return;
    }

    refreshAgentQuickRepliesForCurrentStep();
  }

  function isProductOnlyDisplayMode(displayMode) {
    const option = getCurrentSettingOption('displayModes', displayMode);
    const text = `${displayMode || ''} ${option?.label || ''} ${option?.prompt || ''}`.toLowerCase();
    if (/(wear|worn|model|person|human|hand|finger|head|face|feet|body|mặc|đội|cầm|tay|người mẫu)/i.test(text)) {
      return false;
    }
    if (/(flat|lay|surface|placed|hanging|spread|draped|next_to|next to|product only|xếp phẳng|bề mặt|treo|trải|bên cạnh)/i.test(text)) {
      return true;
    }
    return SUPERGROUP_CONFIGS[state.currentSupergroup]?.defaultNoPerson === true;
  }

  function renderSettingOptions(optionSets, selected = {}) {
    state.settingOptions = optionSets || getFallbackOptionSets(state.currentSupergroup);

    renderSceneChips(state.settingOptions.scenes || [], selected.scenes || state.selectedScenes);
    renderSelectOptions(dom.displayModeSelect, state.settingOptions.displayModes || [], selected.displayMode);
    renderSelectOptions(dom.styleSelect, state.settingOptions.photographyStyles || [], selected.style);
    renderSelectOptions(dom.cameraSelect, state.settingOptions.cameraAngles || [], selected.cameraAngle);
    renderSelectOptions(dom.lightingSelect, state.settingOptions.lightingOptions || [], selected.lighting);
  }

  function renderSceneChips(options, activeValues = []) {
    const activeSet = new Set(activeValues);
    dom.sceneChips.innerHTML = options.map(option => `
      <button class="sp-chip ${activeSet.has(option.id) ? 'sp-chip--active' : ''}" data-value="${escapeHtml(option.id)}" title="${escapeHtml(option.reason || option.prompt)}">
        ${escapeHtml(option.label)}
      </button>
    `).join('');

    if (!options.some(option => activeSet.has(option.id)) && options[0]) {
      state.selectedScenes = [options[0].id];
      updateChips(dom.sceneChips, state.selectedScenes);
    }
  }

  function renderSelectOptions(select, options, selectedValue) {
    const currentValue = selectedValue || select.value;
    select.innerHTML = options.map(option => `
      <option value="${escapeHtml(option.id)}" title="${escapeHtml(option.reason || option.prompt)}">
        ${escapeHtml(option.label)}
      </option>
    `).join('');

    if (options.some(option => option.id === currentValue)) {
      select.value = currentValue;
      return;
    }

    const recommendedId = getRecommendedOptionId(options);
    if (recommendedId) select.value = recommendedId;
  }

  function applyOptionDefaults(optionSets) {
    state.selectedScenes = [getRecommendedOptionId(optionSets.scenes, 'outdoor')];
    renderSettingOptions(optionSets, {
      scenes: state.selectedScenes,
      displayMode: getRecommendedOptionId(optionSets.displayModes, 'wearing'),
      style: getRecommendedOptionId(optionSets.photographyStyles, 'lifestyle'),
      cameraAngle: getRecommendedOptionId(optionSets.cameraAngles, 'full_body'),
      lighting: getRecommendedOptionId(optionSets.lightingOptions, 'natural')
    });
  }

  function getOptionPromptMap() {
    const optionSets = getCurrentOptionSets();
    return {
      scenes: Object.fromEntries((optionSets.scenes || []).map(option => [option.id, option.prompt])),
      displayModes: Object.fromEntries((optionSets.displayModes || []).map(option => [option.id, option.prompt])),
      photographyStyles: Object.fromEntries((optionSets.photographyStyles || []).map(option => [option.id, option.prompt])),
      cameraAngles: Object.fromEntries((optionSets.cameraAngles || []).map(option => [option.id, option.prompt])),
      lightingOptions: Object.fromEntries((optionSets.lightingOptions || []).map(option => [option.id, option.prompt]))
    };
  }

  function getProductFingerprint(data = state.productData) {
    const referenceImages = getSelectedReferenceImages();
    const raw = [
      data?.title || '',
      data?.productType || '',
      (data?.colors || []).join(','),
      referenceImages.join(','),
      data?.url || '',
      state.activeCustomerProfile?.id || '',
      state.activeCustomerProfile?.updatedAt || ''
    ].join('|');

    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
    }
    return `product_${(hash >>> 0).toString(16)}`;
  }

  function getAiSuggestStatusTargets() {
    return [dom.productAiSuggestStatus, dom.aiSuggestStatus].filter(Boolean);
  }

  function stopAiStatusTicker() {
    if (state.aiStatusTickTimer) {
      clearInterval(state.aiStatusTickTimer);
      state.aiStatusTickTimer = null;
    }
  }

  function getAiStatusElapsedText(options = {}) {
    if (!options.elapsedSeconds) return '';
    return i18n.t('ai_status_elapsed', [String(options.elapsedSeconds)]);
  }

  function setAiSuggestStatus(mode, messageKey = 'ai_status_analyzing', options = {}) {
    const targets = getAiSuggestStatusTargets();
    if (targets.length === 0) return;
    if (state.aiStatusHideTimer) {
      clearTimeout(state.aiStatusHideTimer);
      state.aiStatusHideTimer = null;
    }

    if (mode === 'hidden') {
      stopAiStatusTicker();
      state.aiStatusStartedAt = null;
      targets.forEach(target => {
        target.hidden = true;
        target.innerHTML = '';
      });
      return;
    }
    if (mode !== 'loading') {
      stopAiStatusTicker();
      state.aiStatusStartedAt = null;
    }

    const productName = getDisplayProductTitle(state.productData);
    const message = i18n.t(messageKey, [productName]);
    const isSuccess = mode === 'success';
    const isError = mode === 'error';
    const subtitleBase = options.subtitleText
      || (options.subtitleKey
        ? i18n.t(options.subtitleKey, options.subtitlePlaceholders || [])
        : i18n.t(isSuccess ? 'ai_status_ready' : 'ai_status_wait'));
    const elapsedText = mode === 'loading' ? getAiStatusElapsedText(options) : '';
    const subtitle = [subtitleBase, elapsedText].filter(Boolean).join(' · ');
    const completedSteps = Number.isInteger(options.completedSteps) ? options.completedSteps : 0;
    const activeStep = Number.isInteger(options.activeStep) ? options.activeStep : 0;
    const steps = [
      i18n.t('ai_status_step_product'),
      i18n.t('ai_status_step_scene'),
      i18n.t('ai_status_step_camera'),
      i18n.t('ai_status_step_light')
    ];

    const html = `
      <div class="sp-ai-status__main">
        <div class="sp-ai-status__spinner">${isSuccess ? '✓' : isError ? '!' : ''}</div>
        <div class="sp-ai-status__copy">
          <div class="sp-ai-status__title">${escapeHtml(message)}</div>
          <div class="sp-ai-status__subtitle">${escapeHtml(subtitle)}</div>
        </div>
      </div>
      <div class="sp-ai-status__steps">
        ${steps.map((step, index) => {
          const stepClass = isSuccess || index < completedSteps
            ? 'sp-ai-status__step--done'
            : index === activeStep
              ? 'sp-ai-status__step--active'
              : '';
          return `
          <span class="sp-ai-status__step ${stepClass}" style="--step-index:${index}">
            ${escapeHtml(step)}
          </span>
        `;
        }).join('')}
      </div>
    `;

    targets.forEach(target => {
      target.className = `sp-ai-status sp-ai-status--${mode}`;
      target.hidden = false;
      target.innerHTML = html;
    });

    if (options.autoHideMs) {
      state.aiStatusHideTimer = setTimeout(() => {
        setAiSuggestStatus('hidden');
      }, options.autoHideMs);
    }
  }

  function setTimedAiSuggestStatus(messageKey, options = {}) {
    stopAiStatusTicker();
    state.aiStatusStartedAt = state.aiStatusStartedAt || Date.now();

    const render = () => {
      const elapsedSeconds = Math.max(1, Math.floor((Date.now() - state.aiStatusStartedAt) / 1000));
      setAiSuggestStatus('loading', messageKey, { ...options, elapsedSeconds });
    };

    render();
    state.aiStatusTickTimer = setInterval(render, 2000);
  }

  async function maybeAutoSuggestSettings(force = false) {
    // Do not auto-suggest if setting is disabled
    if (!state.autoSuggestAi) return;

    const referenceImages = getSelectedReferenceImages();
    if (!geminiService.apiKey || referenceImages.length === 0 || state.isSuggesting) return;

    const fingerprint = getProductFingerprint();
    if (!force && fingerprint === state.aiOptionsFingerprint) return;

    const cached = !force ? await storageService.getAiSettingOptions(fingerprint, getAiContentLanguage()) : null;
    if (cached?.optionSets) {
      setAiSuggestStatus('success', 'ai_status_cached', { autoHideMs: 1800 });
      applyAiSuggestions(cached, fingerprint);
      return;
    }

    // Prevent continuous API calls on sidepanel open/close toggle if already auto-suggested in this session
    if (!force) {
      const sessionSuggested = await storageService.getSessionSuggestedFingerprints();
      if (sessionSuggested.includes(fingerprint)) {
        console.log('[BP AI Mockup] Already auto-suggested for this fingerprint in this session, skipping API call:', fingerprint);
        return;
      }
      await storageService.addSessionSuggestedFingerprint(fingerprint);
    }

    await handleAiSuggest({ force, silent: !force, fingerprint });
  }

  function applyAiSuggestions(suggestions, fingerprint) {
    const rawDetectedCategory = String(suggestions.detectedCategory || '').toUpperCase();
    const detectedCategory = SUPERGROUP_CONFIGS[rawDetectedCategory]
      ? rawDetectedCategory
      : state.currentSupergroup;
    if (detectedCategory && detectedCategory !== state.currentSupergroup) {
      applySupergroupDefaults(detectedCategory);
    }

    const fallback = getFallbackOptionSets(detectedCategory || state.currentSupergroup);
    const optionSets = normalizeAiOptionSets(suggestions, fallback);
    state.aiSuggestions = suggestions;
    state.aiOptionsFingerprint = fingerprint || getProductFingerprint();
    applyOptionDefaults(optionSets);
    renderPresetCards(suggestions.presets || []);
    updateGenerateButton();
    syncAgentAfterPresetUpdate();
  }

  // ====== AI SUGGEST ======
  async function handleAiSuggest(options = {}) {
    if (state.isAnalyzingCustomerProfile || state.isGenerating) return;
    const silent = options.silent === true;
    const referenceImages = getSelectedReferenceImages();
    if (referenceImages.length === 0) return;

    state.isSuggesting = true;
    state.aiStatusStartedAt = Date.now();
    await setSidePanelAiTask('suggest-settings');
    dom.aiSuggestBtn.disabled = true;
    dom.aiSuggestBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_ai_suggest_loading');
    dom.aiSuggestBtn.classList.add('sp-btn--loading');
    const statusTitleKey = silent ? 'ai_status_auto' : 'ai_status_refreshing';
    const updateSuggestProgress = (progress = {}) => {
      if (progress.phase === 'preparing_images') {
        const total = progress.total || referenceImages.length;
        const loaded = progress.loaded || 0;
        setTimedAiSuggestStatus(statusTitleKey, {
          subtitleKey: 'ai_status_preparing_images',
          subtitlePlaceholders: [String(loaded), String(total)],
          activeStep: 0,
          completedSteps: loaded >= total && total > 0 ? 1 : 0
        });
        return;
      }
      if (progress.phase === 'calling_gemini') {
        setTimedAiSuggestStatus(statusTitleKey, {
          subtitleKey: 'ai_status_calling_gemini',
          activeStep: 1,
          completedSteps: 1
        });
        return;
      }
      if (progress.phase === 'parsing_response') {
        setTimedAiSuggestStatus(statusTitleKey, {
          subtitleKey: 'ai_status_parsing',
          activeStep: 2,
          completedSteps: 2
        });
      }
    };
    updateSuggestProgress({ phase: 'preparing_images', loaded: 0, total: referenceImages.length });

    try {
      const fingerprint = options.fingerprint || getProductFingerprint();
      const suggestions = await geminiService.suggestSettings({
        productImageUrls: referenceImages,
        productData: state.productData,
        catalog: getCatalogForPrompt(),
        language: getAiContentLanguage(),
        onProgress: updateSuggestProgress
      });

      setTimedAiSuggestStatus(statusTitleKey, {
        subtitleKey: 'ai_status_applying',
        activeStep: 3,
        completedSteps: 3
      });
      applyAiSuggestions(suggestions, fingerprint);
      await storageService.saveAiSettingOptions(fingerprint, {
        ...suggestions,
        fingerprint
      }, getAiContentLanguage());

      setAiSuggestStatus('success', 'ai_status_done', { autoHideMs: 2200 });
      if (!silent) {
        showToast(i18n.t('toast_ai_suggest_success', [suggestions.detectedProduct || i18n.t('sg_general')]), 'success');
      }
    } catch (err) {
      console.error('AI Suggest failed:', err);
      setAiSuggestStatus(silent ? 'error' : 'hidden', 'ai_status_failed', {
        subtitleText: err.message,
        autoHideMs: silent ? 3500 : 0
      });
      if (!silent) {
        showToast(i18n.t('toast_ai_suggest_failed', [err.message]), 'error');
      }
    } finally {
      state.isSuggesting = false;
      await clearSidePanelAiTask();
      updateGenerateButton();
      dom.aiSuggestBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_ai_suggest');
      dom.aiSuggestBtn.classList.remove('sp-btn--loading');
    }
  }

  function renderPresetCards(presets) {
    if (!presets || presets.length === 0) {
      state.aiPresets = [];
      state.activePresetIndex = null;
      dom.aiPresetsContainer.hidden = true;
      return;
    }

    state.aiPresets = presets;
    state.activePresetIndex = 0;

    const icons = ['🌟', '📸', '🎨'];
    dom.aiPresetsContainer.innerHTML = presets.map((preset, i) => {
      const fallbackName = i18n.t(`preset_fallback_name_${i + 1}`) || `Preset ${i + 1}`;
      const fallbackDesc = i18n.t(`preset_fallback_desc_${i + 1}`) || `Đề xuất thiết lập mockup ${i + 1}`;
      const name = String(preset.name || '').trim() || fallbackName;
      const desc = String(preset.description || '').trim() || fallbackDesc;
      return `
        <div class="sp-preset-card" data-index="${i}">
          <div class="sp-preset-card__icon">${icons[i] || '✨'}</div>
          <div class="sp-preset-card__info">
            <div class="sp-preset-card__name">${escapeHtml(name)}</div>
            <div class="sp-preset-card__desc">${escapeHtml(desc)}</div>
          </div>
        </div>
      `;
    }).join('');

    dom.aiPresetsContainer.hidden = false;

    // Add click listeners
    dom.aiPresetsContainer.querySelectorAll('.sp-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        applyPreset(presets[idx], { presetIndex: idx });
      });
    });

    const firstCard = dom.aiPresetsContainer.querySelector('.sp-preset-card');
    if (firstCard && presets[0]) {
      applyPreset(presets[0], { silent: true, presetIndex: 0 });
      firstCard.classList.add('sp-preset-card--selected');
    }
  }

  function applyPreset(preset, options = {}) {
    if (!preset) return;

    if (Number.isInteger(options.presetIndex)) {
      state.activePresetIndex = options.presetIndex;
    } else {
      const presetIndex = state.aiPresets.indexOf(preset);
      if (presetIndex >= 0) state.activePresetIndex = presetIndex;
    }
    syncPresetCardSelection();
    syncAgentPresetCardSelection();

    // Apply scene
    if (preset.scene) {
      state.selectedScenes = [preset.scene];
      updateChips(dom.sceneChips, state.selectedScenes);
    }

    // Apply display mode
    if (preset.displayMode) dom.displayModeSelect.value = preset.displayMode;
    if (preset.style) dom.styleSelect.value = preset.style;
    if (preset.cameraAngle) dom.cameraSelect.value = preset.cameraAngle;
    if (preset.lighting) dom.lightingSelect.value = preset.lighting;
    if (preset.season) dom.seasonSelect.value = preset.season;

    // Apply person settings
    if (preset.needsPerson === false) {
      dom.noPersonToggle.checked = true;
    } else {
      dom.noPersonToggle.checked = false;
      if (preset.gender) dom.genderSelect.value = preset.gender;
    }
    handleNoPersonToggle();

    if (!options.silent) {
      const presetName = String(preset.name || '').trim() || i18n.t('preset_default_name') || 'Preset';
      showToast(i18n.t('toast_applied_preset', [presetName]), 'info');
    }

    if (!options.skipAgentRefresh) {
      refreshAgentQuickRepliesForCurrentStep();
    }
  }

  // ====== SELLER PRODUCT WRITING PROFILE ======
  function setOnboardingStep(step) {
    dom.onboardingSteps?.forEach(section => {
      section.hidden = !section.id.endsWith(step);
    });
  }

  function openCustomerOnboarding(step = 'welcome') {
    if (!dom.onboarding) return;
    dom.onboarding.hidden = false;
    setOnboardingStep(step);

    if (step === 'source') {
      const profile = state.draftCustomerProfile || state.activeCustomerProfile;
      const urls = [];
      if (profile && Array.isArray(profile.sources)) {
        profile.sources.forEach(src => {
          if (src.type === 'url' && src.value) {
            urls.push(src.value);
          }
        });
      }
      renderCustomerUrlInputs(urls);

      // Restore brief
      if (dom.customerBriefInput) {
        let briefValue = '';
        if (profile && Array.isArray(profile.sources)) {
          const briefSrc = profile.sources.find(src => src.type === 'brief');
          if (briefSrc) briefValue = briefSrc.value || '';
        }
        dom.customerBriefInput.value = briefValue;
      }

      // Restore profile name
      if (dom.onboardingProfileName) {
        dom.onboardingProfileName.value = profile?.name || i18n.t('profile_default_name');
      }
    }
  }

  function closeCustomerOnboarding() {
    if (dom.onboarding) dom.onboarding.hidden = true;
  }

  function getCustomerProfileUrls() {
    if (!dom.customerUrlsContainer) return [];
    const inputs = dom.customerUrlsContainer.querySelectorAll('.sp-onboarding-url-input');
    const urls = [];
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val && /^https?:\/\//i.test(val)) {
        urls.push(val);
      }
    });
    return [...new Set(urls)];
  }

  function renderCustomerUrlInputs(urls = []) {
    if (!dom.customerUrlsContainer) return;
    const validUrls = urls.filter(url => url && url.trim().length > 0);
    dom.customerUrlsContainer.innerHTML = '';
    validUrls.forEach(url => {
      addUrlInputRow(url);
    });
    addUrlInputRow('');
    updateRemoveButtonsVisibility();
  }

  function addUrlInputRow(value = '') {
    const row = document.createElement('div');
    row.className = 'sp-url-input-row';

    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'sp-input sp-onboarding-url-input';
    input.value = value;
    input.placeholder = i18n.t('onboarding_urls_placeholder');

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'sp-btn-remove-url';
    removeBtn.title = i18n.currentLanguage === 'vi' ? 'Xóa' : 'Remove';
    removeBtn.innerHTML = '✕';

    row.appendChild(input);
    row.appendChild(removeBtn);
    dom.customerUrlsContainer.appendChild(row);

    input.addEventListener('input', () => {
      const rows = dom.customerUrlsContainer.querySelectorAll('.sp-url-input-row');
      const lastRow = rows[rows.length - 1];
      const lastInput = lastRow?.querySelector('.sp-onboarding-url-input');

      if (input === lastInput && input.value.trim() !== '') {
        addUrlInputRow('');
        updateRemoveButtonsVisibility();
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!dom.customerUrlsContainer) return;
        const rows = dom.customerUrlsContainer.querySelectorAll('.sp-url-input-row');
        if (rows.length > 1 && input.value.trim() === '' && input !== rows[rows.length - 1]?.querySelector('.sp-onboarding-url-input')) {
          row.remove();
          updateRemoveButtonsVisibility();
        }
      }, 150);
    });

    removeBtn.addEventListener('click', () => {
      const rows = dom.customerUrlsContainer.querySelectorAll('.sp-url-input-row');
      if (rows.length === 1) {
        input.value = '';
        updateRemoveButtonsVisibility();
      } else {
        row.remove();
        updateRemoveButtonsVisibility();
      }
    });
  }

  function updateRemoveButtonsVisibility() {
    if (!dom.customerUrlsContainer) return;
    const rows = dom.customerUrlsContainer.querySelectorAll('.sp-url-input-row');
    rows.forEach(row => {
      const removeBtn = row.querySelector('.sp-btn-remove-url');
      const input = row.querySelector('.sp-onboarding-url-input');

      if (rows.length === 1 && input?.value.trim() === '') {
        if (removeBtn) removeBtn.style.visibility = 'hidden';
      } else {
        if (removeBtn) removeBtn.style.visibility = 'visible';
      }
    });
  }

  function stringifyProfileList(values) {
    return Array.isArray(values) ? values.filter(Boolean).join(', ') : '';
  }

  function renderCustomerProfileReview(profile) {
    if (!profile) return;
    if (dom.profileReviewName) dom.profileReviewName.value = profile.name || '';
    if (dom.profileReviewAudience) dom.profileReviewAudience.value = profile.audience?.summary || '';
    if (dom.profileReviewCopy) {
      dom.profileReviewCopy.value = profile.copyStyle?.userGuidance || [
          stringifyProfileList(profile.copyStyle?.tone),
          stringifyProfileList(profile.copyStyle?.titlePatterns),
          stringifyProfileList(profile.copyStyle?.descriptionStructure)
        ].filter(Boolean).join('\n');
    }
    if (dom.profileReviewVisual) {
      dom.profileReviewVisual.value = profile.visualStyle?.userGuidance
        || profile.visualStyle?.summary
        || stringifyProfileList(profile.visualStyle?.photographyStyles);
    }
    if (dom.profileReviewRules) {
      dom.profileReviewRules.value = stringifyProfileList([
        ...(profile.copyStyle?.bannedTerms || []),
        ...(profile.visualStyle?.avoid || [])
      ]);
    }
  }

  function updateCustomerProfileUI() {
    const profile = state.activeCustomerProfile;
    if (dom.customerProfileBar) dom.customerProfileBar.hidden = !profile;
    if (dom.customerProfileChip) dom.customerProfileChip.hidden = !profile;
    if (dom.customerProfileChipName) {
      dom.customerProfileChipName.textContent = profile?.name || i18n.t('customer_profile_default_name');
    }
    if (dom.customerProfileName) {
      dom.customerProfileName.textContent = profile?.name || i18n.t('customer_profile_default_name');
    }
    if (dom.customerProfileSummary) dom.customerProfileSummary.hidden = !profile;
    if (dom.customerProfileStatus) {
      dom.customerProfileStatus.hidden = !profile;
      dom.customerProfileStatus.classList.toggle('sp-profile-status--active', !!profile);
    }
    if (dom.customerProfileEditBtn) dom.customerProfileEditBtn.hidden = !profile;
    if (dom.customerProfileDisableBtn) dom.customerProfileDisableBtn.hidden = !profile;
    if (dom.customerProfileSetupBtn) dom.customerProfileSetupBtn.hidden = !!profile;
  }

  async function loadCustomerProfileState() {
    state.activeCustomerProfile = await storageService.getActiveCustomerProfile();
    updateCustomerProfileUI();
    const onboardingState = await storageService.getOnboardingState();
    state.customerOnboardingStatus = onboardingState.status || 'new';
    if (onboardingState.status === 'new') {
      openCustomerOnboarding('welcome');
    }
  }

  async function handleAnalyzeCustomerProfile() {
    if (state.isAnalyzingCustomerProfile || state.isGenerating || state.isSuggesting) {
      showToast(i18n.t('customer_profile_ai_busy'), 'error');
      return;
    }
    const urls = getCustomerProfileUrls();
    const brief = String(dom.customerBriefInput?.value || '').trim();
    if (urls.length === 0) {
      showToast(i18n.t('customer_profile_source_required'), 'error');
      return;
    }

    state.isAnalyzingCustomerProfile = true;
    updateGenerateButton();
    setOnboardingStep('analyzing');
    if (dom.profileAnalysisStatus) dom.profileAnalysisStatus.textContent = i18n.t('customer_profile_analyzing');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_CUSTOMER_PROFILE',
        request: {
          urls,
          brief,
          language: getAiContentLanguage()
        }
      });
      if (response?.cancelled) {
        setOnboardingStep('source');
        return;
      }
      if (!response?.success || !response.profile) {
        throw new Error(response?.error || i18n.t('customer_profile_analysis_failed'));
      }

      state.draftCustomerProfile = {
        version: 1,
        id: state.activeCustomerProfile?.id
          || (globalThis.crypto?.randomUUID?.() || `profile_${Date.now()}`),
        status: 'ready',
        sources: [
          ...(response.urlSources || urls.map(value => ({ type: 'url', value, status: 'failed' }))),
          ...(brief ? [{ type: 'brief', value: brief, status: 'used' }] : [])
        ],
        ...response.profile
      };
      if (dom.onboardingProfileName?.value.trim()) {
        state.draftCustomerProfile.name = dom.onboardingProfileName.value.trim();
      }
      renderCustomerProfileReview(state.draftCustomerProfile);
      setOnboardingStep('review');
    } catch (err) {
      console.error('Customer profile analysis failed:', err);
      showToast(err.message, 'error');
      setOnboardingStep('source');
    } finally {
      state.isAnalyzingCustomerProfile = false;
      updateGenerateButton();
    }
  }

  async function handleSaveCustomerProfile() {
    if (!state.draftCustomerProfile) return;
    const profile = {
      ...state.draftCustomerProfile,
      name: dom.profileReviewName?.value.trim() || state.draftCustomerProfile.name || i18n.t('customer_profile_default_name'),
      audience: {
        ...(state.draftCustomerProfile.audience || {}),
        summary: dom.profileReviewAudience?.value.trim() || state.draftCustomerProfile.audience?.summary || ''
      },
      copyStyle: {
        ...(state.draftCustomerProfile.copyStyle || {}),
        userGuidance: dom.profileReviewCopy?.value.trim() || '',
        bannedTerms: String(dom.profileReviewRules?.value || '')
          .split(',')
          .map(value => value.trim())
          .filter(Boolean)
      },
      visualStyle: {
        ...(state.draftCustomerProfile.visualStyle || {}),
        userGuidance: dom.profileReviewVisual?.value.trim() || '',
        avoid: String(dom.profileReviewRules?.value || '')
          .split(',')
          .map(value => value.trim())
          .filter(Boolean)
      }
    };

    state.activeCustomerProfile = await storageService.saveCustomerProfile(profile);
    await storageService.saveOnboardingState({ status: 'completed' });
    state.customerOnboardingStatus = 'completed';
    updateCustomerProfileUI();
    closeCustomerOnboarding();
    state.aiOptionsFingerprint = null;
    showToast(i18n.t('customer_profile_saved'), 'success');
  }

  async function handleSkipCustomerOnboarding() {
    await storageService.saveOnboardingState({ status: 'skipped' });
    state.customerOnboardingStatus = 'skipped';
    closeCustomerOnboarding();
  }

  async function handleCancelCustomerProfileAnalysis() {
    if (!state.isAnalyzingCustomerProfile) {
      openCustomerOnboarding('source');
      return;
    }
    await chrome.runtime.sendMessage({ type: 'CANCEL_CUSTOMER_PROFILE_ANALYSIS' });
  }

  async function handleDisableCustomerProfile() {
    await storageService.setActiveCustomerProfile(null);
    state.activeCustomerProfile = null;
    await saveCurrentSettings();
    updateCustomerProfileUI();
    state.aiOptionsFingerprint = null;
    showToast(i18n.t('customer_profile_disabled'), 'info');
  }

  async function handleCustomerProfileStorageChange(changes, areaName) {
    if (areaName !== 'local') return;
    if (!changes.customerProfiles && !changes.activeCustomerProfileId) return;
    const nextProfile = await storageService.getActiveCustomerProfile();
    const previousProfileId = state.activeCustomerProfile?.id || null;
    state.activeCustomerProfile = nextProfile;
    if (previousProfileId !== (nextProfile?.id || null)) state.aiOptionsFingerprint = null;
    updateCustomerProfileUI();
    updateGenerateButton();
  }

  async function setSidePanelAiTask(taskType) {
    await chrome.storage.local.set({
      sidePanelAiTask: {
        status: 'running',
        taskType,
        startedAt: Date.now()
      }
    });
  }

  async function clearSidePanelAiTask() {
    await chrome.storage.local.remove('sidePanelAiTask');
  }

  function getAiContentLanguage() {
    return dom.aiContentLanguageSelect?.value || dom.languageSelect?.value || i18n.currentLanguage || 'vi';
  }

  function aiText(viText, enText) {
    return getAiContentLanguage() === 'vi' ? viText : enText;
  }

  // ====== CHAT UI & AGENT FLOW ======
  function switchUIMode(mode) {
    state.activeUIMode = mode;
    document.body.setAttribute('data-ui-mode', mode);

    dom.modeAgentBtn?.classList.toggle('active', mode === 'agent');
    dom.modeFormBtn?.classList.toggle('active', mode === 'form');

    if (mode === 'agent') {
      initChatFlow();
    }
  }

  function parseMarkdown(text) {
    if (!text) return '';
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  function appendChatMessage(sender, text, type = 'text', data = null) {
    if (!dom.chatHistory) return;

    const msg = { sender, text, type, data, timestamp: Date.now() };
    state.chatMessages.push(msg);

    const messageDiv = document.createElement('div');
    messageDiv.className = `sp-chat-msg sp-chat-msg--${sender} sp-chat-msg--${type}`;
    if (data?.msgId) {
      messageDiv.id = data.msgId;
    }

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'sp-chat-avatar';
    avatarDiv.textContent = sender === 'agent' ? '🍔' : '👤';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'sp-chat-bubble';

    if (type === 'text') {
      bubbleDiv.innerHTML = parseMarkdown(text);
    } else if (type === 'summary') {
      bubbleDiv.innerHTML = text;
    } else if (type === 'progress') {
      bubbleDiv.innerHTML = `
        <div class="sp-chat-msg__text">${parseMarkdown(text)}</div>
        <div class="sp-chat-msg__progress">
          <div class="sp-chat-msg__progress-bar">
            <div class="sp-chat-msg__progress-fill" style="width: ${data.progress}%"></div>
          </div>
        </div>
      `;
    } else if (type === 'results') {
      bubbleDiv.innerHTML = text;
    } else if (type === 'error') {
      bubbleDiv.innerHTML = `<span style="color:var(--sp-danger)">${parseMarkdown(text)}</span>`;
    }

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(bubbleDiv);
    dom.chatHistory.appendChild(messageDiv);
    dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
    return messageDiv;
  }

  function showQuickReplies(replies) {
    if (!dom.chatQuickReplies) return;
    if (!replies || replies.length === 0) {
      dom.chatQuickReplies.innerHTML = '';
      dom.chatQuickReplies.style.display = 'none';
      return;
    }

    dom.chatQuickReplies.style.display = 'flex';
    dom.chatQuickReplies.innerHTML = replies.map(reply => `
      <button class="sp-chat-reply-chip ${reply.primary ? 'sp-chat-reply-chip--primary' : ''}"
              data-value="${escapeHtml(reply.value)}"
              data-label="${escapeHtml(reply.label)}">
        ${escapeHtml(reply.label)}
      </button>
    `).join('');

    dom.chatQuickReplies.querySelectorAll('.sp-chat-reply-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        handleUserChatResponse(chip.dataset.value, chip.dataset.label);
      });
    });
  }

  function handleUserChatResponse(value, label) {
    appendChatMessage('user', label || value);
    showQuickReplies([]);
    showChatTyping(true);

    setTimeout(() => {
      showChatTyping(false);
      processNextChatStep(value, label);
    }, 600);
  }

  function showChatTyping(show, text) {
    if (!dom.chatTyping) return;
    dom.chatTyping.hidden = !show;
    if (show && text) {
      const textSpan = dom.chatTyping.querySelector('.sp-chat-typing__text');
      if (textSpan) textSpan.textContent = text;
    }
  }

  function initChatFlow() {
    if (!dom.chatHistory) return;
    dom.chatHistory.innerHTML = '';
    state.chatMessages = [];
    state.chatStep = 0;
    dom.chatInput.value = '';

    if (!geminiService.apiKey) {
      appendChatMessage('agent', i18n.t('btn_generate_no_key'));
      showQuickReplies([
        { label: aiText('⚙️ Cấu hình API Key', '⚙️ Configure API Key'), value: 'go_to_settings', primary: true }
      ]);
      return;
    }

    if (!state.productData) {
      appendChatMessage('agent', aiText(
        'Xin chào! Vui lòng mở trang tạo sản phẩm trên BurgerPrints để tôi có thể giúp bạn tạo mockup.',
        'Hello! Please open a BurgerPrints product creation page so I can help you create mockups.'
      ));
      showQuickReplies([
        { label: aiText('↻ Quét lại sản phẩm', '↻ Rescan product'), value: 'refresh_product', primary: true }
      ]);
      return;
    }

    const welcomeMsg = aiText(
      'Xin chào! Tôi là Worki - Trợ lý AI sáng tạo từ BurgerStudio AI. Tôi sẽ đồng hành cùng bạn để hô biến thiết kế này thành những bức ảnh mockup sống động, chân thực và thu hút khách hàng nhất. Hãy cùng bắt đầu với vài câu hỏi nhanh nhé!',
      "Hi there! I'm Worki - your creative AI assistant from BurgerStudio AI. Let's turn your design into hyper-realistic, eye-catching mockup images that sell. Ready for a few quick questions?"
    );
    appendChatMessage('agent', welcomeMsg);

    setTimeout(() => {
      if (state.aiPresets.length > 0) {
        askPresetQuestion();
      } else {
        askDisplayModeQuestion();
      }
    }, 400);
  }

  function askPresetQuestion() {
    state.chatStep = 'preset';
    const text = aiText(
      'Bước 1: Chọn đề xuất thiết lập cho mockup:',
      'Step 1: Choose a mockup setup preset:'
    );

    appendChatMessage('agent', `${parseMarkdown(text)}${renderAgentPresetCardsHtml()}`, 'summary');
    attachAgentPresetCardHandlers();
    showQuickReplies([]);
  }

  function askDisplayModeQuestion() {
    state.chatStep = 1;
    const text = aiText(
      'Bước 1: Chọn cách hiển thị sản phẩm giống danh sách trong Chế độ Chuyên gia:',
      'Step 1: Choose how this product should be shown, matching the Expert Mode options:'
    );

    appendChatMessage('agent', text);
    showQuickReplies(getDisplayModeReplies());
  }

  function askModelDemographicsQuestion() {
    state.chatStep = 2;
    const text = aiText(
      'Bước 2: Bạn muốn người mẫu có quốc tịch, giới tính và độ tuổi nào?',
      'Step 2: What nationality, gender, and age should the model have?'
    );

    const isKids = state.currentSupergroup === 'KIDS';

    const options = [
      { label: aiText('🇺🇸 Người mẫu Mỹ (Nữ Trẻ)', '🇺🇸 US model (young female)'), value: 'model|US|female|young_adult', primary: true },
      { label: aiText('🇻🇳 Người mẫu Việt (Nữ Trẻ)', '🇻🇳 Vietnamese model (young female)'), value: 'model|VN|female|young_adult' },
      { label: aiText('🇰🇷 Người mẫu Hàn (Nữ Trẻ)', '🇰🇷 Korean model (young female)'), value: 'model|KR|female|young_adult' },
      { label: aiText('🇺🇸 Người mẫu Mỹ (Nam Trẻ)', '🇺🇸 US model (young male)'), value: 'model|US|male|young_adult' },
      { label: aiText('🇻🇳 Người mẫu Việt (Nam Trẻ)', '🇻🇳 Vietnamese model (young male)'), value: 'model|VN|male|young_adult' }
    ];

    if (isKids) {
      options.unshift(
        { label: aiText('👶 Trẻ em Mỹ', '👶 US child'), value: 'model|US|any|child', primary: true },
        { label: aiText('👶 Trẻ em Việt', '👶 Vietnamese child'), value: 'model|VN|any|child' }
      );
    }

    appendChatMessage('agent', text);
    showQuickReplies(options);
  }

  function askSceneQuestion() {
    state.chatStep = 3;
    const text = aiText(
      'Bước 3: Chọn bối cảnh hoặc nền cho ảnh mockup của bạn:',
      'Step 3: Choose the scene or background for your mockup:'
    );

    appendChatMessage('agent', text);
    showQuickReplies(getSceneReplies());
  }

  function askStyleQuestion() {
    state.chatStep = 4;
    const text = aiText(
      'Bước 4: Chọn phong cách nhiếp ảnh và số lượng ảnh mockup cần sinh:',
      'Step 4: Choose the photography style and number of mockup images:'
    );

    appendChatMessage('agent', text);
    showQuickReplies(getStyleReplies());
  }

  function getNativeSelectOptions(select) {
    if (!select) return [];
    return Array.from(select.options).map(option => ({
      id: option.value,
      label: option.textContent.trim()
    }));
  }

  function renderAgentEditorOptions(options, selectedValue) {
    return (options || []).map(option => `
      <option value="${escapeHtml(option.id)}" ${option.id === selectedValue ? 'selected' : ''}>
        ${escapeHtml(option.label || option.id)}
      </option>
    `).join('');
  }

  function renderAgentEditorSelect(setting, label, options, selectedValue) {
    return `
      <label class="sp-chat-settings-editor__field">
        <span>${escapeHtml(label)}</span>
        <select class="sp-chat-settings-editor__select" data-agent-setting="${escapeHtml(setting)}">
          ${renderAgentEditorOptions(options, selectedValue)}
        </select>
      </label>
    `;
  }

  function getPrimarySelection(values, fallback) {
    return Array.isArray(values) && values.length > 0 ? values[0] : fallback;
  }

  function getAgentSummaryLabels(settings) {
    const nationalities = (settings.countries || ['US']).map(c => i18n.t(`nat_${c.toLowerCase()}`) || c).join(', ');
    const scenes = (settings.scenes || ['outdoor']).map(s => getCurrentSettingLabel('scenes', s)).join(', ');

    return {
      display: getCurrentSettingLabel('displayModes', settings.displayMode),
      model: settings.noPerson
        ? aiText('Không người mẫu', 'No model')
        : `${nationalities} (${i18n.t(`gender_${settings.gender}`)}, ${i18n.t(`age_${settings.ageGroup}`)}, ${i18n.t(`group_${settings.groupType}`)})`,
      scene: scenes,
      style: getCurrentSettingLabel('photographyStyles', settings.style),
      camera: getCurrentSettingLabel('cameraAngles', settings.cameraAngle),
      lighting: getCurrentSettingLabel('lightingOptions', settings.lighting),
      season: dom.seasonSelect?.selectedOptions?.[0]?.textContent?.trim() || settings.season,
      count: `${settings.count} ${aiText('ảnh', 'image(s)')}`,
      note: settings.additionalPrompt
    };
  }

  function renderAgentSettingsEditorHtml(settings) {
    const optionSets = getCurrentOptionSets();
    const supergroupConfig = SUPERGROUP_CONFIGS[state.currentSupergroup] || SUPERGROUP_CONFIGS.GENERAL;
    const showModel = supergroupConfig.showModel !== false;
    const showSeason = supergroupConfig.showSeason !== false;
    const sceneValue = getPrimarySelection(settings.scenes, getRecommendedOptionId(optionSets.scenes, 'outdoor'));
    const countryValue = getPrimarySelection(settings.countries, 'US');
    const modelDisabledClass = settings.noPerson ? ' sp-chat-settings-editor__model--disabled' : '';

    return `
      <details class="sp-chat-settings-editor">
        <summary class="sp-chat-settings-editor__summary">
          <span>${aiText('Tinh chỉnh thiết lập', 'Customize settings')}</span>
          <span class="sp-chat-settings-editor__summary-meta">${aiText('Như Chế độ Chuyên gia', 'Expert options')}</span>
        </summary>
        <div class="sp-chat-settings-editor__grid">
          ${renderAgentEditorSelect('displayMode', aiText('Cách hiển thị', 'Display'), optionSets.displayModes || [], settings.displayMode)}
          ${renderAgentEditorSelect('scene', aiText('Bối cảnh', 'Scene'), optionSets.scenes || [], sceneValue)}
          ${renderAgentEditorSelect('style', aiText('Phong cách', 'Style'), optionSets.photographyStyles || [], settings.style)}
          ${renderAgentEditorSelect('cameraAngle', aiText('Góc máy', 'Camera'), optionSets.cameraAngles || [], settings.cameraAngle)}
          ${renderAgentEditorSelect('lighting', aiText('Ánh sáng', 'Lighting'), optionSets.lightingOptions || [], settings.lighting)}
          ${showSeason ? renderAgentEditorSelect('season', aiText('Mùa / Dịp', 'Season'), getNativeSelectOptions(dom.seasonSelect), settings.season) : ''}
        </div>

        ${showModel ? `
          <label class="sp-chat-settings-editor__toggle">
            <input type="checkbox" data-agent-setting="noPerson" ${settings.noPerson ? 'checked' : ''}>
            <span>${aiText('Không người mẫu', 'No model')}</span>
          </label>

          <div class="sp-chat-settings-editor__model${modelDisabledClass}">
            ${renderAgentEditorSelect('country', aiText('Quốc tịch', 'Nationality'), getNativeSelectOptionsFromChips(dom.countryChips), countryValue)}
            ${renderAgentEditorSelect('gender', aiText('Giới tính', 'Gender'), getNativeSelectOptions(dom.genderSelect), settings.gender)}
            ${renderAgentEditorSelect('ageGroup', aiText('Độ tuổi', 'Age'), getNativeSelectOptions(dom.ageSelect), settings.ageGroup)}
            ${renderAgentEditorSelect('groupType', aiText('Nhóm', 'Group'), getNativeSelectOptions(dom.groupSelect), settings.groupType)}
          </div>
        ` : ''}

        <label class="sp-chat-settings-editor__field sp-chat-settings-editor__field--range">
          <span>${aiText('Số lượng ảnh', 'Image count')}</span>
          <input type="range" min="1" max="8" value="${escapeHtml(settings.count)}" data-agent-setting="count">
          <output>${escapeHtml(settings.count)}</output>
        </label>

        <label class="sp-chat-settings-editor__field sp-chat-settings-editor__field--wide">
          <span>${aiText('Mô tả bổ sung', 'Additional prompt')}</span>
          <textarea class="sp-chat-settings-editor__textarea" rows="2" data-agent-setting="additionalPrompt" placeholder="${escapeHtml(i18n.t('placeholder_additional'))}">${escapeHtml(settings.additionalPrompt || '')}</textarea>
        </label>
      </details>
    `;
  }

  function getNativeSelectOptionsFromChips(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll('.sp-chip')).map(chip => ({
      id: chip.dataset.value,
      label: chip.textContent.trim()
    }));
  }

  function updateAgentSummaryView(summaryCard) {
    if (!summaryCard) return;
    const settings = getSettings();
    const labels = getAgentSummaryLabels(settings);

    summaryCard.querySelector('[data-agent-summary="display"]')?.replaceChildren(document.createTextNode(labels.display));
    summaryCard.querySelector('[data-agent-summary="model"]')?.replaceChildren(document.createTextNode(labels.model));
    summaryCard.querySelector('[data-agent-summary="scene"]')?.replaceChildren(document.createTextNode(labels.scene));
    summaryCard.querySelector('[data-agent-summary="style"]')?.replaceChildren(document.createTextNode(`${labels.style} (${aiText('Ánh sáng', 'Lighting')}: ${labels.lighting})`));
    summaryCard.querySelector('[data-agent-summary="camera"]')?.replaceChildren(document.createTextNode(labels.camera));
    summaryCard.querySelector('[data-agent-summary="season"]')?.replaceChildren(document.createTextNode(labels.season));
    summaryCard.querySelector('[data-agent-summary="count"]')?.replaceChildren(document.createTextNode(labels.count));

    const noteItem = summaryCard.querySelector('[data-agent-summary-item="note"]');
    const noteValue = summaryCard.querySelector('[data-agent-summary="note"]');
    if (noteItem && noteValue) {
      noteItem.hidden = !labels.note;
      noteValue.textContent = labels.note || '';
    }

    const modelEditor = summaryCard.querySelector('.sp-chat-settings-editor__model');
    if (modelEditor) {
      modelEditor.classList.toggle('sp-chat-settings-editor__model--disabled', settings.noPerson);
    }
    const noPersonCheckbox = summaryCard.querySelector('[data-agent-setting="noPerson"]');
    if (noPersonCheckbox) {
      noPersonCheckbox.checked = settings.noPerson;
    }
  }

  function syncAgentEditorSetting(target) {
    const setting = target?.dataset?.agentSetting;
    if (!setting) return;

    if (setting === 'displayMode') {
      applyAgentDisplayMode(target.value);
    } else if (setting === 'scene') {
      state.selectedScenes = [target.value];
      updateChips(dom.sceneChips, state.selectedScenes);
    } else if (setting === 'style') {
      dom.styleSelect.value = target.value;
    } else if (setting === 'cameraAngle') {
      dom.cameraSelect.value = target.value;
    } else if (setting === 'lighting') {
      dom.lightingSelect.value = target.value;
    } else if (setting === 'season') {
      dom.seasonSelect.value = target.value;
    } else if (setting === 'noPerson') {
      dom.noPersonToggle.checked = target.checked;
      handleNoPersonToggle();
    } else if (setting === 'country') {
      state.selectedCountries = [target.value];
      updateChips(dom.countryChips, state.selectedCountries);
    } else if (setting === 'gender') {
      dom.genderSelect.value = target.value;
    } else if (setting === 'ageGroup') {
      dom.ageSelect.value = target.value;
    } else if (setting === 'groupType') {
      dom.groupSelect.value = target.value;
    } else if (setting === 'count') {
      dom.countSlider.value = target.value;
      dom.countDisplay.textContent = target.value;
      const output = target.closest('.sp-chat-settings-editor__field')?.querySelector('output');
      if (output) output.textContent = target.value;
    } else if (setting === 'additionalPrompt') {
      dom.additionalInput.value = target.value;
    }
  }

  function attachAgentSettingsEditorHandlers(container) {
    const summaryCard = container?.querySelector('.sp-chat-summary-card');
    const editor = container?.querySelector('.sp-chat-settings-editor');
    if (!summaryCard || !editor) return;

    editor.addEventListener('change', event => {
      syncAgentEditorSetting(event.target);
      updateAgentSummaryView(summaryCard);
      saveCurrentSettings().catch(err => console.warn('[BP AI Mockup] Failed to save chat settings:', err));
    });

    editor.addEventListener('input', event => {
      if (!event.target.matches('[data-agent-setting="count"], [data-agent-setting="additionalPrompt"]')) return;
      syncAgentEditorSetting(event.target);
      updateAgentSummaryView(summaryCard);
    });
  }

  function buildSummaryAndPromptForAgent() {
    state.chatStep = 5;
    const settings = getSettings();

    const supergroupConfig = SUPERGROUP_CONFIGS[state.currentSupergroup] || SUPERGROUP_CONFIGS.GENERAL;
    const showSeason = supergroupConfig.showSeason !== false;
    const labels = getAgentSummaryLabels(settings);
    const activePreset = state.aiPresets[state.activePresetIndex];
    const activePresetName = activePreset
      ? escapeHtml(String(activePreset.name || '').trim() || i18n.t(`preset_fallback_name_${state.activePresetIndex + 1}`) || `Preset ${state.activePresetIndex + 1}`)
      : '';
    const summaryTitle = aiText('Cấu hình Mockup AI đã thiết lập:', 'AI mockup setup ready:');
    const presetText = aiText('Đề xuất', 'Preset');
    const displayText = aiText('Cách hiển thị', 'Display mode');
    const modelText = aiText('Người mẫu', 'Model');
    const noModelText = aiText('Không người mẫu', 'No model');
    const sceneText = aiText('Bối cảnh', 'Scene');
    const styleText = aiText('Phong cách', 'Style');
    const lightingText = aiText('Ánh sáng', 'Lighting');
    const cameraText = aiText('Góc máy', 'Camera');
    const seasonText = aiText('Mùa / Dịp', 'Season');
    const countText = aiText('Số lượng', 'Quantity');
    const noteText = aiText('Ghi chú', 'Note');
    const generateText = aiText('🚀 Tạo Ảnh Mockup AI', '🚀 Generate AI Mockups');
    const resetText = aiText('🔄 Thiết lập lại', '🔄 Reset setup');

    let summaryHtml = `
      <div class="sp-chat-summary-card">
        <p><strong>${summaryTitle}</strong></p>
        <ul class="sp-chat-summary-card__list">
          ${activePresetName ? `<li>✨ ${presetText}: <strong>${activePresetName}</strong></li>` : ''}
          <li>👚 ${displayText}: <strong data-agent-summary="display">${escapeHtml(labels.display)}</strong></li>
          <li>🧑 ${modelText}: <strong data-agent-summary="model">${escapeHtml(labels.model || noModelText)}</strong></li>
          <li>📍 ${sceneText}: <strong data-agent-summary="scene">${escapeHtml(labels.scene)}</strong></li>
          <li>🎨 ${styleText}: <strong data-agent-summary="style">${escapeHtml(`${labels.style} (${lightingText}: ${labels.lighting})`)}</strong></li>
          <li>📷 ${cameraText}: <strong data-agent-summary="camera">${escapeHtml(labels.camera)}</strong></li>
          ${showSeason ? `<li>🎄 ${seasonText}: <strong data-agent-summary="season">${escapeHtml(labels.season)}</strong></li>` : ''}
          <li>📸 ${countText}: <strong data-agent-summary="count">${escapeHtml(labels.count)}</strong></li>
          <li data-agent-summary-item="note" ${settings.additionalPrompt ? '' : 'hidden'}>📝 ${noteText}: <em data-agent-summary="note">${escapeHtml(settings.additionalPrompt || '')}</em></li>
        </ul>
        ${renderAgentSettingsEditorHtml(settings)}
        <div class="sp-chat-results-actions">
          <button id="btn-chat-generate" class="sp-btn sp-btn--generate" type="button" style="padding:10px 14px; font-size:13px;">${generateText}</button>
          <button id="btn-chat-reset" class="sp-btn sp-btn--secondary" type="button" style="padding:8px 12px; font-size:12px; margin-top:6px;">${resetText}</button>
        </div>
      </div>
    `;

    const summaryMessage = appendChatMessage('agent', summaryHtml, 'summary');
    showQuickReplies([]);

    attachAgentSettingsEditorHandlers(summaryMessage);

    const genBtn = summaryMessage?.querySelector('#btn-chat-generate');
    const resetBtn = summaryMessage?.querySelector('#btn-chat-reset');

    if (genBtn) {
      genBtn.addEventListener('click', handleChatGenerate);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        appendChatMessage('user', aiText('Tôi muốn thiết lập lại', 'I want to reset the setup'));
        initChatFlow();
      });
    }
  }

  function applyAgentDisplayMode(displayMode) {
    const optionSets = getCurrentOptionSets();
    const selectedDisplayMode = (optionSets.displayModes || []).some(option => option.id === displayMode)
      ? displayMode
      : getRecommendedOptionId(optionSets.displayModes, dom.displayModeSelect.value || 'wearing');
    if (selectedDisplayMode) {
      dom.displayModeSelect.value = selectedDisplayMode;
    }

    const noPerson = isProductOnlyDisplayMode(selectedDisplayMode);
    dom.noPersonToggle.checked = noPerson;
    handleNoPersonToggle();
    return { displayMode: selectedDisplayMode, noPerson };
  }

  function processNextChatStep(value, label) {
    if (value === 'go_to_settings') {
      switchTab('settings');
      return;
    }
    if (value === 'refresh_product') {
      loadProductData();
      return;
    }

    if (state.chatStep === 'preset') {
      const parts = value.split('|');
      if (parts[0] === 'preset') {
        const presetIndex = parseInt(parts[1], 10);
        const preset = state.aiPresets[presetIndex];
        if (preset) {
          applyPreset(preset, {
            presetIndex,
            skipAgentRefresh: true,
            silent: true
          });
        }
      }

      buildSummaryAndPromptForAgent();
      return;
    }

    if (state.chatStep === 1) {
      const { noPerson } = applyAgentDisplayMode(value);
      const canUseModel = SUPERGROUP_CONFIGS[state.currentSupergroup]?.showModel !== false;

      if (noPerson || !canUseModel) {
        askSceneQuestion();
      } else {
        askModelDemographicsQuestion();
      }
      return;
    }

    if (state.chatStep === 2) {
      const parts = value.split('|');
      if (parts[0] === 'model') {
        const country = parts[1];
        const gender = parts[2];
        const age = parts[3];

        state.selectedCountries = [country];
        updateChips(dom.countryChips, state.selectedCountries);
        dom.genderSelect.value = gender;
        dom.ageSelect.value = age;
        dom.noPersonToggle.checked = false;
        handleNoPersonToggle();
      }

      askSceneQuestion();
      return;
    }

    if (state.chatStep === 3) {
      const parts = value.split('|');
      if (parts[0] === 'scene') {
        state.selectedScenes = [parts[1]];
        updateChips(dom.sceneChips, state.selectedScenes);
      }

      askStyleQuestion();
      return;
    }

    if (state.chatStep === 4) {
      const parts = value.split('|');
      if (parts[0] === 'style') {
        const optionSets = getCurrentOptionSets();
        const selectedStyle = (optionSets.photographyStyles || []).some(option => option.id === parts[1])
          ? parts[1]
          : getRecommendedOptionId(optionSets.photographyStyles, dom.styleSelect.value || 'lifestyle');

        dom.styleSelect.value = selectedStyle;
      }

      buildSummaryAndPromptForAgent();
      return;
    }
  }

  function handleUserTextInput() {
    if (!dom.chatInput) return;
    const text = dom.chatInput.value.trim();
    if (!text) return;

    dom.chatInput.value = '';
    appendChatMessage('user', text);

    if (state.chatStep === 0) {
      initChatFlow();
      return;
    }

    showChatTyping(true);
    setTimeout(() => {
      showChatTyping(false);

      dom.additionalInput.value = text;

      if (state.chatStep === 1) {
        const optionSets = getCurrentOptionSets();
        const defaultDisplayMode = getRecommendedOptionId(optionSets.displayModes, dom.displayModeSelect.value || 'wearing');
        const { noPerson } = applyAgentDisplayMode(defaultDisplayMode);
        const canUseModel = SUPERGROUP_CONFIGS[state.currentSupergroup]?.showModel !== false;
        if (noPerson || !canUseModel) {
          askSceneQuestion();
        } else {
          askModelDemographicsQuestion();
        }
      } else if (state.chatStep === 2) {
        askSceneQuestion();
      } else if (state.chatStep === 3) {
        askStyleQuestion();
      } else if (state.chatStep === 4) {
        buildSummaryAndPromptForAgent();
      } else if (state.chatStep === 5) {
        buildSummaryAndPromptForAgent();
      }
    }, 600);
  }

  async function handleChatGenerate() {
    const referenceImages = getSelectedReferenceImages();
    if (state.isGenerating || state.isSuggesting || state.isAnalyzingCustomerProfile || referenceImages.length === 0) return;

    state.isGenerating = true;
    await setSidePanelAiTask('chat-generate-mockups');
    state.isAddingMockups = false;
    state.generatedResults = [];
    state.selectedImages.clear();

    updateGenerateButton();

    const progressMsgId = `chat_progress_${Date.now()}`;
    const progressDiv = appendChatMessage('agent', i18n.t('progress_preparing'), 'progress', { progress: 3, msgId: progressMsgId });

    const settings = getSettings();
    await saveCurrentSettings();

    function updateChatProgress(percentage, text) {
      if (!progressDiv) return;
      const textSpan = progressDiv.querySelector('.sp-chat-msg__text');
      const fillSpan = progressDiv.querySelector('.sp-chat-msg__progress-fill');
      if (textSpan && typeof text === 'string') textSpan.textContent = text;
      if (fillSpan) fillSpan.style.width = `${percentage}%`;
    }

    try {
      updateChatProgress(8, i18n.t('progress_analyzing'));
      const productDescription = await geminiService.analyzeProduct(referenceImages);

      const results = await geminiService.generateMockups(
        referenceImages,
        productDescription,
        settings,
        progress => {
          const total = progress.total || settings.count || 3;
          const current = progress.current;

          if (progress.type === 'generating') {
            const pct = getGenerationProgressPercent(progress, total);
            updateChatProgress(pct, i18n.t('progress_generating_img', [current, total]));
          }
          if (progress.type === 'auditing') {
            const pct = getGenerationProgressPercent(progress, total);
            updateChatProgress(pct, i18n.t('progress_auditing_img', [current, total]));
          }
          if (progress.type === 'complete') {
            updateChatProgress(getGenerationProgressPercent(progress, total));
          }
          if (progress.type === 'error') {
            updateChatProgress(getGenerationProgressPercent(progress, total), progress.message || '');
          }
        }
      );

      state.generatedResults = results;

      await saveGeneratedSessionToHistory(results, settings);

      updateChatProgress(100, i18n.t('progress_done', [results.length]));
      showToast(i18n.t('toast_generation_success', [results.length]), 'success');

      setTimeout(() => {
        renderChatResults(results);
      }, 500);

      if (state.autoAddMockups && results.length > 0) {
        await addGeneratedMockupsToPage(results, { selectedOnly: false });
      }

    } catch (err) {
      console.error('Chat Generation failed:', err);
      showToast(i18n.t('toast_generation_failed', [err.message]), 'error');
      if (progressDiv) {
        progressDiv.querySelector('.sp-chat-msg__text').innerHTML = `<span style="color:var(--sp-danger)">${aiText('Lỗi', 'Error')}: ${escapeHtml(err.message)}</span>`;
        progressDiv.querySelector('.sp-chat-msg__progress').style.display = 'none';
      }
    } finally {
      state.isGenerating = false;
      await clearSidePanelAiTask();
      updateGenerateButton();
      updateStorageInfo();
    }
  }

  function renderChatResults(results) {
    if (!results || results.length === 0) return;

    const resultsTitle = aiText(
      `Mockup AI đã tạo thành công (${results.length} ảnh):`,
      `AI mockups generated successfully (${results.length} image${results.length === 1 ? '' : 's'}):`
    );
    const addSelectedText = aiText('➕ Thêm ảnh đã chọn', '➕ Add selected images');
    const startOverText = aiText('🔄 Bắt đầu cuộc hội thoại mới', '🔄 Start a new conversation');

    let resultsHtml = `
      <p><strong>${resultsTitle}</strong></p>
      <div class="sp-chat-results-grid">
    `;

    results.forEach((res, i) => {
      const auditClass = res.audit?.pass !== false ? 'pass' : 'fail';
      const auditLabel = res.audit?.pass !== false ? '✓ OK' : '⚠ Check';

      resultsHtml += `
        <div class="sp-result-card sp-result-card--new chat-result-card" data-index="${i}" style="margin: 0; cursor: pointer;">
          <img class="sp-result-card__image" src="${res.imageData}" alt="AI Mockup ${i + 1}" style="width:100%; border-radius:4px; display:block;">
          <div class="sp-result-card__checkbox">✓</div>
          <div class="sp-result-card__audit sp-result-card__audit--${auditClass}">${auditLabel}</div>
        </div>
      `;
    });

    resultsHtml += `
      </div>
      <div class="sp-chat-results-actions" style="margin-top: 10px;">
        <button id="btn-chat-add-selected" class="sp-btn sp-btn--primary" type="button" disabled>${addSelectedText}</button>
        <button id="btn-chat-start-over" class="sp-btn sp-btn--secondary" type="button" style="margin-top:6px;">${startOverText}</button>
      </div>
    `;

    appendChatMessage('agent', resultsHtml, 'results');

    const bubble = dom.chatHistory.lastElementChild;
    const cards = bubble.querySelectorAll('.chat-result-card');
    const addBtn = bubble.querySelector('#btn-chat-add-selected');
    const startOverBtn = bubble.querySelector('#btn-chat-start-over');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index, 10);

        if (state.selectedImages.has(index)) {
          state.selectedImages.delete(index);
          card.classList.remove('sp-result-card--selected');
        } else {
          state.selectedImages.add(index);
          card.classList.add('sp-result-card--selected');
        }

        const hasSelected = state.selectedImages.size > 0;
        if (addBtn) {
          addBtn.disabled = !hasSelected;
          addBtn.textContent = aiText('➕ Thêm ảnh đã chọn', '➕ Add selected images') + (hasSelected ? ` (${state.selectedImages.size})` : '');
        }
      });
    });

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addGeneratedMockupsToPage(state.generatedResults, { selectedOnly: true });
      });
    }

    if (startOverBtn) {
      startOverBtn.addEventListener('click', () => {
        appendChatMessage('user', i18n.t('chat_btn_start_over'));
        initChatFlow();
      });
    }
  }

  // ====== INITIALIZATION ======
  async function init() {
    await i18n.init();
    if (dom.languageSelect) {
      dom.languageSelect.value = i18n.currentLanguage;
    }
    if (dom.aiContentLanguageSelect) {
      dom.aiContentLanguageSelect.value = i18n.currentLanguage;
    }
    renderSettingOptions(getFallbackOptionSets('GENERAL'));
    await loadApiKey();
    await loadSettings();
    await loadCustomerProfileState();
    await loadProductData();
    await loadHistory();
    updateStorageInfo();
    setupEventListeners();
    updateGenerateButton();
    switchTab('generate');
    switchUIMode('form');
  }

  // ====== API KEY MANAGEMENT ======
  async function loadApiKey() {
    const key = await geminiService.loadApiKey();
    if (key) {
      dom.apiKeyInput.value = '••••••••••••••••••••';
      setApiKeyStatus('✓ ' + i18n.t('toast_key_saved'), 'success');
    }
  }

  function setApiKeyStatus(text, type) {
    dom.apiKeyStatus.textContent = text;
    dom.apiKeyStatus.className = `sp-settings__status sp-settings__status--${type}`;
  }

  async function handleSaveApiKey() {
    const key = dom.apiKeyInput.value.trim();
    if (!key || key.includes('•')) {
      showToast(i18n.t('toast_enter_valid_key'), 'error');
      return;
    }

    dom.saveKeyBtn.disabled = true;
    dom.saveKeyBtn.textContent = i18n.t('btn_save_key_testing');
    setApiKeyStatus(i18n.t('btn_save_key_testing'), '');

    try {
      await geminiService.testApiKey(key);
      await geminiService.saveApiKey(key);
      dom.apiKeyInput.value = '••••••••••••••••••••';
      setApiKeyStatus('✓ ' + i18n.t('toast_key_saved'), 'success');
      showToast(i18n.t('toast_key_saved'), 'success');
      updateGenerateButton();
      await maybeAutoSuggestSettings(false);
    } catch (err) {
      setApiKeyStatus(`✗ Invalid key: ${err.message}`, 'error');
      showToast(i18n.t('toast_key_failed'), 'error');
    } finally {
      dom.saveKeyBtn.disabled = false;
      dom.saveKeyBtn.textContent = 'Save';
    }
  }

  // ====== PRODUCT DATA ======
  async function loadProductData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_PRODUCT_DATA' });
      if (response?.success && response.data) {
        await handleProductDataLoaded(response.data, { autoSuggest: true });
      }
    } catch (err) {
      console.warn('Could not load product data:', err);
    }
  }

  async function handleProductDataLoaded(data, options = {}) {
    state.productData = data;
    resetReferenceImageSelection(data);
    renderProductPreview(data);

    const supergroup = detectSupergroup(getProductDetectionText(data));
    applySupergroupDefaults(supergroup);
    updateGenerateButton();

    if (options.autoSuggest !== false && state.customerOnboardingStatus !== 'new') {
      maybeAutoSuggestSettings(false).catch(err => {
        console.warn('[BP AI Mockup] Auto suggest failed:', err);
      });
    }
  }

  function renderProductPreview(data) {
    const hasMockups = data?.mockupImages?.length > 0;
    const hasDesign = !!data?.designImage;
    const hasData = data && (data.title || hasMockups || hasDesign);

    if (!hasData) {
      dom.productPreview.innerHTML = `
        <div class="sp-product-preview__placeholder">
          <p>Open a BurgerPrints product page to get started</p>
          <span class="sp-product-preview__icon">🛍️</span>
        </div>
      `;
      return;
    }

    const productTitle = getDisplayProductTitle(data);
    const productImages = state.referenceImageUrls.length > 0
      ? state.referenceImageUrls
      : getProductPreviewImages(data);
    const productList = productImages.length > 0
      ? productImages.map((src, i) => {
        const isSelected = state.selectedReferenceImageUrls.has(src);
        const title = getReferenceImageTitle(i, isSelected);
        return `
          <button type="button"
                  class="sp-product-preview__thumb ${isSelected ? 'sp-product-preview__thumb--selected' : ''}"
                  data-reference-url="${escapeHtml(src)}"
                  aria-pressed="${isSelected ? 'true' : 'false'}"
                  title="${escapeHtml(title)}">
            <img class="sp-product-preview__thumb-img"
                 src="${src}"
                 alt="${escapeHtml(productTitle)} ${i + 1}">
            <span class="sp-product-preview__check" aria-hidden="true">✓</span>
          </button>
        `;
      }).join('')
      : `<div class="sp-product-preview__empty">No product images found</div>`;

    dom.productPreview.innerHTML = `
      <div class="sp-product-preview__summary">
        <div class="sp-product-preview__name">${escapeHtml(productTitle)}</div>
      </div>
      <div class="sp-product-preview__mockups">
        ${productList}
      </div>
    `;
  }

  function getDisplayProductTitle(data) {
    const title = String(data?.title || '').trim();
    if (title) return title;
    return i18n.currentLanguage === 'vi' ? 'Sản phẩm chưa có tên' : 'Unnamed product';
  }

  function getProductDetectionText(data) {
    return [
      data?.title || '',
      data?.productType || ''
    ].join(' ');
  }

  function getProductPreviewImages(data) {
    const images = data?.mockupImages?.length > 0 ? data.mockupImages : [data?.designImage];
    return [...new Set(images.filter(Boolean))];
  }

  function resetReferenceImageSelection(data) {
    const images = getProductPreviewImages(data);
    state.referenceImageUrls = images;
    state.selectedReferenceImageUrls = new Set(images);
  }

  function getReferenceImageTitle(index, isSelected) {
    if (i18n.currentLanguage === 'vi') {
      return `${isSelected ? 'Bỏ chọn' : 'Chọn'} ảnh tham chiếu ${index + 1}`;
    }
    return `${isSelected ? 'Deselect' : 'Select'} reference image ${index + 1}`;
  }

  function getSelectedReferenceImages() {
    return state.referenceImageUrls.filter(src => state.selectedReferenceImageUrls.has(src));
  }

  function hasSelectedReferenceImages() {
    return getSelectedReferenceImages().length > 0;
  }

  function handleReferenceImageClick(event) {
    const button = event.target.closest('.sp-product-preview__thumb');
    if (!button) return;

    const src = button.dataset.referenceUrl;
    if (!src) return;

    if (state.selectedReferenceImageUrls.has(src)) {
      state.selectedReferenceImageUrls.delete(src);
    } else {
      state.selectedReferenceImageUrls.add(src);
    }

    state.aiOptionsFingerprint = null;
    renderProductPreview(state.productData);
    updateGenerateButton();
  }

  // ====== SETTINGS ======
  // ====== SETTINGS ======
  async function loadSettings() {
    const settings = await storageService.getSettings();
    state.selectedCountries = settings.countries;
    state.selectedScenes = settings.scenes;
    state.theme = settings.theme || 'auto';

    // Apply theme
    applyTheme(state.theme);

    // Apply language
    if (settings.language && dom.languageSelect) {
      dom.languageSelect.value = settings.language;
    }
    if (settings.aiContentLanguage && dom.aiContentLanguageSelect) {
      dom.aiContentLanguageSelect.value = settings.aiContentLanguage;
    }

    // Update chips
    updateChips(dom.countryChips, state.selectedCountries);
    updateChips(dom.sceneChips, state.selectedScenes);

    // Update all form fields
    dom.genderSelect.value = settings.gender || 'any';
    dom.ageSelect.value = settings.ageGroup || 'young_adult';
    dom.groupSelect.value = settings.groupType || 'solo';
    dom.noPersonToggle.checked = !!settings.noPerson;
    dom.displayModeSelect.value = settings.displayMode || 'wearing';
    dom.styleSelect.value = settings.style || 'lifestyle';
    dom.cameraSelect.value = settings.cameraAngle || 'full_body';
    dom.lightingSelect.value = settings.lighting || 'natural';
    dom.seasonSelect.value = settings.season || 'auto';
    dom.countSlider.value = settings.count;
    dom.countDisplay.textContent = settings.count;
    dom.additionalInput.value = settings.additionalPrompt || '';
    state.autoAddMockups = !!settings.autoAddMockups;
    dom.autoAddToggle.checked = state.autoAddMockups;
    state.autoSuggestAi = settings.autoSuggestAi === true;
    if (dom.autoSuggestAiToggle) {
      dom.autoSuggestAiToggle.checked = state.autoSuggestAi;
    }
    state.useLearnedSellerStyleForContent = settings.useLearnedSellerStyleForContent !== false;
    if (dom.learnedStyleContentToggle) {
      dom.learnedStyleContentToggle.checked = state.useLearnedSellerStyleForContent;
    }
    handleNoPersonToggle();
    updateAutoAddStatus();

    // Apply last known supergroup
    if (settings.lastSupergroup && settings.lastSupergroup !== 'GENERAL') {
      applySupergroupDefaults(settings.lastSupergroup);
    }
  }

  function applyTheme(theme) {
    let activeTheme = theme;
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    }

    document.body.setAttribute('data-theme', activeTheme);

    // Update icon Sun / Moon outline
    if (activeTheme === 'dark') {
      dom.themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
      dom.themeToggle.title = 'Chuyển sang chế độ Sáng';
    } else {
      dom.themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      dom.themeToggle.title = 'Chuyển sang chế độ Tối';
    }
  }

  async function handleThemeToggle() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    state.theme = newTheme;
    applyTheme(newTheme);
    await saveCurrentSettings();
  }

  function updateChips(container, activeValues) {
    const chips = container.querySelectorAll('.sp-chip');
    chips.forEach(chip => {
      const value = chip.dataset.value;
      chip.classList.toggle('sp-chip--active', activeValues.includes(value));
    });
  }

  function getSettings() {
    return {
      theme: state.theme,
      language: dom.languageSelect ? dom.languageSelect.value : 'vi',
      aiContentLanguage: getAiContentLanguage(),
      countries: state.selectedCountries,
      gender: dom.genderSelect.value,
      ageGroup: dom.ageSelect.value,
      groupType: dom.groupSelect.value,
      noPerson: dom.noPersonToggle.checked,
      style: dom.styleSelect.value,
      scenes: state.selectedScenes,
      displayMode: dom.displayModeSelect.value,
      cameraAngle: dom.cameraSelect.value,
      lighting: dom.lightingSelect.value,
      season: dom.seasonSelect.value,
      count: parseInt(dom.countSlider.value, 10),
      additionalPrompt: dom.additionalInput.value.trim(),
      autoAddMockups: state.autoAddMockups,
      autoSuggestAi: state.autoSuggestAi,
      useLearnedSellerStyleForContent: state.useLearnedSellerStyleForContent,
      lastSupergroup: state.currentSupergroup,
      optionPrompts: getOptionPromptMap()
    };
  }

  async function saveCurrentSettings() {
    const settings = getSettings();
    await storageService.saveSettings(settings);
  }

  // ====== GENERATION ======

  function updateGenerateButton() {
    const hasKey = !!geminiService.apiKey;
    const hasReferenceImages = state.referenceImageUrls.length > 0;
    const hasSelectedReferences = hasSelectedReferenceImages();
    dom.generateBtn.disabled = !hasKey || !hasSelectedReferences || state.isGenerating || state.isSuggesting || state.isAnalyzingCustomerProfile;
    dom.aiSuggestBtn.disabled = !hasKey || !hasSelectedReferences || state.isSuggesting || state.isGenerating || state.isAnalyzingCustomerProfile;

    if (!hasKey) {
      dom.generateBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_generate_no_key');
    } else if (!hasReferenceImages) {
      dom.generateBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_generate_no_product');
    } else if (!hasSelectedReferences) {
      dom.generateBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_generate_no_reference');
    } else {
      dom.generateBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_generate');
    }
  }

  async function handleGenerate() {
    const referenceImages = getSelectedReferenceImages();
    if (state.isGenerating || state.isSuggesting || state.isAnalyzingCustomerProfile || referenceImages.length === 0) return;

    state.isGenerating = true;
    await setSidePanelAiTask('generate-mockups');
    state.isAddingMockups = false;
    state.generatedResults = [];
    state.selectedImages.clear();

    updateGenerateButton();
    dom.generateBtn.classList.add('sp-btn--generate--loading');
    dom.generateBtn.querySelector('.sp-btn__icon').textContent = '⏳';

    // Show progress
    dom.progressSection.hidden = false;
    dom.resultsSection.hidden = false;
    dom.resultsGrid.innerHTML = '';
    dom.resultsCount.textContent = '0';
    updateResultActions();

    const settings = getSettings();
    await saveCurrentSettings();

    // Add skeleton placeholders
    for (let i = 0; i < settings.count; i++) {
      addSkeletonCard();
    }

    try {
      // Step 1: Analyze selected product reference images
      updateProgress(0, i18n.t('progress_analyzing'));
      const productDescription = await geminiService.analyzeProduct(referenceImages);

      // Step 2: Generate mockups with progressive display
      const results = await geminiService.generateMockups(
        referenceImages,
        productDescription,
        settings,
        handleGenerationProgress
      );

      state.generatedResults = results;

      await saveGeneratedSessionToHistory(results, settings);

      updateProgress(100, i18n.t('progress_done', [results.length]));
      showToast(i18n.t('toast_generation_success', [results.length]), 'success');

      if (state.autoAddMockups && results.length > 0) {
        await addGeneratedMockupsToPage(results, { selectedOnly: false });
      }

    } catch (err) {
      console.error('Generation failed:', err);
      showToast(i18n.t('toast_generation_failed', [err.message]), 'error');
      updateProgress(0, `Error: ${err.message}`);
    } finally {
      state.isGenerating = false;
      await clearSidePanelAiTask();
      dom.generateBtn.classList.remove('sp-btn--generate--loading');
      dom.generateBtn.querySelector('.sp-btn__icon').textContent = '🚀';
      updateGenerateButton();
      updateResultActions();
      updateStorageInfo();

      // Hide progress after a delay
      setTimeout(() => {
        dom.progressSection.hidden = true;
      }, 2000);
    }
  }

  function getGenerationProgressPercent(progress, total = progress.total || 1) {
    const completed = Math.max(0, Math.min(total, progress.completed || 0));
    const inFlightCredit = progress.type === 'auditing'
      ? 0.5
      : progress.type === 'generating'
        ? 0.15
        : 0;
    return Math.min(99, Math.round(((Math.min(total, completed + inFlightCredit)) / total) * 80 + 10));
  }

  function handleGenerationProgress(progress) {
    const total = progress.total;
    const current = progress.current;

    if (progress.type === 'generating') {
      const pct = getGenerationProgressPercent(progress, total);
      updateProgress(pct, i18n.t('progress_generating_img', [current, total]));
    }

    if (progress.type === 'auditing') {
      const pct = getGenerationProgressPercent(progress, total);
      updateProgress(pct, i18n.t('progress_auditing_img', [current, total]));
    }

    if (progress.type === 'complete') {
      // Replace skeleton with actual image
      replaceSkeletonWithResult(current - 1, progress.result);
      const resultCount = (parseInt(dom.resultsCount.textContent, 10) || 0) + 1;
      dom.resultsCount.textContent = resultCount.toString();
      updateProgress(getGenerationProgressPercent(progress, total), dom.progressText.textContent);
      updateDownloadButtons();
    }

    if (progress.type === 'error') {
      replaceSkeletonWithError(current - 1, progress.error);
      updateProgress(getGenerationProgressPercent(progress, total), progress.message || '');
    }
  }

  function updateProgress(percentage, text) {
    dom.progressBarFill.style.width = `${percentage}%`;
    dom.progressText.textContent = text;
  }

  function addSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'sp-result-card sp-result-card--loading';
    card.innerHTML = '<div class="sp-result-card__skeleton"></div>';
    dom.resultsGrid.appendChild(card);
  }

  function replaceSkeletonWithResult(index, result) {
    const cards = dom.resultsGrid.querySelectorAll('.sp-result-card');
    if (index >= cards.length) return;

    const card = cards[index];
    card.className = 'sp-result-card sp-result-card--new';
    card.dataset.index = index;

    const auditClass = result.audit?.pass !== false ? 'pass' : 'fail';
    const auditLabel = result.audit?.pass !== false ? '✓ OK' : '⚠ Check';

    card.innerHTML = `
      <img class="sp-result-card__image" src="${result.imageData}" alt="AI Mockup ${index + 1}">
      <div class="sp-result-card__checkbox">✓</div>
      <div class="sp-result-card__audit sp-result-card__audit--${auditClass}">${auditLabel}</div>
    `;

    card.addEventListener('click', () => toggleImageSelection(index, card));
  }

  function replaceSkeletonWithError(index, errorMsg) {
    const cards = dom.resultsGrid.querySelectorAll('.sp-result-card');
    if (index >= cards.length) return;

    const card = cards[index];
    card.className = 'sp-result-card';
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:12px;text-align:center;">
        <span style="color:var(--sp-danger);font-size:11px;">❌ ${escapeHtml(errorMsg)}</span>
      </div>
    `;
  }

  function toggleImageSelection(index, card) {
    if (state.selectedImages.has(index)) {
      state.selectedImages.delete(index);
      card.classList.remove('sp-result-card--selected');
    } else {
      state.selectedImages.add(index);
      card.classList.add('sp-result-card--selected');
    }
    updateDownloadButtons();
  }

  function updateResultActions() {
    const hasResults = state.generatedResults.length > 0;
    const hasSelected = state.selectedImages.size > 0;

    dom.downloadSelectedBtn.disabled = !hasSelected;
    dom.downloadAllBtn.disabled = !hasResults;
    dom.addSelectedMockupsBtn.disabled = !hasSelected || state.isAddingMockups;

    const selectedSuffix = hasSelected ? ` (${state.selectedImages.size})` : '';
    dom.addSelectedMockupsBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_add_selected') + selectedSuffix;
    dom.downloadSelectedBtn.querySelector('.sp-btn__text').textContent = i18n.t('btn_download_selected') + selectedSuffix;
    updateAutoAddStatus();
  }

  function updateDownloadButtons() {
    updateResultActions();
  }

  function updateAutoAddStatus(text) {
    if (text) {
      dom.autoAddStatus.textContent = text;
      return;
    }

    if (state.isAddingMockups) {
      dom.autoAddStatus.textContent = i18n.t('status_adding');
      return;
    }

    dom.autoAddStatus.textContent = state.autoAddMockups ? i18n.t('status_auto_mode') : i18n.t('status_manual_mode');
  }

  async function handleAutoAddToggle() {
    state.autoAddMockups = dom.autoAddToggle.checked;
    await saveCurrentSettings();
    updateResultActions();
  }

  function getMockupImagesForInsert(results, selectedOnly) {
    const sourceResults = selectedOnly
      ? Array.from(state.selectedImages).map(index => state.generatedResults[index])
      : results.filter(result => result?.audit?.pass !== false);

    return sourceResults
      .filter(result => result?.imageData)
      .map(result => result.imageData);
  }

  async function addGeneratedMockupsToPage(results = state.generatedResults, options = {}) {
    const selectedOnly = !!options.selectedOnly;
    const images = getMockupImagesForInsert(results, selectedOnly);

    if (images.length === 0) {
      const message = selectedOnly
        ? i18n.t('toast_select_first')
        : i18n.t('toast_no_pass_images');
      showToast(message, 'error');
      return;
    }

    state.isAddingMockups = true;
    updateResultActions();
    updateAutoAddStatus(i18n.t('status_adding_count', [images.length]));

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'INSERT_MOCKUPS',
        images
      });

      const insertResult = response?.data || response;
      if (!response?.success || insertResult?.success === false) {
        throw new Error(insertResult?.error || response?.error || 'Could not add images to Mockup section');
      }

      const addedCount = insertResult?.count || images.length;
      const verified = insertResult?.verified !== false;
      const toastMessage = verified
        ? i18n.t('toast_added_mockup', [addedCount])
        : i18n.t('toast_submitted_mockup', [addedCount]);
      showToast(toastMessage, 'success');
      updateAutoAddStatus(verified ? i18n.t('status_add_success', [addedCount]) : i18n.t('status_add_submitted', [addedCount]));
      await loadProductData();
    } catch (err) {
      console.error('Failed to add mockups:', err);
      showToast(i18n.t('toast_add_failed', [err.message]), 'error');
      updateAutoAddStatus(i18n.t('status_add_failed'));
    } finally {
      state.isAddingMockups = false;
      updateResultActions();
    }
  }

  // ====== DOWNLOAD ======
  function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleDownloadSelected() {
    const title = state.productData?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'mockup';
    let count = 0;

    state.selectedImages.forEach(index => {
      const result = state.generatedResults[index];
      if (result?.imageData) {
        count++;
        const filename = `${title}_ai_mockup_${count}.png`;
        setTimeout(() => downloadImage(result.imageData, filename), count * 200);
      }
    });

    if (count > 0) {
      showToast(i18n.t('toast_downloading_count', [count]), 'info');
    }
  }

  function handleDownloadAll() {
    const title = state.productData?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'mockup';

    state.generatedResults.forEach((result, index) => {
      if (result?.imageData) {
        const filename = `${title}_ai_mockup_${index + 1}.png`;
        setTimeout(() => downloadImage(result.imageData, filename), (index + 1) * 200);
      }
    });

    showToast(i18n.t('toast_downloading_count', [state.generatedResults.length]), 'info');
  }

  // ====== HISTORY ======
  async function saveGeneratedSessionToHistory(results, settings) {
    if (!Array.isArray(results) || results.length === 0) return null;

    const sessionId = `session_${Date.now()}`;
    try {
      await storageService.saveImages(sessionId, results);
      const entry = await storageService.addToHistory({
        id: sessionId,
        productTitle: state.productData?.title,
        images: results,
        settings
      });
      await loadHistory();
      return entry;
    } catch (err) {
      console.warn('[BP AI Mockup] Could not save generation history:', err);
      showToast(
        aiText(
          `Không thể lưu lịch sử: ${err.message}`,
          `Could not save history: ${err.message}`
        ),
        'warning'
      );
      return null;
    }
  }

  async function loadHistory() {
    const history = await storageService.getHistory();

    if (history.length === 0) {
      dom.historyList.innerHTML = `
        <div class="sp-empty">
          <div class="sp-empty__icon">📭</div>
          <p data-i18n="history_empty">${i18n.t('history_empty')}</p>
        </div>
      `;
      return;
    }

    dom.historyList.innerHTML = history.map(entry => {
      // Create a stable hash based on entry.id to generate consistent fake data
      let hash = 0;
      const idStr = entry.id || '';
      for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const sales = Math.abs(hash % 291) + 10; // 10 to 300
      const percentage = Math.abs(hash % 91) + 60; // 60% to 150%
      const isPositive = percentage >= 100;
      const ratioClass = isPositive ? 'sp-history-item__stat-badge--positive' : 'sp-history-item__stat-badge--negative';
      const trendIcon = isPositive ? '↑' : '↓';

      return `
        <div class="sp-history-item" data-id="${entry.id}">
          <span class="sp-history-item__icon">🖼️</span>
          <div class="sp-history-item__info">
            <div class="sp-history-item__title">${escapeHtml(entry.productTitle)}</div>
            <div class="sp-history-item__meta">${formatDate(entry.timestamp)}</div>
            <div class="sp-history-item__stats">
              <span class="sp-history-item__stat-badge sp-history-item__stat-badge--sales">
                📈 ${sales} ${i18n.t('history_sales_label')}
              </span>
              <span class="sp-history-item__stat-badge ${ratioClass}">
                ${trendIcon} ${percentage}% ${i18n.t('history_ratio_label')}
              </span>
            </div>
          </div>
          <span class="sp-history-item__count">${entry.count} ${i18n.t('history_imgs_suffix')}</span>
        </div>
      `;
    }).join('');

    // Add click listeners
    dom.historyList.querySelectorAll('.sp-history-item').forEach(item => {
      item.addEventListener('click', () => loadHistorySession(item.dataset.id));
    });
  }

  async function loadHistorySession(sessionId) {
    const images = await storageService.getImages(sessionId);
    if (images.length === 0) {
      showToast(i18n.t('toast_no_images_found'), 'error');
      return;
    }

    // Switch tab to generate
    switchTab('generate');

    state.generatedResults = images;
    state.selectedImages.clear();

    dom.resultsSection.hidden = false;
    dom.resultsGrid.innerHTML = '';
    dom.resultsCount.textContent = images.length.toString();

    images.forEach((img, index) => {
      const card = document.createElement('div');
      card.className = 'sp-result-card sp-result-card--new';
      card.dataset.index = index;

      const auditClass = img.audit?.pass !== false ? 'pass' : 'fail';
      const auditLabel = img.audit?.pass !== false ? '✓ OK' : '⚠ Check';

      card.innerHTML = `
        <img class="sp-result-card__image" src="${img.imageData}" alt="AI Mockup ${index + 1}">
        <div class="sp-result-card__checkbox">✓</div>
        <div class="sp-result-card__audit sp-result-card__audit--${auditClass}">${auditLabel}</div>
      `;

      card.addEventListener('click', () => toggleImageSelection(index, card));
      dom.resultsGrid.appendChild(card);
    });

    updateDownloadButtons();
    showToast(i18n.t('toast_loaded_history', [images.length]), 'info');
  }

  // ====== STORAGE INFO ======
  async function updateStorageInfo() {
    try {
      const usage = await storageService.getStorageUsage();
      const usedText = i18n.currentLanguage === 'vi' ? 'đã dùng' : 'used';
      if (usage.unlimited) {
        dom.storageBarFill.style.width = '0%';
        dom.storageInfo.textContent = `${usage.formattedUsed} ${usedText} (${i18n.currentLanguage === 'vi' ? 'không giới hạn' : 'unlimited'})`;
        return;
      }
      dom.storageBarFill.style.width = `${usage.percentage}%`;
      dom.storageInfo.textContent = `${usage.formattedUsed} / ${usage.formattedMax} ${usedText} (${usage.percentage}%)`;
    } catch (err) {
      dom.storageInfo.textContent = i18n.t('settings_storage_error');
    }
  }

  // ====== EVENT LISTENERS ======
  function setupEventListeners() {
    dom.onboardingStartBtn?.addEventListener('click', () => openCustomerOnboarding('source'));
    dom.onboardingSkipBtn?.addEventListener('click', handleSkipCustomerOnboarding);
    dom.onboardingCloseBtn?.addEventListener('click', handleCancelCustomerProfileAnalysis);
    dom.onboardingBackBtn?.addEventListener('click', () => openCustomerOnboarding('welcome'));
    dom.onboardingReviewBackBtn?.addEventListener('click', () => openCustomerOnboarding('source'));
    dom.onboardingAnalyzeBtn?.addEventListener('click', handleAnalyzeCustomerProfile);
    dom.onboardingSaveBtn?.addEventListener('click', handleSaveCustomerProfile);
    dom.customerProfileSetupBtn?.addEventListener('click', () => openCustomerOnboarding('source'));
    dom.customerProfileChip?.addEventListener('click', () => {
      if (!state.activeCustomerProfile) return;
      state.draftCustomerProfile = structuredClone(state.activeCustomerProfile);
      renderCustomerProfileReview(state.draftCustomerProfile);
      openCustomerOnboarding('review');
    });
    dom.customerProfileEditBtn?.addEventListener('click', () => {
      if (!state.activeCustomerProfile) return;
      state.draftCustomerProfile = structuredClone(state.activeCustomerProfile);
      renderCustomerProfileReview(state.draftCustomerProfile);
      openCustomerOnboarding('review');
    });
    dom.customerProfileDisableBtn?.addEventListener('click', handleDisableCustomerProfile);
    chrome.storage?.onChanged?.addListener(handleCustomerProfileStorageChange);

    // Settings toggle
    dom.settingsToggle.addEventListener('click', () => {
      if (state.currentTab === 'settings') {
        switchTab('generate');
      } else {
        switchTab('settings');
      }
    });

    // Tab buttons switching
    document.querySelectorAll('.sp-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Theme toggle
    dom.themeToggle.addEventListener('click', handleThemeToggle);

    // Provider selection click handling
    document.querySelectorAll('.sp-provider-item').forEach(item => {
      item.addEventListener('click', () => {
        const provider = item.dataset.provider;
        if (provider === 'gemini') {
          document.querySelectorAll('.sp-provider-item').forEach(p => p.classList.remove('active'));
          item.classList.add('active');
          document.getElementById('provider-config-gemini').classList.add('active');
        } else {
          showToast(i18n.t('provider_updating_alert'), 'warning');
        }
      });
    });

    // Save API key
    dom.saveKeyBtn.addEventListener('click', handleSaveApiKey);
    dom.apiKeyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveApiKey();
    });

    // Language select
    if (dom.languageSelect) {
      dom.languageSelect.addEventListener('change', async () => {
        const selectedLang = dom.languageSelect.value;
        await i18n.changeLanguage(selectedLang);
        await saveCurrentSettings();
        renderProductPreview(state.productData);
        state.aiOptionsFingerprint = null; // Invalidate current fingerprint cache to regenerate in new language
        applySupergroupDefaults(state.currentSupergroup);
        updateGenerateButton();
        updateResultActions();
        await loadHistory();
        updateStorageInfo();

        // Auto-refresh suggestions with the new language
        await maybeAutoSuggestSettings(true);
      });
    }

    if (dom.aiContentLanguageSelect) {
      dom.aiContentLanguageSelect.addEventListener('change', async () => {
        await saveCurrentSettings();
        state.aiOptionsFingerprint = null;
        if (state.activeUIMode === 'agent') initChatFlow();
        await maybeAutoSuggestSettings(true);
      });
    }

    // AI Auto Suggest toggle
    if (dom.autoSuggestAiToggle) {
      dom.autoSuggestAiToggle.addEventListener('change', async () => {
        state.autoSuggestAi = dom.autoSuggestAiToggle.checked;
        await saveCurrentSettings();
        if (state.autoSuggestAi) {
          maybeAutoSuggestSettings(false).catch(err => {
            console.warn('[BP AI Mockup] Auto suggest failed after toggle:', err);
          });
        }
      });
    }

    if (dom.learnedStyleContentToggle) {
      dom.learnedStyleContentToggle.addEventListener('change', async () => {
        state.useLearnedSellerStyleForContent = dom.learnedStyleContentToggle.checked;
        await saveCurrentSettings();
      });
    }

    // Clear history
    dom.clearHistoryBtn.addEventListener('click', async () => {
      if (confirm(i18n.t('confirm_clear_history'))) {
        await storageService.clearAllHistory();
        await loadHistory();
        updateStorageInfo();
        showToast(i18n.t('toast_history_cleared'), 'info');
      }
    });

    // Refresh product
    dom.refreshProductBtn.addEventListener('click', loadProductData);
    dom.productPreview.addEventListener('click', handleReferenceImageClick);

    // AI Suggest button
    dom.aiSuggestBtn.addEventListener('click', handleAiSuggest);

    // No Person toggle
    dom.noPersonToggle.addEventListener('change', handleNoPersonToggle);

    // Country chips (multi-select)
    dom.countryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.sp-chip');
      if (!chip) return;
      const value = chip.dataset.value;

      if (state.selectedCountries.includes(value)) {
        if (state.selectedCountries.length > 1) {
          state.selectedCountries = state.selectedCountries.filter(c => c !== value);
        }
      } else {
        state.selectedCountries.push(value);
      }

      updateChips(dom.countryChips, state.selectedCountries);
    });

    // Scene chips (multi-select)
    dom.sceneChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.sp-chip');
      if (!chip) return;
      const value = chip.dataset.value;

      if (state.selectedScenes.includes(value)) {
        if (state.selectedScenes.length > 1) {
          state.selectedScenes = state.selectedScenes.filter(s => s !== value);
        }
      } else {
        state.selectedScenes.push(value);
      }

      updateChips(dom.sceneChips, state.selectedScenes);
    });

    // Count slider
    dom.countSlider.addEventListener('input', () => {
      dom.countDisplay.textContent = dom.countSlider.value;
    });

    // Generate
    dom.generateBtn.addEventListener('click', handleGenerate);
    dom.autoAddToggle.addEventListener('change', handleAutoAddToggle);
    dom.addSelectedMockupsBtn.addEventListener('click', () => {
      addGeneratedMockupsToPage(state.generatedResults, { selectedOnly: true });
    });

    // Download
    dom.downloadSelectedBtn.addEventListener('click', handleDownloadSelected);
    dom.downloadAllBtn.addEventListener('click', handleDownloadAll);

    // UI Mode Selector switching
    dom.modeAgentBtn?.addEventListener('click', () => switchUIMode('agent'));
    dom.modeFormBtn?.addEventListener('click', () => switchUIMode('form'));

    // Chat Box events
    dom.chatSendBtn?.addEventListener('click', handleUserTextInput);
    dom.chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserTextInput();
      }
    });

    // History is now a standard tab, no toggle button needed

    // Listen for product data from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'PRODUCT_DATA_READY') {
        (async () => {
          await handleProductDataLoaded(message.data, { autoSuggest: true });
          sendResponse({ received: true });
        })();
        return true;
      }
      return true;
    });
  }

  // ====== UTILITIES ======
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.sp-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `sp-toast sp-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'sp-toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return i18n.t('time_just_now');
    if (diffMins < 60) return i18n.t('time_mins_ago', [diffMins]);
    if (diffHours < 24) return i18n.t('time_hours_ago', [diffHours]);
    if (diffDays < 7) return i18n.t('time_days_ago', [diffDays]);

    return date.toLocaleDateString(i18n.currentLanguage === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // ====== START ======
  init();
})();
