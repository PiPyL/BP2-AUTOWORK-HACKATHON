/**
 * Hidden quick-generation runner.
 * Runs the long Gemini workflow without opening the side panel.
 */

(function () {
  'use strict';

  let activeJobId = null;
  let contentGenerationActive = false;
  let fullExperienceActive = false;
  let profileAnalysisActive = false;
  let profileAnalysisAbortController = null;
  let abortController = null;
  let progressQueue = Promise.resolve();

  function sendProgress(jobId, payload) {
    return chrome.runtime.sendMessage({
      type: 'QUICK_RUNNER_PROGRESS',
      jobId,
      ...payload
    });
  }

  function getReferenceImages(productData) {
    const images = productData?.mockupImages?.length
      ? productData.mockupImages
      : [productData?.designImage];
    return [...new Set(images.filter(Boolean))];
  }

  function getRecommendedOption(optionSets, key) {
    return optionSets?.[key]?.find(option => option.recommended)
      || optionSets?.[key]?.[0]
      || null;
  }

  function buildOptionPromptMap(optionSets = {}) {
    const keys = ['scenes', 'displayModes', 'photographyStyles', 'cameraAngles', 'lightingOptions'];
    return Object.fromEntries(keys.map(key => [
      key,
      Object.fromEntries((optionSets[key] || []).map(option => [option.id, option.prompt]))
    ]));
  }

  function applyBestSuggestion(settings, suggestions) {
    const preset = suggestions?.presets?.[0] || {};
    const optionSets = suggestions?.optionSets || {};
    const scene = preset.scene || getRecommendedOption(optionSets, 'scenes')?.id;
    const displayMode = preset.displayMode || getRecommendedOption(optionSets, 'displayModes')?.id;
    const style = preset.style || getRecommendedOption(optionSets, 'photographyStyles')?.id;
    const cameraAngle = preset.cameraAngle || getRecommendedOption(optionSets, 'cameraAngles')?.id;
    const lighting = preset.lighting || getRecommendedOption(optionSets, 'lightingOptions')?.id;

    return {
      ...settings,
      scenes: scene ? [scene] : settings.scenes,
      displayMode: displayMode || settings.displayMode,
      style: style || settings.style,
      cameraAngle: cameraAngle || settings.cameraAngle,
      lighting: lighting || settings.lighting,
      season: preset.season || settings.season,
      noPerson: preset.needsPerson === false
        ? true
        : preset.needsPerson === true
          ? false
          : settings.noPerson,
      gender: preset.gender || settings.gender,
      optionPrompts: buildOptionPromptMap(optionSets)
    };
  }

  async function runJob(job) {
    const { jobId, apiKey, productData, settings, language } = job;
    activeJobId = jobId;
    abortController = new AbortController();
    geminiService.setApiKey(apiKey);
    geminiService.setAbortSignal(abortController.signal);

    try {
      const referenceImages = getReferenceImages(productData);
      if (referenceImages.length === 0) {
        throw new Error('Không tìm thấy ảnh sản phẩm để tạo mockup.');
      }

      await sendProgress(jobId, {
        phase: 'suggesting',
        progress: 8,
        message: 'Đang phân tích sản phẩm và chọn chủ đề phù hợp...'
      });

      const suggestions = await geminiService.suggestSettings({
        productImageUrls: referenceImages,
        productData,
        language: language || 'vi'
      });
      const selectedPreset = suggestions?.presets?.[0];
      const quickSettings = applyBestSuggestion(settings, suggestions);

      await sendProgress(jobId, {
        phase: 'analyzing',
        progress: 20,
        message: selectedPreset?.name
          ? `Đã chọn chủ đề: ${selectedPreset.name}. Đang phân tích chi tiết sản phẩm...`
          : 'Đã chọn thiết lập phù hợp. Đang phân tích chi tiết sản phẩm...',
        presetName: selectedPreset?.name || ''
      });

      const productDescription = await geminiService.analyzeProduct(referenceImages);
      const results = await geminiService.generateMockups(
        referenceImages,
        productDescription,
        quickSettings,
        progress => {
          const total = progress.total || quickSettings.count || 3;
          const base = progress.type === 'auditing' ? 58 : progress.type === 'complete' ? 72 : 30;
          const range = progress.type === 'complete' ? 22 : 28;
          const percentage = Math.min(94, Math.round(base + (progress.current / total) * range));
          const messages = {
            generating: `Đang tạo ảnh ${progress.current}/${total}...`,
            auditing: `Đang kiểm tra chất lượng ảnh ${progress.current}/${total}...`,
            complete: `Ảnh ${progress.current}/${total} đã hoàn thành.`,
            error: `Không thể tạo ảnh ${progress.current}/${total}: ${progress.error}`
          };

          progressQueue = progressQueue.then(() => sendProgress(jobId, {
            phase: progress.type === 'complete' ? 'generating' : progress.type,
            eventType: progress.type,
            progress: percentage,
            message: messages[progress.type] || progress.message,
            current: progress.current,
            total,
            result: progress.result || null,
            error: progress.error || null
          })).catch(console.error);
        }
      );

      await progressQueue;
      await sendProgress(jobId, {
        phase: 'finished',
        progress: 100,
        message: 'Đã hoàn thành tạo mockup.',
        results,
        settings: quickSettings
      });
    } catch (err) {
      const cancelled = err?.name === 'AbortError' || abortController?.signal.aborted;
      await sendProgress(jobId, {
        phase: cancelled ? 'cancelled' : 'failed',
        progress: 0,
        message: cancelled ? 'Đã hủy tạo mockup.' : err.message,
        error: err.message
      });
    } finally {
      geminiService.setAbortSignal(null);
      activeJobId = null;
      abortController = null;
      progressQueue = Promise.resolve();
    }
  }

  async function generateFullProductExperience(message) {
    const { apiKey, productData, settings, language, customerProfile } = message;
    geminiService.setApiKey(apiKey);

    const referenceImages = getReferenceImages(productData);
    if (referenceImages.length === 0) {
      throw new Error('Không tìm thấy ảnh sản phẩm để tạo mockup.');
    }

    const suggestions = await geminiService.suggestSettings({
      productImageUrls: referenceImages,
      productData,
      language: language || 'vi'
    });
    const quickSettings = applyBestSuggestion(settings || {}, suggestions);
    const productDescription = await geminiService.analyzeProduct(referenceImages);
    const results = await geminiService.generateMockups(
      referenceImages,
      productDescription,
      quickSettings
    );
    const images = results
      .filter(result => result?.imageData && result?.audit?.pass !== false)
      .map(result => result.imageData);

    if (images.length === 0) {
      throw new Error('Gemini chưa tạo được ảnh mockup đạt kiểm tra chất lượng.');
    }

    const listing = await geminiService.generateProductListing(
      {
        ...productData,
        mockupImages: [...images, ...referenceImages].slice(0, 4)
      },
      language || 'vi',
      customerProfile || null
    );

    return {
      listing,
      images,
      generatedCount: results.length,
      presetName: suggestions?.presets?.[0]?.name || ''
    };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CUSTOMER_PROFILE_RUNNER_ANALYZE') {
      if (activeJobId || contentGenerationActive || fullExperienceActive || profileAnalysisActive) {
        sendResponse({ success: false, error: 'Một tác vụ AI đang chạy. Vui lòng thử lại sau.' });
        return false;
      }

      (async () => {
        profileAnalysisActive = true;
        profileAnalysisAbortController = new AbortController();
        try {
          geminiService.setApiKey(message.apiKey);
          geminiService.setAbortSignal(profileAnalysisAbortController.signal);
          const analysis = await geminiService.analyzeCustomerProfile(message.request || {});
          sendResponse({
            success: true,
            profile: analysis.profile,
            urlSources: analysis.urlSources
          });
        } catch (err) {
          sendResponse({
            success: false,
            cancelled: err?.name === 'AbortError' || profileAnalysisAbortController?.signal.aborted,
            error: err.message
          });
        } finally {
          geminiService.setAbortSignal(null);
          profileAnalysisAbortController = null;
          profileAnalysisActive = false;
        }
      })();
      return true;
    }

    if (message.type === 'CUSTOMER_PROFILE_RUNNER_CANCEL') {
      profileAnalysisAbortController?.abort();
      sendResponse({ success: true });
      return false;
    }

    if (message.type === 'PRODUCT_CONTENT_RUNNER_GENERATE') {
      if (activeJobId || contentGenerationActive || fullExperienceActive || profileAnalysisActive) {
        sendResponse({ success: false, error: 'Một tác vụ AI đang chạy. Vui lòng thử lại sau.' });
        return false;
      }

      (async () => {
        contentGenerationActive = true;
        try {
          geminiService.setApiKey(message.apiKey);
          const listing = await geminiService.generateProductListing(
            message.productData,
            message.language || 'en',
            message.customerProfile || null
          );
          sendResponse({ success: true, listing });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        } finally {
          contentGenerationActive = false;
        }
      })();
      return true;
    }

    if (message.type === 'PRODUCT_FULL_EXPERIENCE_RUNNER_GENERATE') {
      if (activeJobId || contentGenerationActive || fullExperienceActive || profileAnalysisActive) {
        sendResponse({ success: false, error: 'Một tác vụ AI đang chạy. Vui lòng thử lại sau.' });
        return false;
      }

      (async () => {
        fullExperienceActive = true;
        try {
          const experience = await generateFullProductExperience(message);
          sendResponse({ success: true, ...experience });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        } finally {
          geminiService.setAbortSignal(null);
          fullExperienceActive = false;
        }
      })();
      return true;
    }

    if (message.type === 'QUICK_RUNNER_START') {
      if (activeJobId || contentGenerationActive || fullExperienceActive || profileAnalysisActive) {
        sendResponse({ success: false, error: 'Một tác vụ AI đang chạy.' });
        return false;
      }
      runJob(message.job);
      sendResponse({ success: true });
      return false;
    }

    if (message.type === 'QUICK_RUNNER_CANCEL' && message.jobId === activeJobId) {
      abortController?.abort();
      sendResponse({ success: true });
      return false;
    }

    return false;
  });
})();
