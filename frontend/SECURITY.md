# Frontend Security Hardening Guide

## Overview
This document outlines the security measures implemented in the frontend to prevent XSS (Cross-Site Scripting) and other vulnerabilities.

## 1. Safe HTML Rendering
We have implemented a strict policy against using `dangerouslySetInnerHTML` directly. All dynamic HTML content MUST be rendered using the `SanitizedHTML` component.

### Usage
```jsx
import SanitizedHTML from '../components/common/SanitizedHTML';

// BAD ❌
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// GOOD ✅
<SanitizedHTML html={userContent} />
```

### How it Works
The `SanitizedHTML` component uses `isomorphic-dompurify` to strip out malicious scripts (e.g., `<script>`, `onload` handlers) before rendering the content. It allows safe HTML tags like `<b>`, `<i>`, `<p>`, and links with `target="_blank"`.

## 2. Authentication & Token Storage
*   **Current State:** The application supports both HttpOnly cookies (preferred) and `localStorage` (fallback) for storing authentication tokens.
*   **Hardening:** `api.js` is configured with `withCredentials: true` to automatically send cookies to the backend.
*   **Recommendation:** Over time, migrate fully to HttpOnly cookies and remove `localStorage` token logic to eliminate token theft via XSS.

## 3. Data Binding
*   **React Default:** We rely on React's default data binding `{variable}` which automatically escapes content.
*   **Audit Result:** `MessageBubble.jsx`, `ProfileCard.jsx`, and `AIAssistantPanel.jsx` were audited and found to use safe bindings.

## 4. Dependencies
*   `isomorphic-dompurify`: Added for robust sanitization.

## 5. Ongoing Maintenance
*   Linting rules should enforce "no-danger" to catch accidental usage of `dangerouslySetInnerHTML`.
*   Regularly update `isomorphic-dompurify` to patch new bypass techniques.
