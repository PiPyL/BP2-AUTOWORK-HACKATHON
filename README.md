# BurgerPrints AI Mockup Generator (Chrome Extension)

[🇻🇳 Phiên bản Tiếng Việt](README-vi.md)

An intelligent, secure Chrome Extension tailored for **BurgerPrints** sellers. It leverages Google's Gemini API to automatically generate lifestyle mockups and write SEO-optimized product listings directly on the product creation page—saving hours of manual design and copywriting.

---

## 🌟 Key Features

### 1. AI Lifestyle Mockup Generator
*   **Custom Mockup Generation**: Open the interactive side panel to customize mockup concepts (character demographics, setting, style, outfit alignment, and count) and generate highly targeted lifestyle mockups.
*   **Auto Mockup (1-Click Generation)**: Generates mockup images directly on the product listing page without opening the side panel. The AI analyzes your product design and suggests appropriate settings and styles automatically.
*   **Quality Audit**: Every generated image passes through an AI safety and quality check to prevent distorted human faces, famous personalities, or brand logos, ensuring the product design is preserved 100%.

### 2. AI Product Listing & SEO Writer
*   **Automatic Content Generation**: Generate high-converting **Product Title (H1)**, **Description**, **Short Description**, **SEO Meta Title**, and **SEO Meta Description** from your product context in one click.
*   **Image-to-Text Integration**: Analyzes newly generated mockup images to write highly accurate, visually aligned descriptions.

### 3. Serverless & Secure
*   **Direct API Integration**: Connects directly to Google Gemini API from the client's browser. Your API keys are stored securely in local extension storage and are never sent to third-party backends.
*   **Offline Runner**: Heavy tasks like image generation and verification are processed in an offscreen helper script to prevent UI freezing.

---

## 📦 Installation Guide for Non-Tech Users

There are two ways to install this extension. If you just want to use the extension, we highly recommend **Method 1**.

### Method 1: Install using the ZIP file (Recommended)

1.  **Download the Extension**: 
    Click this link to download the latest version of the extension:  
    👉 [Download burger-mockup-extension.zip](https://github.com/PiPyL/BP2-AUTOWORK-HACKATHON/releases/latest/download/burger-mockup-extension.zip)
2.  **Extract the ZIP File**:
    *   **Windows**: Right-click the downloaded file and select **Extract All...**, then choose a folder destination.
    *   **Mac**: Double-click the downloaded `.zip` file. It will automatically extract into a folder named `burger-mockup-extension`.
    *   *Note: Save this extracted folder in a safe place (e.g., your Documents folder). Do not delete or move it after installation.*
3.  **Open Chrome Extensions Page**:
    *   Open your Google Chrome browser.
    *   In the address bar, type `chrome://extensions/` and press **Enter**.
    *   Alternatively, click the puzzle icon (Extensions) in the top-right corner of Chrome and select **Manage Extensions**.
4.  **Enable Developer Mode**:
    *   In the top-right corner of the Extensions page, toggle the **Developer mode** switch to **ON**.
5.  **Load the Extension**:
    *   Click the **Load unpacked** button in the top-left corner.
    *   Select the extracted `burger-mockup-extension` folder (the directory containing `manifest.json`).
    *   *Voila! The extension is now active and ready.*

---

### Method 2: Install from Source Code (For Developers)

1.  Clone the repository:
    ```bash
    git clone https://github.com/PiPyL/BP2-AUTOWORK-HACKATHON.git
    ```
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Turn on **Developer mode**.
4.  Click **Load unpacked** and select the cloned repository folder.

---

## 🔑 Setup & API Configuration

This extension communicates directly with Google's Gemini API, which requires an API key. We provide two options to get your API key:

> [!IMPORTANT]  
> **Option 1: Use the Shared Gemini API Key (Fastest & Easiest)**  
> To help you get started instantly without creating a Google AI Studio account, you can use our pre-configured shared key:  
> 👉 **[Get Shared Gemini API Key here](https://zerobin.cc/?b96c1f5c3af7dd11#9CJPLzD6CdkmtaNTihH7zVDiAPbw5fmhLHYmqxkUdnQ)** *(Click to view and copy the key)*.

---

**Option 2: Create Your Own Free API Key (Recommended for stable usage)**  
1.  **Get a Gemini API Key**:
    *   Go to [Google AI Studio](https://aistudio.google.com/).
    *   Sign in with your Google account.
    *   Click **Get API key** (Create API Key) and copy the generated key.

---

### How to Add the Key to the Extension:
1.  Open the BurgerPrints product creation page: [dash.burgerprints.com/admin/products/new](https://dash.burgerprints.com/admin/products/new).
2.  You will see a banner injected by the extension. Click **Tạo Mockup Tùy Chỉnh** (Custom Mockup) or the extension icon to open the Side Panel.
3.  In the Side Panel settings, navigate to the **API Settings** tab or section.
4.  Paste your Gemini API key (from Option 1 or Option 2) and click **Save**.

---

## 🚀 How to Use

### AI Listing Content Generator
1.  Navigate to the BurgerPrints **New Product** page.
2.  Find the **AI Content Assistant** banner located just below the Title (H1) field.
3.  Click **AI viết nội dung sản phẩm** (Write product content with AI).
4.  Wait a few seconds as the AI drafts your Title, Description, and SEO metadata. Review the drafted content before saving the product.

### AI Mockup Generator (Custom)
1.  Click **Tạo Mockup Tùy Chỉnh** (Custom Mockup) under the Mockup section or click the Extension icon to open the Side Panel.
2.  Select your preferences:
    *   **Model Demographic**: Nationality (e.g., American, Japanese, Korean) and Age/Gender.
    *   **Concept/Setting**: Indoors, Outdoors, Studio, Cafe, Street, etc.
    *   **Placement Style**: Product worn by the model, product held, flat lay, etc.
    *   **Image Count**: Choose how many mockups you want to generate.
3.  Click **Generate**. The generated images will appear one-by-one as they complete.
4.  Check the boxes next to the images you like, and click **Add to Mockups** to append them directly into your BurgerPrints mockup slot.

### Quick/Auto Mockup (1-Click)
1.  Click **Tạo Mockup Tự Động** (Auto Mockup) under the Mockup section.
2.  The extension will run in the background (using an offscreen page), automatically analyzing your design to match it with the best demographic and background.
3.  You can monitor progress, cancel if needed, and successful mockups will be added to the gallery sequentially.

---

## 📁 Project Structure

```plaintext
├── manifest.json              # Extension metadata and permission definitions
├── _locales/                  # Multilingual support files (vi, en)
├── background/
│   └── service-worker.js      # Ephemeral background script managing panel states and messaging
├── content/
│   ├── content.js             # Script injected into BurgerPrints page to manage DOM manipulation
│   └── content.css            # Styles for the injected UI elements (buttons, progress bars, banners)
├── sidepanel/
│   ├── sidepanel.html         # Side Panel user interface
│   ├── sidepanel.js           # Controller for side panel interactions
│   ├── sidepanel.css          # Styling for side panel components
│   ├── gemini-service.js      # Communication layer with Gemini API
│   ├── storage-service.js     # Helper script for local/sync extension storage
│   └── i18n-service.js        # Localization helper for side panel
├── offscreen/
│   ├── runner.html            # Ephemeral page container for offscreen tasks
│   └── runner.js              # Script running heavy logic (fetching, checking, generation)
└── icons/                     # UI Assets for Chrome toolbar & dashboards
```

---

## 🛡️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

*Disclaimer: This extension is an independent tool developed to assist BurgerPrints sellers and is not officially affiliated with BurgerPrints.*
