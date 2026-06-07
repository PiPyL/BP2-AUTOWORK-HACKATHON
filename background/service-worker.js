/**
 * BurgerPrints AI Mockup Generator - Service Worker
 * Message hub between Content Script ↔ Side Panel
 */

// Open side panel when extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

const OFFSCREEN_DOCUMENT_PATH = 'offscreen/runner.html';
const QUICK_JOB_STORAGE_KEY = 'quickJobStatus';
const SIDE_PANEL_AI_TASK_KEY = 'sidePanelAiTask';
const DEFAULT_QUICK_SETTINGS = {
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
  additionalPrompt: ''
};

let quickJob = null;
let quickJobStarting = false;
let productContentRunning = false;
let fullExperienceRunning = false;
let profileAnalysisRunning = false;
const pendingQuickInserts = new Map();
let creatingOffscreenDocument = null;
let quickProgressQueue = Promise.resolve();

function getActiveCustomerProfile(stored = {}) {
  const profiles = Array.isArray(stored.customerProfiles) ? stored.customerProfiles : [];
  return profiles.find(profile => profile.id === stored.activeCustomerProfileId) || null;
}

function getAiContentLanguage(settings = {}) {
  return settings.aiContentLanguage || settings.language || 'vi';
}

function hasActiveSidePanelAiTask(stored = {}) {
  const task = stored[SIDE_PANEL_AI_TASK_KEY];
  return task?.status === 'running' && Date.now() - (task.startedAt || 0) < 15 * 60 * 1000;
}

async function hasOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  return contexts.length > 0;
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) return;

  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['BLOBS'],
      justification: 'Run the hidden AI image generation workflow and process generated image data.'
    }).finally(() => {
      creatingOffscreenDocument = null;
    });
  }

  await creatingOffscreenDocument;
}

async function closeOffscreenDocument() {
  try {
    if (await hasOffscreenDocument()) {
      await chrome.offscreen.closeDocument();
    }
  } catch (err) {
    console.warn('[BP AI Mockup] Could not close offscreen runner:', err);
  }
}

function getPublicQuickJob(job = quickJob) {
  if (!job) return null;
  const {
    jobId,
    tabId,
    status,
    phase,
    progress,
    message,
    presetName,
    current,
    total,
    addedCount,
    generatedCount,
    error,
    startedAt,
    finishedAt
  } = job;
  return {
    jobId,
    tabId,
    status,
    phase,
    progress,
    message,
    presetName,
    current,
    total,
    addedCount,
    generatedCount,
    error,
    startedAt,
    finishedAt
  };
}

async function persistQuickJob() {
  if (!quickJob) return;
  await chrome.storage.local.set({
    [QUICK_JOB_STORAGE_KEY]: getPublicQuickJob()
  });
}

async function restoreQuickJob(jobId) {
  if (quickJob?.jobId === jobId) return quickJob;
  const stored = await chrome.storage.local.get(QUICK_JOB_STORAGE_KEY);
  const savedJob = stored[QUICK_JOB_STORAGE_KEY];
  if (savedJob?.jobId === jobId) {
    quickJob = savedJob;
    quickJob.results = [];
    return quickJob;
  }
  return null;
}

async function sendQuickStatusToTab() {
  if (!quickJob?.tabId) return;
  try {
    await sendMessageToTab(quickJob.tabId, {
      type: 'QUICK_JOB_STATUS',
      job: getPublicQuickJob()
    });
  } catch (err) {
    console.warn('[BP AI Mockup] Could not update quick job status on page:', err);
  }
}

async function updateQuickJob(patch) {
  if (!quickJob) return;
  Object.assign(quickJob, patch);
  await persistQuickJob();
  await sendQuickStatusToTab();
}

async function insertQuickResult(result) {
  if (!quickJob || result?.audit?.pass === false || !result?.imageData) return;

  const response = await sendMessageToTab(quickJob.tabId, {
    type: 'ADD_MOCKUP_IMAGES',
    images: [result.imageData]
  });
  if (response?.success === false) {
    throw new Error(response.error || 'Không thể thêm ảnh vào Mockup.');
  }

  quickJob.addedCount = (quickJob.addedCount || 0) + 1;
  await updateQuickJob({
    message: `Đã thêm ${quickJob.addedCount} ảnh vào Mockup.`
  });
}

async function saveQuickHistory(results, settings) {
  if (!results?.length) return;
  try {
    const sessionId = `session_${Date.now()}`;
    const imageKey = `images_${sessionId}`;
    const { history = [] } = await chrome.storage.local.get('history');
    const entry = {
      id: sessionId,
      timestamp: Date.now(),
      productTitle: quickJob?.productData?.title || 'Unknown Product',
      count: results.length,
      thumbnails: results.slice(0, 3).map(img => `${img.imageData?.substring(0, 200) || ''}...`),
      settings
    };

    const nextHistory = [entry, ...history].slice(0, 20);
    await chrome.storage.local.set({
      [imageKey]: { images: results },
      history: nextHistory
    });
  } catch (err) {
    console.warn('[BP AI Mockup] Could not save quick-generation history:', err);
  }
}

async function notifyQuickJob(title, message) {
  try {
    await chrome.notifications.create(`quick-job-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title,
      message
    });
  } catch (err) {
    console.warn('[BP AI Mockup] Could not show completion notification:', err);
  }
}

async function handleQuickRunnerProgress(message) {
  const job = await restoreQuickJob(message.jobId);
  if (!job) return;

  if (message.phase === 'finished') {
    const pending = pendingQuickInserts.get(message.jobId) || [];
    await Promise.allSettled(pending);
    quickJob.results = message.results || quickJob.results || [];
    await saveQuickHistory(quickJob.results, message.settings || {});
    await updateQuickJob({
      status: 'completed',
      phase: 'complete',
      progress: 100,
      generatedCount: quickJob.results.length,
      message: `Hoàn thành: đã thêm ${quickJob.addedCount || 0} ảnh vào Mockup.`,
      finishedAt: Date.now()
    });
    await notifyQuickJob('Tạo Mockup bằng AI hoàn thành', quickJob.message);
    pendingQuickInserts.delete(message.jobId);
    await closeOffscreenDocument();
    return;
  }

  if (message.phase === 'failed' || message.phase === 'cancelled') {
    await updateQuickJob({
      status: message.phase,
      phase: message.phase,
      progress: 0,
      message: message.message,
      error: message.error || '',
      finishedAt: Date.now()
    });
    if (message.phase === 'failed') {
      await notifyQuickJob('Tạo Mockup bằng AI thất bại', message.message);
    }
    pendingQuickInserts.delete(message.jobId);
    await closeOffscreenDocument();
    return;
  }

  if (message.result) {
    quickJob.results = quickJob.results || [];
    quickJob.results.push(message.result);
    quickJob.generatedCount = quickJob.results.length;
    if (message.result.audit?.pass !== false) {
      const pending = pendingQuickInserts.get(message.jobId) || [];
      const insertPromise = insertQuickResult(message.result).catch(async err => {
        await updateQuickJob({
          message: `Ảnh đã tạo nhưng chưa thể thêm vào Mockup: ${err.message}`
        });
      });
      pending.push(insertPromise);
      pendingQuickInserts.set(message.jobId, pending);
    }
  }

  await updateQuickJob({
    status: 'running',
    phase: message.phase,
    progress: message.progress,
    message: message.message,
    presetName: message.presetName || quickJob.presetName || '',
    current: message.current || quickJob.current || 0,
    total: message.total || quickJob.total || 0,
    generatedCount: quickJob.generatedCount || 0
  });
}

/**
 * Ensure the content script is injected into a tab.
 * If the content script wasn't auto-injected (e.g., tab was open before
 * extension install/reload), this injects it programmatically.
 */
async function ensureContentScript(tabId) {
  try {
    // Try pinging the content script first
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true; // Content script is already running
  } catch {
    // Content script not running — inject it programmatically
    console.log('[BP AI Mockup] Content script not found, injecting...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/content.js']
      });
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content/content.css']
      });
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('[BP AI Mockup] Content script injected successfully');
      return true;
    } catch (injectErr) {
      console.error('[BP AI Mockup] Failed to inject content script:', injectErr);
      return false;
    }
  }
}

/**
 * Send a message to the content script on a tab, ensuring it's injected first.
 */
async function sendMessageToTab(tabId, message) {
  const success = await ensureContentScript(tabId);
  if (!success) {
    throw new Error('Không thể kết nối với trang sản phẩm BurgerPrints. Vui lòng tải lại trang.');
  }
  return await chrome.tabs.sendMessage(tabId, message);
}

function applyProductListingInPage(listing) {
  const standardFields = {
    title: document.querySelector('[formcontrolname="title"]'),
    seoTitle: document.querySelector('[formcontrolname="seo_title"]'),
    seoDescription: document.querySelector('[formcontrolname="seo_desc"]')
  };
  const richTextFields = {
    description: document.querySelector('editor[formcontrolname="desc"] textarea'),
    shortDescription: document.querySelector('editor[formcontrolname="short_desc"] textarea')
  };
  const missing = [];

  for (const [field, control] of Object.entries(standardFields)) {
    if (!control) missing.push(field);
  }
  for (const [field, textarea] of Object.entries(richTextFields)) {
    if (!textarea?.id || !window.tinymce?.get(textarea.id)) missing.push(field);
  }
  if (missing.length > 0) return { updated: [], missing };

  const setNativeValue = (control, value) => {
    const prototype = control.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(control, String(value || ''));
    else control.value = String(value || '');
    control.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    control.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  setNativeValue(standardFields.title, listing.title);
  setNativeValue(standardFields.seoTitle, listing.seoTitle);
  setNativeValue(standardFields.seoDescription, listing.seoDescription);

  for (const [field, textarea] of Object.entries(richTextFields)) {
    const editor = window.tinymce.get(textarea.id);
    editor.setContent(String(listing[field] || ''));
    const emitEditorEvent = typeof editor.dispatch === 'function'
      ? eventName => editor.dispatch(eventName)
      : eventName => editor.fire(eventName);
    emitEditorEvent('input');
    emitEditorEvent('change');
    editor.save();
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  return { updated: Object.keys(listing), missing };
}

// Listen for messages from content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_CUSTOMER_PROFILE') {
    (async () => {
      let shouldCloseOffscreen = false;
      try {
        if (profileAnalysisRunning || productContentRunning || fullExperienceRunning || quickJobStarting) {
          throw new Error('Một tác vụ AI đang chạy.');
        }
        profileAnalysisRunning = true;
        const stored = await chrome.storage.local.get(['gemini_api_key', QUICK_JOB_STORAGE_KEY, SIDE_PANEL_AI_TASK_KEY]);
        if (!stored.gemini_api_key) {
          throw new Error('Chưa thiết lập Gemini API key. Hãy thêm API key trước khi phân tích.');
        }
        const existingQuickJob = quickJob || stored[QUICK_JOB_STORAGE_KEY];
        if (existingQuickJob?.status === 'running' || existingQuickJob?.status === 'cancelling') {
          throw new Error('Một tác vụ tạo Mockup đang chạy. Vui lòng thử lại sau.');
        }
        if (hasActiveSidePanelAiTask(stored)) {
          throw new Error('Một tác vụ AI trong side panel đang chạy. Vui lòng thử lại sau.');
        }

        await ensureOffscreenDocument();
        shouldCloseOffscreen = true;
        const response = await chrome.runtime.sendMessage({
          type: 'CUSTOMER_PROFILE_RUNNER_ANALYZE',
          apiKey: stored.gemini_api_key,
          request: message.request || {}
        });
        sendResponse(response?.success || response?.cancelled ? response : {
          success: false,
          error: response?.error || 'Không thể phân tích phong cách khách hàng.'
        });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      } finally {
        if (shouldCloseOffscreen) await closeOffscreenDocument();
        profileAnalysisRunning = false;
      }
    })();
    return true;
  }

  if (message.type === 'CANCEL_CUSTOMER_PROFILE_ANALYSIS') {
    (async () => {
      if (!profileAnalysisRunning) {
        sendResponse({ success: false, error: 'Không có tác vụ phân tích hồ sơ đang chạy.' });
        return;
      }
      await chrome.runtime.sendMessage({ type: 'CUSTOMER_PROFILE_RUNNER_CANCEL' });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'SET_PRODUCT_LISTING') {
    (async () => {
      try {
        if (!sender.tab?.id) {
          throw new Error('Không tìm thấy tab sản phẩm.');
        }

        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          world: 'MAIN',
          args: [message.listing || {}],
          func: applyProductListingInPage
        });

        if (!result) {
          throw new Error('Không nhận được kết quả cập nhật form từ trang sản phẩm.');
        }
        sendResponse({ success: result?.missing?.length === 0, ...result });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'GENERATE_PRODUCT_CONTENT') {
    (async () => {
      let ownsContentRunner = false;
      let shouldCloseOffscreen = false;
      try {
        if (productContentRunning || fullExperienceRunning || quickJobStarting || profileAnalysisRunning) {
          throw new Error('Một tác vụ AI đang chạy.');
        }
        productContentRunning = true;
        ownsContentRunner = true;

        const stored = await chrome.storage.local.get([
          'gemini_api_key',
          'settings',
          QUICK_JOB_STORAGE_KEY,
          SIDE_PANEL_AI_TASK_KEY,
          'customerProfiles',
          'activeCustomerProfileId'
        ]);
        if (!stored.gemini_api_key) {
          throw new Error('Chưa thiết lập Gemini API key. Hãy mở tiện ích để thêm API key.');
        }
        const existingQuickJob = quickJob || stored[QUICK_JOB_STORAGE_KEY];
        if (existingQuickJob?.status === 'running' || existingQuickJob?.status === 'cancelling') {
          throw new Error('Một tác vụ tạo Mockup đang chạy. Vui lòng thử lại sau.');
        }
        if (hasActiveSidePanelAiTask(stored)) {
          throw new Error('Một tác vụ AI trong side panel đang chạy. Vui lòng thử lại sau.');
        }

        await ensureOffscreenDocument();
        shouldCloseOffscreen = true;
        const response = await chrome.runtime.sendMessage({
          type: 'PRODUCT_CONTENT_RUNNER_GENERATE',
          apiKey: stored.gemini_api_key,
          language: getAiContentLanguage(stored.settings),
          productData: message.productData || {},
          customerProfile: stored.settings?.useLearnedSellerStyleForContent === false
            ? null
            : getActiveCustomerProfile(stored)
        });
        if (!response?.success) {
          throw new Error(response?.error || 'Không thể tạo nội dung sản phẩm.');
        }
        sendResponse(response);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      } finally {
        if (ownsContentRunner) {
          if (shouldCloseOffscreen) {
            await closeOffscreenDocument();
          }
          productContentRunning = false;
        }
      }
    })();
    return true;
  }

  if (message.type === 'GENERATE_FULL_PRODUCT_EXPERIENCE') {
    (async () => {
      let ownsFullExperienceRunner = false;
      let shouldCloseOffscreen = false;
      try {
        if (productContentRunning || fullExperienceRunning || quickJobStarting || profileAnalysisRunning) {
          throw new Error('Một tác vụ AI đang chạy.');
        }
        fullExperienceRunning = true;
        ownsFullExperienceRunner = true;

        const stored = await chrome.storage.local.get([
          'gemini_api_key',
          'settings',
          QUICK_JOB_STORAGE_KEY,
          SIDE_PANEL_AI_TASK_KEY,
          'customerProfiles',
          'activeCustomerProfileId'
        ]);
        if (!stored.gemini_api_key) {
          throw new Error('Chưa thiết lập Gemini API key. Hãy mở tiện ích để thêm API key.');
        }
        const existingQuickJob = quickJob || stored[QUICK_JOB_STORAGE_KEY];
        if (existingQuickJob?.status === 'running' || existingQuickJob?.status === 'cancelling') {
          throw new Error('Một tác vụ tạo Mockup đang chạy. Vui lòng thử lại sau.');
        }
        if (hasActiveSidePanelAiTask(stored)) {
          throw new Error('Một tác vụ AI trong side panel đang chạy. Vui lòng thử lại sau.');
        }

        const productData = message.productData || {};
        const referenceImages = productData.mockupImages?.length
          ? productData.mockupImages
          : [productData.designImage].filter(Boolean);
        if (referenceImages.length === 0) {
          throw new Error('Không tìm thấy ảnh sản phẩm để tạo mockup.');
        }

        await ensureOffscreenDocument();
        shouldCloseOffscreen = true;
        const response = await chrome.runtime.sendMessage({
          type: 'PRODUCT_FULL_EXPERIENCE_RUNNER_GENERATE',
          apiKey: stored.gemini_api_key,
          language: getAiContentLanguage(stored.settings),
          productData,
          settings: {
            ...DEFAULT_QUICK_SETTINGS,
            ...(stored.settings || {})
          },
          customerProfile: stored.settings?.useLearnedSellerStyleForContent === false
            ? null
            : getActiveCustomerProfile(stored)
        });
        if (!response?.success) {
          throw new Error(response?.error || 'Không thể tạo ảnh và nội dung sản phẩm.');
        }
        sendResponse(response);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      } finally {
        if (ownsFullExperienceRunner) {
          if (shouldCloseOffscreen) {
            await closeOffscreenDocument();
          }
          fullExperienceRunning = false;
        }
      }
    })();
    return true;
  }

  if (message.type === 'START_QUICK_GENERATION') {
    (async () => {
      let ownsQuickStart = false;
      let startedJobId = null;
      try {
        if (productContentRunning || fullExperienceRunning || quickJobStarting || profileAnalysisRunning) {
          throw new Error('Một tác vụ AI đang chạy.');
        }
        quickJobStarting = true;
        ownsQuickStart = true;
        if (!sender.tab?.id) {
          throw new Error('Không tìm thấy tab sản phẩm.');
        }

        const stored = await chrome.storage.local.get([
          'gemini_api_key',
          'settings',
          QUICK_JOB_STORAGE_KEY,
          SIDE_PANEL_AI_TASK_KEY
        ]);
        const existingJob = quickJob || stored[QUICK_JOB_STORAGE_KEY];
        const hasActiveRunner = await hasOffscreenDocument();
        if ((existingJob?.status === 'running' || existingJob?.status === 'cancelling') && hasActiveRunner) {
          throw new Error('Một tác vụ tạo nhanh đang chạy.');
        }
        if (hasActiveSidePanelAiTask(stored)) {
          throw new Error('Một tác vụ AI trong side panel đang chạy. Vui lòng thử lại sau.');
        }
        if (!stored.gemini_api_key) {
          throw new Error('Chưa thiết lập Gemini API key. Hãy mở tiện ích để thêm API key.');
        }

        const productData = message.productData || {};
        const referenceImages = productData.mockupImages?.length
          ? productData.mockupImages
          : [productData.designImage].filter(Boolean);
        if (referenceImages.length === 0) {
          throw new Error('Không tìm thấy ảnh sản phẩm để tạo mockup.');
        }

        const jobId = `quick_${Date.now()}`;
        startedJobId = jobId;
        quickJob = {
          jobId,
          tabId: sender.tab.id,
          status: 'running',
          phase: 'preparing',
          progress: 3,
          message: 'Đang chuẩn bị tạo Mockup bằng AI...',
          addedCount: 0,
          generatedCount: 0,
          results: [],
          productData,
          startedAt: Date.now()
        };
        pendingQuickInserts.set(jobId, []);
        await persistQuickJob();
        await sendQuickStatusToTab();
        await ensureOffscreenDocument();

        const runnerResponse = await chrome.runtime.sendMessage({
          type: 'QUICK_RUNNER_START',
          job: {
            jobId,
            apiKey: stored.gemini_api_key,
            productData,
            settings: {
              ...DEFAULT_QUICK_SETTINGS,
              ...(stored.settings || {})
            },
            language: getAiContentLanguage(stored.settings)
          }
        });
        if (!runnerResponse?.success) {
          throw new Error(runnerResponse?.error || 'Không thể khởi động tiến trình tạo Mockup.');
        }

        sendResponse({ success: true, job: getPublicQuickJob() });
      } catch (err) {
        if (startedJobId && quickJob?.jobId === startedJobId && quickJob.status === 'running' && quickJob.phase === 'preparing') {
          await updateQuickJob({
            status: 'failed',
            phase: 'failed',
            progress: 0,
            message: err.message,
            error: err.message,
            finishedAt: Date.now()
          });
        }
        sendResponse({ success: false, error: err.message });
      } finally {
        if (ownsQuickStart) {
          quickJobStarting = false;
        }
      }
    })();
    return true;
  }

  if (message.type === 'CANCEL_QUICK_GENERATION') {
    (async () => {
      const job = await restoreQuickJob(message.jobId);
      if (!job || job.status !== 'running') {
        sendResponse({ success: false, error: 'Không có tác vụ đang chạy.' });
        return;
      }
      await updateQuickJob({
        status: 'cancelling',
        message: 'Đang hủy tác vụ...'
      });
      await chrome.runtime.sendMessage({
        type: 'QUICK_RUNNER_CANCEL',
        jobId: message.jobId
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'GET_QUICK_JOB_STATUS') {
    (async () => {
      const stored = await chrome.storage.local.get(QUICK_JOB_STORAGE_KEY);
      const job = quickJob || stored[QUICK_JOB_STORAGE_KEY] || null;
      sendResponse({
        success: true,
        job: job?.tabId === sender.tab?.id ? getPublicQuickJob(job) : null
      });
    })();
    return true;
  }

  if (message.type === 'QUICK_RUNNER_PROGRESS') {
    quickProgressQueue = quickProgressQueue.then(() => handleQuickRunnerProgress(message)).catch(err => {
      console.error('[BP AI Mockup] Quick runner progress failed:', err);
    });
    sendResponse({ received: true });
    return false;
  }

  if (message.type === 'OPEN_SIDE_PANEL') {
    (async () => {
      try {
        if (sender.tab) {
          // Thiết lập và kích hoạt side panel cho tab này trước khi mở
          chrome.sidePanel.setOptions({
            tabId: sender.tab.id,
            path: 'sidepanel/sidepanel.html',
            enabled: true
          });
          await chrome.sidePanel.open({ tabId: sender.tab.id });
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No tab context' });
        }
      } catch (err) {
        console.error('Failed to open side panel:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'GET_PRODUCT_DATA') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          sendResponse({ success: false, error: 'No active tab' });
          return;
        }

        // Check if the tab is on a BurgerPrints product page
        if (!tab.url?.includes('dash.burgerprints.com/admin/products')) {
          sendResponse({ success: false, error: 'Not a BurgerPrints product page' });
          return;
        }

        const response = await sendMessageToTab(tab.id, { type: 'EXTRACT_PRODUCT_DATA' });
        sendResponse({ success: true, data: response });
      } catch (err) {
        console.error('Failed to get product data:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'INSERT_MOCKUPS') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
          sendResponse({ success: false, error: 'No active tab' });
          return;
        }

        const response = await sendMessageToTab(tab.id, {
          type: 'ADD_MOCKUP_IMAGES',
          images: message.images
        });
        sendResponse({ success: true, data: response });
      } catch (err) {
        console.error('Failed to insert mockups:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});

// Enable side panel only on BurgerPrints product pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;

  const isBurgerPrints = tab.url?.includes('dash.burgerprints.com/admin/products');

  await chrome.sidePanel.setOptions({
    tabId,
    enabled: isBurgerPrints
  });
});

// Auto-inject content scripts into already-open BurgerPrints tabs
// when extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[BP AI Mockup] Extension installed/updated — injecting into existing tabs...');

  const tabs = await chrome.tabs.query({
    url: 'https://dash.burgerprints.com/admin/products/*'
  });

  for (const tab of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js']
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content/content.css']
      });
      // Thiết lập và kích hoạt luôn side panel cho tab hiện tại
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel/sidepanel.html',
        enabled: true
      });
      console.log(`[BP AI Mockup] Injected and enabled side panel into tab ${tab.id}: ${tab.url}`);
    } catch (err) {
      console.warn(`[BP AI Mockup] Could not inject/enable side panel for tab ${tab.id}:`, err);
    }
  }
});

console.log('[BP AI Mockup] Service worker initialized');
