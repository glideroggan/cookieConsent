export function getConsentStyles(): string {
  return /*css*/`
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    }

    /* Scroll lock styles */
    .scroll-lock {
      overflow: hidden !important;
      padding-right: var(--scrollbar-width, 0px) !important;
    }

    .scroll-lock-spacer {
      padding-right: var(--scrollbar-width, 0px);
    }    .consent-dialog {
      margin: auto;
      padding: 0;
      border: none;
      border-radius: 12px;
      background: var(--cc-bg, #fff);
      color: var(--cc-text, #333);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      max-width: min(600px, 90vw);
      max-height: 90vh;
      overflow: auto;
      z-index: 2147483647; /* Ensure dialog is on top */
    }

    .consent-dialog::backdrop {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
    }

    .consent-container {
      padding: 24px;
    }

    .consent-header {
      margin-bottom: 16px;
    }

    .consent-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .consent-description {
      margin-bottom: 16px;
      opacity: 0.8;
    }

    .consent-categories {
      margin-bottom: 20px;
    }

    .category {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--cc-border, #eee);
    }

    .category:last-child {
      border-bottom: none;
    }

    .category-info {
      flex: 1;
    }

    .category-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .category-description {
      font-size: 12px;
      opacity: 0.7;
    }

    .category-toggle {
      margin-left: 16px;
    }

    .toggle {
      position: relative;
      width: 44px;
      height: 24px;
      background: var(--cc-toggle-bg, #ccc);
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      appearance: none;
      -webkit-appearance: none;
    }

    .toggle:checked {
      background: var(--cc-primary, #007bff);
    }

    .toggle:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }

    .toggle:checked::after {
      transform: translateX(20px);
    }

    .consent-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--cc-primary, #007bff);
      color: white;
    }

    .btn-secondary {
      background: var(--cc-secondary, #6c757d);
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    /* Theme variants */
    :host([theme="dark"]) {
      --cc-bg: #2d3748;
      --cc-text: #e2e8f0;
      --cc-border: #4a5568;
      --cc-toggle-bg: #4a5568;
    }

    :host([theme="light"]) {
      --cc-bg: #ffffff;
      --cc-text: #333333;
      --cc-border: #e2e8f0;
      --cc-toggle-bg: #cbd5e0;
    }

    @media (prefers-color-scheme: dark) {
      :host([theme="auto"]) {
        --cc-bg: #2d3748;
        --cc-text: #e2e8f0;
        --cc-border: #4a5568;
        --cc-toggle-bg: #4a5568;
      }
    }

    @media (max-width: 768px) {
      .consent-container {
        padding: 16px;
      }
      
      .consent-actions {
        flex-direction: column;
      }
      
      .category {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .category-toggle {
        margin-left: 0;
        margin-top: 8px;
      }
    }
  `;
}
