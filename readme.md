# Cookie Consent
![npm](https://img.shields.io/npm/v/cookie-consent?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/min/cookie-consent?style=flat-square)
![npm](https://img.shields.io/npm/dt/cookie-consent?style=flat-square)
![GitHub](https://img.shields.io/github/license/glideroggan/cookieConsent?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/glideroggan/cookieConsent?style=flat-square)

- Webcomponent
- Vanilla typescript
- esbuild

- Should be able to be added through normal npm install
- 1 part web
- 1 part api with sqlite db

# Usage
```html
<script type="module" src="https://cdn.jsdelivr.net/npm/cookie-consent@latest/dist/cookie-consent.js"></script>
```
- will create its own element `<cookie-consent></cookie-consent>`
- all script tags that should be blocked, should have their type set to `text/plain`, and the `data-consent` attribute set to the catorgory of the script, e.g. `data-consent="analytics"`.

# How it works
The component will check if a cookie exists with the name `cookie-consent`. If it does, it will check if the API consent is newer than the cookie. If it is, it will show the consent form. If the cookie does not exist, it will also show the consent form.

When the user accepts/declines, it will:
1. Update the cookie with the consent preferences
2. Automatically scan all script tags with `data-consent` attributes
3. Enable scripts by replacing `type="text/plain"` with executable script tags
4. Browser immediately downloads and runs the newly enabled scripts
5. Emit a `scripts-enabled` event with details about enabled categories

**No page reload required!** Scripts are dynamically enabled when consent is given.

# Flowchart
```mermaid
flowchart TD
    A[User visits website] --> A2[Get data from api]
    A2 -- got it --> B[check if cookie exists]
    A2 -- api error --> END
    B -- yes --> B2[Is API consent newer than cookie?]
    B -- no --> Banner[Show consent form]
    B2 -- yes --> Banner[Show consent form]
    B2 -- no --> C[Scan all script tags]
    Banner[Show consent form] -- any button --> D[Update cookie with consent]
    D --> C[Scan all script tags]
    C --> END
```


# TODO
- add the fallback categories in the slot of the element, so that users can specify fallback categories in the consent form
- Look into what we need to do to cover all the scripts in a page, because "document.querySelectorAll('script[data-consent]')" will not cover all cases
- mock up the actual consent form, in a stand alone html file