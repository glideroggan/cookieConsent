import { ConsentCategory } from './cookie-consent.component';

export function getConsentTemplate(categories: ConsentCategory[], description?: string): string {
  return `
    <dialog class="consent-dialog" id="consent-dialog">
      <div class="consent-container">
        <div class="consent-header">
          <div class="consent-title">Cookie Preferences</div>
          <div class="consent-description">${description}</div>
        </div>
        
        <div class="consent-categories">
          ${categories.map(category => /*html*/`
            <div class="category">
              <div class="category-info">
                <div class="category-name">${category.name}</div>
                <div class="category-description">${category.description}</div>
              </div>
              <div class="category-toggle">
                <input 
                  type="checkbox" 
                  class="toggle" 
                  id="toggle-${category.id}"
                  ${category.enabled ? 'checked' : ''}
                  ${category.required ? 'disabled' : ''}
                  data-category="${category.id}"
                />
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="consent-actions">
          <button class="btn btn-secondary" id="decline-btn">Decline All</button>
          <button class="btn btn-secondary" id="save-btn">Save Preferences</button>
          <button class="btn btn-primary" id="accept-btn">Accept All</button>
        </div>
      </div>
    </dialog>
  `;
}
