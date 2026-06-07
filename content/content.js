/**
 * BurgerPrints AI Mockup Generator - Content Script
 * Injects AI Mockup button and extracts product data from BurgerPrints
 */

(function () {
  'use strict';

  const BUTTON_ID = 'bp-ai-mockup-btn';
  const QUICK_BUTTON_ID = 'bp-ai-quick-mockup-btn';
  const QUICK_STATUS_ID = 'bp-ai-quick-status';
  const CONTENT_BUTTON_ID = 'bp-ai-product-content-btn';
  const FULL_EXPERIENCE_BUTTON_ID = 'bp-ai-full-experience-btn';
  const CONTENT_STATUS_ID = 'bp-ai-product-content-status';
  const OBSERVER_ATTR = 'data-bp-ai-observed';

  const TRANSLATIONS = {
    vi: {
      generator: 'Tạo Mockup Tùy Chỉnh',
      quickGenerator: 'Tạo Mockup Tự Động',
      quickStarting: 'Đang chuẩn bị...',
      contentGenerator: 'AI viết nội dung sản phẩm',
      contentGenerating: 'Đang viết nội dung...',
      contentSuccess: 'Đã điền nội dung sản phẩm. Hãy kiểm tra trước khi lưu.',
      fullExperienceGenerator: 'AI tạo ảnh + nội dung',
      fullExperienceGenerating: 'Đang tạo ảnh + nội dung...',
      fullExperienceSuccess: 'Đã thêm ảnh mockup và điền nội dung sản phẩm. Hãy kiểm tra trước khi lưu.',
      cancel: 'Hủy',
      opening: 'Đang mở...',
      badge: 'PRO'
    },
    en: {
      generator: 'Custom Mockup',
      quickGenerator: 'Auto Mockup',
      quickStarting: 'Preparing...',
      contentGenerator: 'Write product content with AI',
      contentGenerating: 'Writing product content...',
      contentSuccess: 'Product content filled. Review it before saving.',
      fullExperienceGenerator: 'AI image + content',
      fullExperienceGenerating: 'Generating image + content...',
      fullExperienceSuccess: 'Mockup images added and product content filled. Review before saving.',
      cancel: 'Cancel',
      opening: 'Opening...',
      badge: 'PRO'
    }
  };

  const CONTENT_STEPS = {
    vi: [
      'Phân tích thông tin và thuộc tính sản phẩm...',
      'Nghiên cứu từ khóa thị trường & tối ưu SEO...',
      'Lên ý tưởng & soạn thảo nội dung mô tả...',
      'Tối ưu hóa thẻ Meta Title & Meta Description...',
      'Kiểm tra chất lượng và hoàn thiện định dạng...'
    ],
    en: [
      'Analyzing product attributes...',
      'Researching keywords & SEO optimization...',
      'Drafting product description...',
      'Optimizing Meta Title & Meta Description...',
      'Finalizing & formatting content...'
    ]
  };

  const FULL_EXPERIENCE_STEPS = {
    vi: [
      'Kiểm tra vùng Mockup và các trường nội dung...',
      'Phân tích ảnh sản phẩm và chọn concept bán chạy...',
      'Tạo ảnh mockup bằng Gemini...',
      'Kiểm tra chất lượng ảnh mockup...',
      'Viết tiêu đề, mô tả và SEO từ ảnh mới...',
      'Thêm ảnh vào Mockup và điền nội dung...',
      'Hoàn thiện để người dùng kiểm tra trước khi lưu...'
    ],
    en: [
      'Checking Mockup and content fields...',
      'Analyzing product images and choosing a sellable concept...',
      'Generating Gemini mockup images...',
      'Auditing mockup quality...',
      'Writing title, description, and SEO from the new images...',
      'Adding images to Mockup and filling content...',
      'Finalizing for review before save...'
    ]
  };

  let currentLang = 'vi';

  // Always clean up existing buttons/banners from previous injections (e.g. extension reload)
  // to ensure event listeners are bound to the active context and prevent "Extension context invalidated"
  document.querySelector('.bp-ai-mockup-wrapper')?.remove();
  document.getElementById('bp-ai-product-content-banner')?.remove();

  /**
   * Check if the extension context is invalidated
   */
  function isContextInvalidated() {
    try {
      return typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id;
    } catch {
      return true;
    }
  }

  /**
   * Transform the UI to indicate a reload is required
   */
  function showReloadRequiredUI() {
    // Disable all action buttons
    const buttons = [
      document.getElementById(BUTTON_ID),
      document.getElementById(QUICK_BUTTON_ID),
      document.getElementById(CONTENT_BUTTON_ID),
      document.getElementById(FULL_EXPERIENCE_BUTTON_ID)
    ];
    buttons.forEach(btn => {
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    });

    // Display the reload warning banner
    let banner = document.getElementById('bp-ai-product-content-banner');
    if (!banner) {
      injectProductContentButton();
      banner = document.getElementById('bp-ai-product-content-banner');
    }

    if (banner) {
      banner.className = 'card bp-ai-content-banner bp-ai-content-banner--error';
      banner.style.borderColor = '#fecaca';
      banner.style.background = '#fef2f2';
      
      const t = currentLang === 'vi' ? {
        title: 'Tiện ích cần được tải lại',
        desc: 'Tiện ích mở rộng đã được cập nhật hoặc tải lại. Vui lòng tải lại trang này để tiếp tục sử dụng các tính năng AI.',
        btn: 'Tải lại trang (F5)'
      } : {
        title: 'Extension Reload Required',
        desc: 'The extension has been updated or reloaded. Please reload this page to continue using AI features.',
        btn: 'Reload Page (F5)'
      };

      banner.innerHTML = `
        <div class="bp-ai-content-banner__body" style="align-items: center; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div class="bp-ai-content-banner__info" style="display: flex; align-items: center; gap: 12px; flex: 1 1 300px;">
            <span class="bp-ai-content-banner__icon" style="font-size: 20px;">⚠️</span>
            <div class="bp-ai-content-banner__text-group" style="display: flex; flex-direction: column; gap: 2px;">
              <span class="bp-ai-content-banner__title" style="color: #b91c1c; font-size: 14px; font-weight: 700;">${t.title}</span>
              <span class="bp-ai-content-banner__desc" style="color: #7f1d1d; font-size: 12px; font-weight: 500; line-height: 1.4;">${t.desc}</span>
            </div>
          </div>
          <div class="bp-ai-content-banner__actions" style="display: flex; align-items: center; justify-content: flex-end; flex: 1 1 200px;">
            <button type="button" id="bp-ai-reload-page-btn" class="bp-ai-content-banner__button" style="border: 1px solid #dc2626; border-radius: 8px; padding: 9px 16px; color: #ffffff; background: #dc2626; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); font-weight: 700; cursor: pointer; transition: all 0.2s;">
              <span>${t.btn}</span>
            </button>
          </div>
        </div>
      `;

      const reloadBtn = banner.querySelector('#bp-ai-reload-page-btn');
      reloadBtn?.addEventListener('click', () => {
        window.location.reload();
      });
    }

    // Update the quick status card if visible
    const quickStatus = document.getElementById(QUICK_STATUS_ID);
    if (quickStatus) {
      const t = currentLang === 'vi' 
        ? 'Tiện ích mở rộng đã được tải lại. Vui lòng tải lại trang.' 
        : 'Extension reloaded. Please reload the page.';
      quickStatus.className = 'bp-ai-quick-status bp-ai-quick-status--failed';
      quickStatus.style.borderColor = '#fecaca';
      quickStatus.style.background = '#fef2f2';
      quickStatus.innerHTML = `
        <div class="bp-ai-quick-status__header" style="color: #7f1d1d; display: flex; align-items: center; justify-content: space-between;">
          <strong>⚠️ ${t}</strong>
        </div>
        <button type="button" class="bp-ai-quick-cancel" style="border: 1px solid #dc2626; color: #ffffff; background: #dc2626; margin-top: 10px; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer;">
          ${currentLang === 'vi' ? 'Tải lại trang' : 'Reload Page'}
        </button>
      `;
      const reloadBtn = quickStatus.querySelector('.bp-ai-quick-cancel');
      reloadBtn?.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  /**
   * Safe wrapper for chrome.runtime.sendMessage.
   * Translates "Extension context invalidated" errors to user-friendly reload instructions.
   */
  async function safeSendMessage(message) {
    try {
      if (isContextInvalidated()) {
        showReloadRequiredUI();
        throw new Error('Extension context invalidated.');
      }
      return await chrome.runtime.sendMessage(message);
    } catch (err) {
      if (err.message?.includes('context invalidated') || err.message?.includes('invalidated') || err.message?.includes('Extension context invalidated')) {
        showReloadRequiredUI();
        throw new Error(currentLang === 'vi' 
          ? 'Tiện ích mở rộng đã được cập nhật hoặc tải lại. Vui lòng tải lại trang này (F5) để tiếp tục.'
          : 'Extension has been updated or reloaded. Please reload this page (F5) to continue.');
      }
      throw err;
    }
  }

  /**
   * Find the "Add mockup" button/link in the DOM
   */
  function findAddMockupButton() {
    // Look for the "Add mockup" text in buttons or links
    const allElements = document.querySelectorAll('button, a, div[role="button"], span');
    for (const el of allElements) {
      const text = el.textContent?.trim().toLowerCase();
      if (text === 'add mockup' || text === 'add mockups') {
        return el;
      }
    }

    // Fallback: look for the Mockup section container
    const headings = document.querySelectorAll('h2, h3, h4, label, span, div');
    for (const heading of headings) {
      if (heading.textContent?.trim() === 'Mockup') {
        // Find the closest container that has the "Add mockup" action
        const parent = heading.closest('section') || heading.closest('[class*="mockup"]') || heading.parentElement?.parentElement;
        if (parent) {
          const addBtn = parent.querySelector('button, a, [role="button"]');
          if (addBtn) return addBtn;
          // If no button found, return the parent itself for appending
          return parent;
        }
      }
    }

    return null;
  }

  /**
   * Create the AI Mockup button
   */
  function createAIButton() {
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'bp-ai-mockup-button';
    
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    button.innerHTML = `
      <span class="bp-ai-mockup-icon">✨</span>
      <span class="bp-ai-mockup-text">${t.generator}</span>
      <span class="bp-ai-mockup-badge">${t.badge}</span>
    `;

    button.addEventListener('click', handleAIButtonClick);
    return button;
  }

  function createQuickAIButton() {
    const button = document.createElement('button');
    button.id = QUICK_BUTTON_ID;
    button.type = 'button';
    button.className = 'bp-ai-mockup-button bp-ai-mockup-button--quick';

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    button.innerHTML = `
      <span class="bp-ai-mockup-icon">⚡</span>
      <span class="bp-ai-mockup-text">${t.quickGenerator}</span>
      <span class="bp-ai-mockup-badge">1 CLICK</span>
    `;
    button.addEventListener('click', handleQuickAIButtonClick);
    return button;
  }

  function createQuickStatusCard() {
    const card = document.createElement('div');
    card.id = QUICK_STATUS_ID;
    card.className = 'bp-ai-quick-status';
    card.hidden = true;
    return card;
  }

  function createProductContentBanner() {
    const container = document.createElement('div');
    container.id = 'bp-ai-product-content-banner';
    container.className = 'card bp-ai-content-banner';

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    container.innerHTML = `
      <div class="bp-ai-content-banner__body">
        <div class="bp-ai-content-banner__info">
          <span class="bp-ai-content-banner__icon">✨</span>
          <div class="bp-ai-content-banner__text-group">
            <span class="bp-ai-content-banner__title">${currentLang === 'vi' ? 'Trợ lý viết nội dung AI' : 'AI Content Assistant'}</span>
            <span class="bp-ai-content-banner__desc">${currentLang === 'vi' ? 'Tự động viết tiêu đề, mô tả và tối ưu SEO sản phẩm.' : 'Auto-write title, description, and optimize product SEO.'}</span>
          </div>
        </div>
        <div class="bp-ai-content-banner__actions">
          <button type="button" id="${CONTENT_BUTTON_ID}" class="bp-ai-content-banner__button">
            <span class="bp-ai-product-content__text">${t.contentGenerator}</span>
            <span class="bp-ai-content-banner__badge">AI SEO</span>
          </button>
          <button type="button" id="${FULL_EXPERIENCE_BUTTON_ID}" class="bp-ai-content-banner__button bp-ai-content-banner__button--best">
            <span class="bp-ai-full-experience__text">${t.fullExperienceGenerator}</span>
            <span class="bp-ai-content-banner__badge">BEST</span>
          </button>
        </div>
      </div>
      <div id="${CONTENT_STATUS_ID}" class="bp-ai-content-banner__status" hidden></div>
    `;

    const button = container.querySelector(`#${CONTENT_BUTTON_ID}`);
    button.addEventListener('click', handleProductContentClick);
    const fullExperienceButton = container.querySelector(`#${FULL_EXPERIENCE_BUTTON_ID}`);
    fullExperienceButton.addEventListener('click', handleFullExperienceClick);
    return container;
  }

  function getContentActionButtons() {
    return [
      document.getElementById(CONTENT_BUTTON_ID),
      document.getElementById(FULL_EXPERIENCE_BUTTON_ID)
    ].filter(Boolean);
  }

  function setContentActionsDisabled(disabled) {
    getContentActionButtons().forEach(button => {
      button.disabled = disabled;
      button.classList.toggle('bp-ai-content-banner__button--loading', disabled);
    });
  }

  async function handleProductContentClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    setContentActionsDisabled(true);
    button.querySelector('.bp-ai-product-content__text').textContent = t.contentGenerating;

    let activeStepIndex = 0;
    setProductContentStatus('loading', '', activeStepIndex);

    // Chu kỳ chuyển đổi bước xử lý sau mỗi 1.2 giây
    const intervalId = setInterval(() => {
      if (activeStepIndex < 4) {
        activeStepIndex += 1;
        setProductContentStatus('loading', '', activeStepIndex);
      }
    }, 1200);

    try {
      const response = await safeSendMessage({
        type: 'GENERATE_PRODUCT_CONTENT',
        productData: extractProductData()
      });
      if (!response?.success) {
        throw new Error(response?.error || 'Không thể tạo nội dung sản phẩm.');
      }

      // Khi nhận phản hồi thành công, dọn dẹp interval và kết thúc nhanh các bước (fast-forward)
      clearInterval(intervalId);
      setProductContentStatus('loading', '', 5); // Đánh dấu hoàn thành tất cả các bước

      // Trì hoãn một chút (300ms) để người dùng thấy tất cả tích xanh mượt mà trước khi điền dữ liệu
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await fillProductListing(response.listing);
      if (result.missing.length > 0) {
        throw new Error(`Không tìm thấy trường: ${result.missing.join(', ')}`);
      }
      setProductContentStatus('success', t.contentSuccess);
    } catch (err) {
      clearInterval(intervalId);
      console.error('[BP AI Mockup] Failed to generate product content:', err);
      setProductContentStatus('error', err.message);
    } finally {
      setContentActionsDisabled(false);
      button.querySelector('.bp-ai-product-content__text').textContent = t.contentGenerator;
    }
  }

  async function handleFullExperienceClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    setContentActionsDisabled(true);
    button.querySelector('.bp-ai-full-experience__text').textContent = t.fullExperienceGenerating;

    let activeStepIndex = 0;
    setProductContentStatus('loading', '', activeStepIndex, 'full');
    const intervalId = setInterval(() => {
      if (activeStepIndex < 5) {
        activeStepIndex += 1;
        setProductContentStatus('loading', '', activeStepIndex, 'full');
      }
    }, 1800);

    try {
      const preflight = validateFullExperienceTargets();
      if (preflight.missing.length > 0) {
        throw new Error(`Không tìm thấy vùng cần cập nhật: ${preflight.missing.join(', ')}`);
      }

      const response = await safeSendMessage({
        type: 'GENERATE_FULL_PRODUCT_EXPERIENCE',
        productData: extractProductData()
      });
      if (!response?.success) {
        throw new Error(response?.error || 'Không thể tạo ảnh và nội dung sản phẩm.');
      }

      clearInterval(intervalId);
      setProductContentStatus('loading', '', 5, 'full');
      const addResult = await addMockupImagesToPage(response.images || []);
      if (!addResult.success) {
        throw new Error(addResult.error || 'Không thể thêm ảnh vào Mockup.');
      }

      const fillResult = await fillProductListing(response.listing);
      if (fillResult.missing.length > 0) {
        throw new Error(`Không tìm thấy trường: ${fillResult.missing.join(', ')}`);
      }

      setProductContentStatus('loading', '', 7, 'full');
      await new Promise(resolve => setTimeout(resolve, 300));
      const count = addResult.count || response.images?.length || 0;
      const successMessage = currentLang === 'vi'
        ? `${t.fullExperienceSuccess} (${count} ảnh)`
        : `${t.fullExperienceSuccess} (${count} image${count === 1 ? '' : 's'})`;
      setProductContentStatus('success', successMessage);
    } catch (err) {
      clearInterval(intervalId);
      console.error('[BP AI Mockup] Failed to generate full product experience:', err);
      setProductContentStatus('error', err.message);
    } finally {
      setContentActionsDisabled(false);
      button.querySelector('.bp-ai-full-experience__text').textContent = t.fullExperienceGenerator;
    }
  }

  function setProductContentStatus(type, message, activeStepIndex = -1, mode = 'content') {
    const status = document.getElementById(CONTENT_STATUS_ID);
    if (!status) return;
    status.hidden = false;
    status.className = `bp-ai-content-banner__status bp-ai-content-banner__status--${type}`;

    if (type === 'loading' && activeStepIndex >= 0) {
      const stepCatalog = mode === 'full' ? FULL_EXPERIENCE_STEPS : CONTENT_STEPS;
      const steps = stepCatalog[currentLang] || stepCatalog.vi;
      status.innerHTML = `
        <div class="bp-ai-content-steps">
          ${steps.map((step, index) => {
            const isDone = index < activeStepIndex;
            const isActive = index === activeStepIndex;
            const icon = isDone ? '✓' : (isActive ? '●' : '○');
            const stepClass = isDone ? 'bp-ai-content-step--done' : (isActive ? 'bp-ai-content-step--active' : '');
            return `
              <div class="bp-ai-content-step ${stepClass}">
                <span class="bp-ai-content-step-icon">${icon}</span>
                <span>${step}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      status.textContent = message;
    }
  }

  async function handleQuickAIButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    setQuickButtonLoading(true, t.quickStarting);
    renderQuickJobStatus({
      status: 'running',
      phase: 'preparing',
      progress: 2,
      message: t.quickStarting,
      addedCount: 0,
      generatedCount: 0
    });

    try {
      const response = await safeSendMessage({
        type: 'START_QUICK_GENERATION',
        productData: extractProductData()
      });
      if (!response?.success) {
        throw new Error(response?.error || 'Không thể bắt đầu tạo Mockup.');
      }
      renderQuickJobStatus(response.job);
    } catch (err) {
      renderQuickJobStatus({
        status: 'failed',
        phase: 'failed',
        progress: 0,
        message: err.message,
        error: err.message
      });
      setQuickButtonLoading(false);
    }
  }

  function setQuickButtonLoading(isLoading, label) {
    const button = document.getElementById(QUICK_BUTTON_ID);
    if (!button) return;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    button.classList.toggle('bp-ai-mockup-button--loading', isLoading);
    button.disabled = isLoading;
    button.querySelector('.bp-ai-mockup-text').textContent = label || t.quickGenerator;
  }

  function getQuickStatusTitle(job) {
    if (job.status === 'completed') return currentLang === 'vi' ? 'Tạo Mockup hoàn thành' : 'Mockups completed';
    if (job.status === 'failed') return currentLang === 'vi' ? 'Không thể tạo Mockup' : 'Mockup generation failed';
    if (job.status === 'cancelled') return currentLang === 'vi' ? 'Đã hủy tạo Mockup' : 'Mockup generation cancelled';
    if (job.status === 'cancelling') return currentLang === 'vi' ? 'Đang hủy...' : 'Cancelling...';
    return currentLang === 'vi' ? 'Đang tạo Mockup bằng AI' : 'Generating AI Mockups';
  }

  function getQuickStatusSteps(job) {
    const phaseOrder = ['preparing', 'suggesting', 'analyzing', 'generating', 'auditing', 'complete'];
    const currentIndex = phaseOrder.indexOf(job.phase);
    const labels = currentLang === 'vi'
      ? ['Chuẩn bị', 'Chọn chủ đề', 'Phân tích sản phẩm', 'Tạo ảnh', 'Kiểm tra chất lượng', 'Thêm vào Mockup']
      : ['Prepare', 'Choose concept', 'Analyze product', 'Generate images', 'Quality check', 'Add to Mockup'];

    return labels.map((label, index) => {
      const done = job.status === 'completed' || index < currentIndex;
      const active = job.status === 'running' && index === currentIndex;
      return `
        <div class="bp-ai-quick-step ${done ? 'bp-ai-quick-step--done' : ''} ${active ? 'bp-ai-quick-step--active' : ''}">
          <span>${done ? '✓' : active ? '●' : '○'}</span>
          <span>${label}</span>
        </div>
      `;
    }).join('');
  }

  function renderQuickJobStatus(job) {
    if (!job) return;
    const card = document.getElementById(QUICK_STATUS_ID);
    if (!card) return;

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    const isRunning = job.status === 'running' || job.status === 'cancelling';
    const progress = Math.max(0, Math.min(100, Number(job.progress) || 0));
    const summary = currentLang === 'vi'
      ? `Đã tạo ${job.generatedCount || 0} ảnh · Đã thêm ${job.addedCount || 0} ảnh`
      : `Generated ${job.generatedCount || 0} · Added ${job.addedCount || 0}`;

    card.hidden = false;
    card.className = `bp-ai-quick-status bp-ai-quick-status--${job.status || 'running'}`;
    card.innerHTML = `
      <div class="bp-ai-quick-status__header">
        <strong>${getQuickStatusTitle(job)}</strong>
        <span>${progress}%</span>
      </div>
      <div class="bp-ai-quick-progress">
        <div class="bp-ai-quick-progress__fill" style="width:${progress}%"></div>
      </div>
      <div class="bp-ai-quick-status__message">${escapeStatusText(job.message || '')}</div>
      <div class="bp-ai-quick-status__summary">${summary}</div>
      <div class="bp-ai-quick-steps">${getQuickStatusSteps(job)}</div>
      ${isRunning && job.jobId ? `<button type="button" class="bp-ai-quick-cancel">${t.cancel}</button>` : ''}
    `;

    const cancelButton = card.querySelector('.bp-ai-quick-cancel');
    cancelButton?.addEventListener('click', async () => {
      cancelButton.disabled = true;
      await safeSendMessage({
        type: 'CANCEL_QUICK_GENERATION',
        jobId: job.jobId
      });
    });

    setQuickButtonLoading(isRunning, isRunning ? t.quickStarting : null);
  }

  function escapeStatusText(value) {
    const element = document.createElement('div');
    element.textContent = String(value || '');
    return element.innerHTML;
  }

  /**
   * Handle AI button click — open side panel
   */
  async function handleAIButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
    button.classList.add('bp-ai-mockup-button--loading');
    button.querySelector('.bp-ai-mockup-text').textContent = t.opening;

    try {
      const response = await safeSendMessage({ type: 'OPEN_SIDE_PANEL' });
      if (response?.success) {
        // Small delay then send product data
        setTimeout(async () => {
          const productData = extractProductData();
          await safeSendMessage({
            type: 'PRODUCT_DATA_READY',
            data: productData
          });
        }, 500);
      }
    } catch (err) {
      console.error('[BP AI Mockup] Failed to open panel:', err);
    } finally {
      button.classList.remove('bp-ai-mockup-button--loading');
      button.querySelector('.bp-ai-mockup-text').textContent = t.generator;
    }
  }

  /**
   * Extract product data from the BurgerPrints product page
   */
  function extractProductData() {
    const data = {
      title: '',
      designImage: null,
      mockupImages: [],
      productType: '',
      colors: [],
      url: window.location.href
    };

    // Extract product title from BurgerPrints' title/H1 field.
    data.title = extractProductTitle();

    // Extract design image — find the Design card section
    const designSection = findCardSectionByTitle('Design');
    if (designSection) {
      const designImg = designSection.querySelector('img');
      if (designImg) {
        data.designImage = designImg.src;
      }
      // Try to get product type from design section text
      const designText = designSection.textContent;
      const typeMatch = designText.match(/(Unisex\s+)?(\w[\w\s]+)\|/);
      if (typeMatch) {
        data.productType = typeMatch[0].replace('|', '').trim();
      }
    }

    // Extract existing mockup images using precise BurgerPrints DOM selectors
    data.mockupImages = extractMockupImages();

    // Extract color options
    const optionSection = findCardSectionByTitle('Option');
    if (optionSection) {
      const colorLabels = optionSection.querySelectorAll('[class*="color"], [class*="tag"], [class*="chip"]');
      colorLabels.forEach(label => {
        const colorText = label.textContent?.trim();
        if (colorText && colorText.length < 30) {
          data.colors.push(colorText);
        }
      });
    }

    Object.assign(data, extractListingContent());

    console.log('[BP AI Mockup] Extracted product data:', {
      title: data.title,
      designImage: data.designImage ? 'found' : 'missing',
      mockupImages: data.mockupImages.length,
      productType: data.productType,
      colors: data.colors.length
    });

    return data;
  }

  function normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getControlValue(control) {
    if (!control) return '';
    if (control.matches?.('input, textarea')) {
      return normalizeWhitespace(control.value);
    }
    if (control.isContentEditable) {
      return normalizeWhitespace(control.textContent);
    }
    return '';
  }

  function isLikelyTitleLabel(text) {
    return /\b(title|tittle|h1)\b/i.test(normalizeWhitespace(text));
  }

  function findValueNearLabel(labelEl) {
    if (!labelEl) return '';

    const htmlFor = labelEl.getAttribute?.('for');
    if (htmlFor) {
      const linkedControl = document.getElementById(htmlFor);
      const linkedValue = getControlValue(linkedControl);
      if (linkedValue) return linkedValue;
    }

    const fieldContainer = labelEl.closest?.(
      '.form-group, .input-group, [class*="form"], [class*="field"], [class*="input"], [class*="control"], [class*="row"], [class*="col"], div'
    );
    const containerValue = getControlValue(fieldContainer?.querySelector?.('input, textarea, [contenteditable="true"]'));
    if (containerValue) return containerValue;

    let sibling = labelEl.nextElementSibling;
    for (let i = 0; sibling && i < 4; i += 1) {
      const siblingValue = getControlValue(sibling.matches?.('input, textarea, [contenteditable="true"]')
        ? sibling
        : sibling.querySelector?.('input, textarea, [contenteditable="true"]'));
      if (siblingValue) return siblingValue;
      sibling = sibling.nextElementSibling;
    }

    return '';
  }

  function extractProductTitle() {
    const directSelectors = [
      'input[name*="title" i]',
      'textarea[name*="title" i]',
      'input[id*="title" i]',
      'textarea[id*="title" i]',
      'input[placeholder*="title" i]',
      'textarea[placeholder*="title" i]',
      'input[aria-label*="title" i]',
      'textarea[aria-label*="title" i]',
      '[contenteditable="true"][aria-label*="title" i]'
    ];

    for (const selector of directSelectors) {
      const value = getControlValue(document.querySelector(selector));
      if (value) return value;
    }

    const titleLabels = Array.from(document.querySelectorAll('label, span, div, p'))
      .filter(el => {
        const text = normalizeWhitespace(el.textContent);
        return text.length > 0 && text.length <= 80 && isLikelyTitleLabel(text);
      });

    for (const label of titleLabels) {
      const value = findValueNearLabel(label);
      if (value) return value;
    }

    const pageHeading = Array.from(document.querySelectorAll('h1'))
      .map(heading => normalizeWhitespace(heading.textContent))
      .find(text => text && !isLikelyTitleLabel(text) && !/burgerprints|mockup/i.test(text));

    return pageHeading || '';
  }

  function isEditableControl(element) {
    return Boolean(element?.matches?.(
      'input:not([type="file"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
    ));
  }

  function normalizeFieldLabel(value) {
    return normalizeWhitespace(value)
      .replace(/\s*\d+\s*\/\s*\d+\s*$/i, '')
      .trim();
  }

  function findControlByLabel(root, labelPattern, excludedRoots = []) {
    if (!root) return null;
    const labels = Array.from(root.querySelectorAll('label, h1, h2, h3, h4, h5, h6, span, div, p'))
      .filter(element => {
        const text = normalizeFieldLabel(element.textContent);
        return text.length > 0 && text.length <= 80 && labelPattern.test(text);
      });

    for (const label of labels) {
      const htmlFor = label.getAttribute?.('for');
      const linked = htmlFor ? document.getElementById(htmlFor) : null;
      if (isEditableControl(linked) && !excludedRoots.some(excluded => excluded?.contains(linked))) {
        return linked;
      }

      let container = label.parentElement;
      for (let depth = 0; container && depth < 5; depth += 1, container = container.parentElement) {
        const controls = Array.from(container.querySelectorAll(
          'input:not([type="file"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
        )).filter(control => (
          !excludedRoots.some(excluded => excluded?.contains(control))
          && (label.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING)
        ));
        if (controls.length > 0) return controls[0];
      }
    }

    return null;
  }

  function findProductTitleControl() {
    const directSelectors = [
      'input[placeholder*="tittle" i]',
      'textarea[placeholder*="tittle" i]',
      'input[aria-label*="tittle" i]',
      'textarea[aria-label*="tittle" i]',
      'input[name*="tittle" i]',
      'textarea[name*="tittle" i]',
      'input[id*="tittle" i]',
      'textarea[id*="tittle" i]',
      'input[placeholder*="title" i]',
      'textarea[placeholder*="title" i]'
    ];

    for (const selector of directSelectors) {
      const control = document.querySelector(selector);
      if (isEditableControl(control)) return control;
    }

    return findControlByLabel(document, /^(tittle|title)\s*\(\s*h1\s*\)$/i);
  }

  function findListingControls() {
    const seoSection = findCardSectionByTitle('SEO engine');
    const shortDescriptionSection = findCardSectionByTitle('Short description');
    return {
      title: document.querySelector('[formcontrolname="title"]') || findProductTitleControl(),
      description: document.querySelector('editor[formcontrolname="desc"] textarea')
        || findControlByLabel(document, /^description$/i, [seoSection, shortDescriptionSection]),
      shortDescription: document.querySelector('editor[formcontrolname="short_desc"] textarea')
        || findControlByLabel(shortDescriptionSection || document, /^short description$/i),
      seoTitle: document.querySelector('[formcontrolname="seo_title"]')
        || findControlByLabel(seoSection, /^title$/i),
      seoDescription: document.querySelector('[formcontrolname="seo_desc"]')
        || findControlByLabel(seoSection, /^description$/i)
    };
  }

  function getListingControlContent(control) {
    if (!control) return '';
    return control.isContentEditable
      ? normalizeWhitespace(control.textContent)
      : normalizeWhitespace(control.value);
  }

  function extractListingContent() {
    const controls = findListingControls();
    return {
      description: getListingControlContent(controls.description),
      shortDescription: getListingControlContent(controls.shortDescription),
      seoTitle: getListingControlContent(controls.seoTitle),
      seoDescription: getListingControlContent(controls.seoDescription)
    };
  }

  function sanitizeListingHtml(html) {
    const documentFragment = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const allowedTags = new Set(['P', 'H2', 'H3', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'BR']);
    const droppedTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH']);

    Array.from(documentFragment.body.querySelectorAll('*')).forEach(element => {
      if (droppedTags.has(element.tagName)) {
        element.remove();
        return;
      }
      if (!allowedTags.has(element.tagName)) {
        element.replaceWith(...element.childNodes);
        return;
      }
      Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name));
    });

    return documentFragment.body.innerHTML;
  }

  function truncateListingText(value, maxLength) {
    const text = normalizeWhitespace(value);
    if (text.length <= maxLength) return text;

    const shortened = text.slice(0, maxLength - 1);
    const lastSpace = shortened.lastIndexOf(' ');
    return `${shortened.slice(0, lastSpace > maxLength * 0.7 ? lastSpace : shortened.length).trim()}…`;
  }

  function truncateListingHtml(value, maxLength) {
    const sanitized = sanitizeListingHtml(value);
    if (sanitized.length <= maxLength) return sanitized;
    return sanitizeListingHtml(sanitized.slice(0, maxLength));
  }

  function setListingControlValue(control, value, { html = false } = {}) {
    if (!control) return false;

    if (control.isContentEditable) {
      control.innerHTML = html
        ? sanitizeListingHtml(value)
        : `<p>${escapeStatusText(value)}</p>`;
    } else {
      const prototype = control.tagName === 'TEXTAREA'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (setter) setter.call(control, value);
      else control.value = value;
    }

    control.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: null
    }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    control.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  async function fillProductListing(listing = {}) {
    const preparedListing = {
      title: truncateListingText(listing.title, 255),
      description: truncateListingHtml(listing.description, 4000),
      shortDescription: `<p>${escapeStatusText(truncateListingText(listing.shortDescription, 255))}</p>`,
      seoTitle: truncateListingText(listing.seoTitle, 70),
      seoDescription: truncateListingText(listing.seoDescription, 160)
    };
    const response = await safeSendMessage({
      type: 'SET_PRODUCT_LISTING',
      listing: preparedListing
    });
    if (!response) {
      throw new Error('Không nhận được phản hồi khi cập nhật form sản phẩm.');
    }
    if (!response?.success && response?.error) {
      throw new Error(response.error);
    }
    if (!response.success && !response?.missing?.length) {
      throw new Error('Không thể cập nhật form sản phẩm.');
    }

    const labels = {
      title: 'Tittle (H1)',
      description: 'Description',
      shortDescription: 'Short description',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description'
    };
    return {
      missing: (response?.missing || []).map(field => labels[field] || field)
    };
  }

  function validateFullExperienceTargets() {
    const controls = findListingControls();
    const mockupSection = findCardSectionByTitle('Mockup');
    const mockupUploadInput = mockupSection?.querySelector('input#upload_mockup[type="file"], input[type="file"][accept*="image"]');
    const labels = {
      title: 'Tittle (H1)',
      description: 'Description',
      shortDescription: 'Short description',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description'
    };
    const missing = Object.entries(labels)
      .filter(([field]) => !controls[field])
      .map(([, label]) => label);

    if (!mockupSection) missing.push('Mockup');
    else if (!mockupUploadInput) missing.push('Mockup upload');

    return { missing };
  }

  /**
   * Extract mockup images precisely from the Mockup card section.
   * Targets: h5.title-card "Mockup" → sibling .list-mockup-wrap → .list-mockup-item img
   */
  function extractMockupImages() {
    const images = [];

    // Strategy 1: Find the Mockup heading, then traverse to the mockup grid
    const mockupHeading = findHeadingByText('Mockup');
    if (mockupHeading) {
      // The mockup list is a sibling within the same .card-body parent
      const cardBody = mockupHeading.closest('.card-body');
      if (cardBody) {
        // Target images specifically inside .list-mockup-item containers
        const mockupItemImgs = cardBody.querySelectorAll('.list-mockup-item img');
        mockupItemImgs.forEach(img => {
          if (img.src && !img.src.includes('placeholder')) {
            images.push(getHighResUrl(img.src));
          }
        });
        if (images.length > 0) return images;

        // Fallback: target images inside .list-mockup-wrap
        const wrapImgs = cardBody.querySelectorAll('.list-mockup-wrap img');
        wrapImgs.forEach(img => {
          if (img.src && !img.src.includes('placeholder')) {
            images.push(getHighResUrl(img.src));
          }
        });
        if (images.length > 0) return images;
      }
    }

    // Strategy 2: Direct class-based selector (no heading needed)
    const directMockupImgs = document.querySelectorAll('.list-mockup .list-mockup-item img');
    directMockupImgs.forEach(img => {
      if (img.src && !img.src.includes('placeholder')) {
        images.push(getHighResUrl(img.src));
      }
    });
    if (images.length > 0) return images;

    // Strategy 3: Broader fallback using avatar-background inside mockup containers
    const avatarImgs = document.querySelectorAll('.list-mockup-item .avatar-background img');
    avatarImgs.forEach(img => {
      if (img.src && !img.src.includes('placeholder')) {
        images.push(getHighResUrl(img.src));
      }
    });

    return images;
  }

  /**
   * Convert thumbnail URL to higher resolution version.
   * BurgerPrints uses CloudFront with /200x200/ prefix for thumbnails.
   */
  function getHighResUrl(url) {
    // Replace /200x200/ with /800x800/ for better quality mockup source
    return url.replace('/200x200/', '/800x800/');
  }

  /**
   * Find a heading element (h1-h6) by its exact text content
   */
  function findHeadingByText(text) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      if (heading.textContent?.trim() === text) {
        return heading;
      }
    }
    return null;
  }

  /**
   * Find a card section by its heading title (BurgerPrints Angular structure).
   * Looks for h5.title-card or general headings, then returns the parent .card-body.
   */
  function findCardSectionByTitle(title) {
    // Strategy 1: BurgerPrints specific — h5.title-card
    const titleCards = document.querySelectorAll('h5.title-card');
    for (const heading of titleCards) {
      if (heading.textContent?.trim() === title) {
        return heading.closest('.card-body') || heading.closest('section') || heading.closest('[class*="card"]') || heading.parentElement?.parentElement;
      }
    }

    // Strategy 2: Generic headings fallback
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      if (heading.textContent?.trim() === title) {
        return heading.closest('.card-body') || heading.closest('section') || heading.closest('[class*="card"]') || heading.parentElement?.parentElement;
      }
    }

    // Strategy 3: Broader selector for labels and div titles
    const labels = document.querySelectorAll('label, [class*="title"]');
    for (const label of labels) {
      if (label.textContent?.trim() === title) {
        return label.closest('.card-body') || label.closest('section') || label.parentElement?.parentElement;
      }
    }

    return null;
  }

  /**
   * Inject the AI button into the page
   */
  function injectButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const addMockupBtn = findAddMockupButton();
    if (!addMockupBtn) {
      // Retry if DOM is not ready yet
      return false;
    }

    const aiButton = createAIButton();
    const quickButton = createQuickAIButton();
    const quickStatus = createQuickStatusCard();

    // Insert after the "Add mockup" button
    const parent = addMockupBtn.parentElement;
    if (parent) {
      // Create a wrapper for the AI button
      const wrapper = document.createElement('div');
      wrapper.className = 'bp-ai-mockup-wrapper';
      wrapper.appendChild(quickButton);
      wrapper.appendChild(aiButton);
      wrapper.appendChild(quickStatus);

      // Insert after the add mockup button's parent container
      if (addMockupBtn.nextSibling) {
        parent.insertBefore(wrapper, addMockupBtn.nextSibling);
      } else {
        parent.appendChild(wrapper);
      }
    }

    return true;
  }

  function injectProductContentButton() {
    if (document.getElementById('bp-ai-product-content-banner')) return true;

    const titleControl = findListingControls().title;
    if (!titleControl) return false;

    const banner = createProductContentBanner();

    // Đưa banner lên trên hẳn card/component Title (H1) để tách rời hoàn toàn
    const card = titleControl.closest('.card, section, [class*="card"]');
    const formGroup = titleControl.closest('.form-group, .form-item, mat-form-field, [class*="form-group"], [class*="form-field"], [class*="form-item"]');

    const insertionTarget = card || formGroup || titleControl.parentElement || titleControl;
    insertionTarget.insertAdjacentElement('beforebegin', banner);
    return true;
  }

  /**
   * Listen for messages from side panel (via service worker)
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ pong: true });
      return true;
    }

    if (message.type === 'EXTRACT_PRODUCT_DATA') {
      const data = extractProductData();
      sendResponse(data);
      return true;
    }

    if (message.type === 'ADD_MOCKUP_IMAGES') {
      (async () => {
        const images = message.images || [];
        const result = await addMockupImagesToPage(images);
        sendResponse(result);
      })();
      return true;
    }

    if (message.type === 'QUICK_JOB_STATUS') {
      renderQuickJobStatus(message.job);
      sendResponse({ received: true });
      return true;
    }
  });

  /**
   * Submit AI-generated mockup images through BurgerPrints' own file input.
   * This lets the Angular Mockup component update its real state instead of
   * adding an unrelated DOM preview below the Add mockup control.
   */
  async function addMockupImagesToPage(images) {
    if (!Array.isArray(images) || images.length === 0) {
      return { success: false, count: 0, error: 'No images provided' };
    }

    const mockupSection = findCardSectionByTitle('Mockup');
    if (!mockupSection) {
      console.warn('[BP AI Mockup] Mockup section not found');
      return { success: false, count: 0, error: 'Mockup section not found' };
    }

    const uploadInput = mockupSection.querySelector('input#upload_mockup[type="file"], input[type="file"][accept*="image"]');
    if (!uploadInput) {
      return { success: false, count: 0, error: 'Mockup upload input not found' };
    }

    try {
      const beforeCount = mockupSection.querySelectorAll('.list-mockup .list-mockup-item').length;
      const files = await Promise.all(images.map((imageData, index) => dataUrlToFile(
        imageData,
        `bp-ai-mockup-${Date.now()}-${index + 1}`
      )));

      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));

      uploadInput.files = dataTransfer.files;
      uploadInput.dispatchEvent(new Event('input', { bubbles: true }));
      uploadInput.dispatchEvent(new Event('change', { bubbles: true }));

      const afterCount = await waitForMockupItemCount(mockupSection, beforeCount + files.length, 6000);

      return {
        success: true,
        count: files.length,
        verified: afterCount >= beforeCount + files.length,
        beforeCount,
        afterCount,
        mode: 'file-input'
      };
    } catch (err) {
      console.error('[BP AI Mockup] Failed to submit mockup files:', err);
      return { success: false, count: 0, error: err.message };
    }
  }

  async function dataUrlToFile(dataUrl, baseName) {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      throw new Error('Invalid generated image data');
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const type = normalizeImageMimeType(blob.type || dataUrl.slice(5, dataUrl.indexOf(';')));
    const extension = type === 'image/jpeg' ? 'jpg' : 'png';
    return new File([blob], `${baseName}.${extension}`, { type });
  }

  function normalizeImageMimeType(type) {
    if (type === 'image/jpeg' || type === 'image/jpg') return 'image/jpeg';
    if (type === 'image/png') return 'image/png';
    return 'image/png';
  }

  function waitForMockupItemCount(mockupSection, targetCount, timeoutMs) {
    const start = Date.now();

    return new Promise(resolve => {
      const check = () => {
        const count = mockupSection.querySelectorAll('.list-mockup .list-mockup-item').length;
        if (count >= targetCount || Date.now() - start >= timeoutMs) {
          resolve(count);
          return;
        }
        setTimeout(check, 250);
      };

      check();
    });
  }

  /**
   * Use MutationObserver for SPA navigation
   */
  function setupObserver() {
    if (document.body.hasAttribute(OBSERVER_ATTR)) return;
    document.body.setAttribute(OBSERVER_ATTR, 'true');

    const observer = new MutationObserver(() => {
      if (!document.getElementById(BUTTON_ID)) {
        injectButton();
      }
      if (!document.getElementById(CONTENT_BUTTON_ID)) {
        injectProductContentButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Listen for language setting changes dynamically
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.settings?.newValue) {
      const newLang = changes.settings.newValue.language || 'vi';
      if (newLang !== currentLang) {
        currentLang = newLang;
        const button = document.getElementById(BUTTON_ID);
        if (button) {
          const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
          button.querySelector('.bp-ai-mockup-text').textContent = t.generator;
          button.querySelector('.bp-ai-mockup-badge').textContent = t.badge;
        }
        const quickButton = document.getElementById(QUICK_BUTTON_ID);
        if (quickButton && !quickButton.disabled) {
          const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
          quickButton.querySelector('.bp-ai-mockup-text').textContent = t.quickGenerator;
        }
        const contentButton = document.getElementById(CONTENT_BUTTON_ID);
        if (contentButton && !contentButton.disabled) {
          const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;
          contentButton.querySelector('.bp-ai-product-content__text').textContent = t.contentGenerator;
          const fullExperienceText = document.getElementById(FULL_EXPERIENCE_BUTTON_ID)
            ?.querySelector('.bp-ai-full-experience__text');
          if (fullExperienceText) {
            fullExperienceText.textContent = t.fullExperienceGenerator;
          }

          const banner = document.getElementById('bp-ai-product-content-banner');
          if (banner) {
            banner.querySelector('.bp-ai-content-banner__title').textContent =
              currentLang === 'vi' ? 'Trợ lý viết nội dung AI' : 'AI Content Assistant';
            banner.querySelector('.bp-ai-content-banner__desc').textContent =
              currentLang === 'vi' ? 'Tự động viết tiêu đề, mô tả và tối ưu SEO sản phẩm.' : 'Auto-write title, description, and optimize product SEO.';
          }
        }
      }
    }
  });

  // Initial injection with retry
  async function init() {
    try {
      const { settings } = await chrome.storage.local.get('settings');
      currentLang = settings?.language || 'vi';
    } catch {
      currentLang = 'vi';
    }

    const mockupSuccess = injectButton();
    const contentSuccess = injectProductContentButton();
    if (!mockupSuccess || !contentSuccess) {
      // Retry a few times with increasing delays
      let retries = 0;
      const retryInterval = setInterval(() => {
        retries++;
        const hasMockupButton = injectButton();
        const hasContentButton = injectProductContentButton();
        if ((hasMockupButton && hasContentButton) || retries > 10) {
          clearInterval(retryInterval);
        }
      }, 1000);
    }
    setupObserver();

    try {
      const response = await safeSendMessage({ type: 'GET_QUICK_JOB_STATUS' });
      if (response?.job) {
        renderQuickJobStatus(response.job);
      }
    } catch (err) {
      console.warn('[BP AI Mockup] Could not restore quick job status:', err);
    }

    // Set up periodic check to catch extension reload/update actively
    const contextCheckInterval = setInterval(() => {
      if (isContextInvalidated()) {
        clearInterval(contextCheckInterval);
        showReloadRequiredUI();
      }
    }, 2500);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  console.log('[BP AI Mockup] Content script loaded');
})();
