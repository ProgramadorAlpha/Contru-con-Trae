# Manual Testing Guide - Dashboard Unification

## Overview

This document provides a comprehensive manual testing checklist for the unified dashboard and dark mode implementation. Use this guide to systematically test all features across different devices, browsers, and accessibility tools.

---

## Testing Environment Setup

### Required Tools

- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Devices**: Desktop (1920x1080, 1366x768), Tablet (768x1024), Mobile (375x667, 414x896)
- **Accessibility Tools**:
  - Chrome Lighthouse
  - axe DevTools browser extension
  - WAVE browser extension
  - Screen reader (NVDA for Windows, VoiceOver for Mac)

### Test Data Requirements

- At least 3 active projects with different budget levels
- Sample financial data (income/expenses)
- Notifications in different states (read/unread)
- Various date ranges for filtering

---

## 1. Device Testing Checklist

### Desktop Testing (1920x1080)

#### Layout & Responsiveness
- [ ] Dashboard loads without horizontal scroll
- [ ] All widgets display in proper grid layout (4 columns for stats)
- [ ] Charts render at appropriate sizes
- [ ] Modals center properly on screen
- [ ] Sidebar navigation is fully visible
- [ ] Header elements are properly aligned

#### Theme Switching
- [ ] Dark mode toggle in header works smoothly
- [ ] All components transition smoothly (200ms)
- [ ] No flash of unstyled content
- [ ] Theme persists after page reload
- [ ] All text remains readable in both themes
- [ ] Icons change color appropriately

#### Dashboard Functionality
- [ ] Stats cards display correct data
- [ ] Charts render without errors
- [ ] Filters work correctly (day, week, month, year, custom)
- [ ] Date range picker functions properly
- [ ] Export button downloads JSON file
- [ ] Settings modal opens and saves preferences
- [ ] Widget visibility toggles work
- [ ] Auto-refresh can be configured

#### Modals
- [ ] Income modal opens and closes smoothly
- [ ] Expense modal opens and closes smoothly
- [ ] Visit schedule modal opens and closes smoothly
- [ ] Form validation works (required fields, date validation)
- [ ] Submit buttons show loading state
- [ ] Success notifications appear after submission
- [ ] ESC key closes modals
- [ ] Click outside closes modals

#### Notifications
- [ ] Notification bell shows unread count
- [ ] Notification panel slides in from right
- [ ] Notifications can be marked as read
- [ ] "Mark all as read" works
- [ ] Notifications can be deleted
- [ ] Auto-generated notifications appear (budget warnings, deadlines)

### Desktop Testing (1366x768)

- [ ] Layout adjusts appropriately for smaller screen
- [ ] No content is cut off or hidden
- [ ] All functionality remains accessible
- [ ] Charts scale appropriately

### Tablet Testing (768x1024 - Portrait)

#### Layout
- [ ] Stats cards display in 2-column grid
- [ ] Charts stack vertically
- [ ] Sidebar collapses to hamburger menu
- [ ] Header elements remain accessible
- [ ] Modals fit within viewport

#### Touch Interactions
- [ ] All buttons respond to touch
- [ ] Dropdowns work with touch
- [ ] Date pickers work with touch
- [ ] Scrolling is smooth
- [ ] No accidental double-taps

#### Theme & Functionality
- [ ] Dark mode toggle works with touch
- [ ] All desktop features work on tablet
- [ ] Forms are easy to fill on touch screen

### Tablet Testing (1024x768 - Landscape)

- [ ] Layout similar to desktop but optimized
- [ ] Stats cards in 3-4 column grid
- [ ] All features accessible

### Mobile Testing (375x667 - iPhone SE)

#### Layout
- [ ] Stats cards display in single column
- [ ] Charts stack vertically and fit width
- [ ] Header collapses appropriately
- [ ] Sidebar becomes full-screen overlay
- [ ] Modals take full screen or near-full screen
- [ ] No horizontal scroll anywhere

#### Touch & Gestures
- [ ] Tap targets are at least 44x44px
- [ ] Swipe to close notification panel works
- [ ] Pull to refresh (if implemented) works
- [ ] Pinch to zoom disabled on UI elements
- [ ] Scrolling is smooth and natural

#### Mobile-Specific Features
- [ ] Dark mode toggle accessible in mobile header
- [ ] Forms are easy to fill on small screen
- [ ] Date pickers use native mobile pickers
- [ ] Dropdowns work well on mobile
- [ ] Virtual keyboard doesn't break layout

#### Performance
- [ ] Page loads quickly on mobile
- [ ] Animations are smooth (60fps)
- [ ] No lag when switching themes
- [ ] Charts render without freezing

### Mobile Testing (414x896 - iPhone 11 Pro)

- [ ] Similar checks as iPhone SE
- [ ] Verify larger screen utilization
- [ ] Check notch compatibility (if applicable)

---

## 2. Browser Testing Checklist

### Chrome (Latest)

#### Core Functionality
- [ ] Dashboard loads correctly
- [ ] All features work as expected
- [ ] Theme switching works
- [ ] localStorage persists data
- [ ] No console errors
- [ ] No console warnings (or only expected ones)

#### Performance
- [ ] Lighthouse Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] No memory leaks (check DevTools Memory tab)

#### Developer Tools Checks
- [ ] No React errors in console
- [ ] No network errors
- [ ] Proper HTTP status codes
- [ ] Efficient bundle size

### Firefox (Latest)

- [ ] All Chrome tests pass
- [ ] CSS Grid/Flexbox renders correctly
- [ ] Transitions work smoothly
- [ ] localStorage works
- [ ] Date pickers work (may differ from Chrome)
- [ ] No Firefox-specific console errors

### Safari (Latest - macOS/iOS)

- [ ] All core functionality works
- [ ] Theme switching works
- [ ] Webkit-specific CSS renders correctly
- [ ] Date pickers use Safari native UI
- [ ] localStorage works
- [ ] No Safari-specific errors
- [ ] Touch events work on iOS Safari
- [ ] Viewport meta tag works correctly on iOS

### Edge (Latest)

- [ ] All Chrome tests pass (Chromium-based)
- [ ] No Edge-specific issues
- [ ] Windows-specific features work

### Cross-Browser Issues to Check

- [ ] Font rendering consistent
- [ ] Color accuracy across browsers
- [ ] Animation performance similar
- [ ] Form elements styled consistently
- [ ] No browser-specific layout bugs

---

## 3. User Flow Testing

### Flow 1: First-Time User Experience

1. [ ] Open application for first time
2. [ ] Verify system theme is detected
3. [ ] Dashboard loads with default widgets
4. [ ] All data displays correctly
5. [ ] User can navigate all features
6. [ ] Help/tooltips are clear (if implemented)

### Flow 2: Theme Customization

1. [ ] User clicks dark mode toggle
2. [ ] Theme switches smoothly
3. [ ] All components update
4. [ ] Preference saves to localStorage
5. [ ] Reload page - theme persists
6. [ ] Switch back to light mode
7. [ ] Verify smooth transition again

### Flow 3: Dashboard Configuration

1. [ ] Open settings modal
2. [ ] Toggle widget visibility
3. [ ] Change auto-refresh interval
4. [ ] Change default time filter
5. [ ] Save settings
6. [ ] Verify widgets show/hide immediately
7. [ ] Reload page - settings persist
8. [ ] Restore defaults
9. [ ] Verify reset works

### Flow 4: Financial Data Entry

1. [ ] Click "Add Income" button
2. [ ] Fill out income form
3. [ ] Submit form
4. [ ] Verify success notification
5. [ ] Verify stats update
6. [ ] Click "Add Expense" button
7. [ ] Fill out expense form
8. [ ] Submit form
9. [ ] Verify success notification
10. [ ] Verify budget utilization updates

### Flow 5: Data Filtering

1. [ ] Select "Week" filter
2. [ ] Verify data updates
3. [ ] Select "Month" filter
4. [ ] Verify data updates
5. [ ] Select "Custom" filter
6. [ ] Choose date range
7. [ ] Verify data filters correctly
8. [ ] Try invalid date range (end before start)
9. [ ] Verify validation error

### Flow 6: Data Export

1. [ ] Click export button
2. [ ] Verify loading indicator
3. [ ] Verify file downloads
4. [ ] Open JSON file
5. [ ] Verify data structure is correct
6. [ ] Verify all current data is included

### Flow 7: Notification Management

1. [ ] Trigger notification (add expense near budget limit)
2. [ ] Verify notification appears
3. [ ] Verify badge count updates
4. [ ] Click notification bell
5. [ ] Verify panel opens
6. [ ] Mark notification as read
7. [ ] Verify badge count decreases
8. [ ] Delete notification
9. [ ] Verify it's removed
10. [ ] Mark all as read
11. [ ] Verify all marked

### Flow 8: Error Handling

1. [ ] Disconnect network
2. [ ] Try to load dashboard
3. [ ] Verify error message displays
4. [ ] Verify retry button appears
5. [ ] Reconnect network
6. [ ] Click retry
7. [ ] Verify data loads
8. [ ] Trigger form validation error
9. [ ] Verify error message is clear

### Flow 9: Auto-Refresh

1. [ ] Enable auto-refresh (30s interval)
2. [ ] Wait for refresh
3. [ ] Verify subtle loading indicator
4. [ ] Verify data updates
5. [ ] Verify no interruption to user interaction
6. [ ] Disable auto-refresh
7. [ ] Verify refreshing stops

### Flow 10: Visit Scheduling

1. [ ] Click "Schedule Visit" button
2. [ ] Fill out visit form
3. [ ] Select project, date, time
4. [ ] Add visitor and purpose
5. [ ] Submit form
6. [ ] Verify success notification
7. [ ] Verify visit appears in schedule (if visible)

---

## 4. Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter/Space activate buttons
- [ ] ESC closes modals
- [ ] Arrow keys work in dropdowns
- [ ] No keyboard traps
- [ ] Skip to main content link (if implemented)

### Screen Reader Testing (NVDA/VoiceOver)

- [ ] Page title is announced
- [ ] Headings are properly structured (h1, h2, h3)
- [ ] Buttons have descriptive labels
- [ ] Form fields have labels
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Loading states are announced
- [ ] Modal dialogs are announced
- [ ] Theme toggle announces state
- [ ] Charts have text alternatives

### Color Contrast (WCAG AA)

- [ ] Text on background: minimum 4.5:1 ratio
- [ ] Large text: minimum 3:1 ratio
- [ ] Interactive elements: minimum 3:1 ratio
- [ ] Focus indicators: minimum 3:1 ratio
- [ ] Check both light and dark themes
- [ ] Use browser DevTools contrast checker

### Lighthouse Accessibility Audit

1. [ ] Run Lighthouse in Chrome DevTools
2. [ ] Accessibility score > 95
3. [ ] Review and fix any issues:
   - [ ] No missing alt text
   - [ ] No missing ARIA labels
   - [ ] Proper heading hierarchy
   - [ ] Sufficient color contrast
   - [ ] No duplicate IDs

### axe DevTools Audit

1. [ ] Install axe DevTools extension
2. [ ] Run full page scan
3. [ ] Review critical issues
4. [ ] Review serious issues
5. [ ] Fix all critical and serious issues
6. [ ] Document moderate issues for future

### WAVE Audit

1. [ ] Install WAVE extension
2. [ ] Run WAVE scan
3. [ ] Review errors (red icons)
4. [ ] Review alerts (yellow icons)
5. [ ] Fix all errors
6. [ ] Address alerts where possible

### Motion & Animation

- [ ] Respect prefers-reduced-motion
- [ ] Animations can be disabled
- [ ] No auto-playing animations
- [ ] Transitions are smooth but not too fast

### Form Accessibility

- [ ] All inputs have labels
- [ ] Required fields are marked
- [ ] Error messages are associated with fields
- [ ] Success messages are clear
- [ ] Placeholder text is not sole label
- [ ] Autocomplete attributes where appropriate

---

## 5. Performance Testing

### Load Time

- [ ] Initial page load < 3 seconds
- [ ] Dashboard data loads < 2 seconds
- [ ] Charts render < 1 second
- [ ] Modals open instantly
- [ ] Theme switch < 200ms

### Runtime Performance

- [ ] Smooth scrolling (60fps)
- [ ] No jank during interactions
- [ ] Charts animate smoothly
- [ ] No lag when typing in forms
- [ ] Auto-refresh doesn't freeze UI

### Memory Usage

- [ ] No memory leaks over time
- [ ] Memory usage stable with auto-refresh
- [ ] Opening/closing modals doesn't leak
- [ ] Theme switching doesn't leak

### Network

- [ ] Efficient API calls (no unnecessary requests)
- [ ] Proper caching headers
- [ ] Debounced filter changes
- [ ] Optimistic UI updates where appropriate

---

## 6. Bug Documentation Template

When you find a bug, document it using this template:

```markdown
### Bug #[NUMBER]

**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- Device: [Desktop/Tablet/Mobile]
- Screen Size: [Resolution]
- OS: [Windows/Mac/iOS/Android]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Videos**:
[Attach if applicable]

**Console Errors**:
[Copy any console errors]

**Additional Notes**:
[Any other relevant information]
```

---

## 7. Testing Sign-Off Checklist

Before marking testing complete, ensure:

- [ ] All device tests completed
- [ ] All browser tests completed
- [ ] All user flows tested
- [ ] All accessibility audits passed
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] Medium/low bugs documented for future
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Stakeholders notified of any known issues

---

## 8. Known Issues & Limitations

Document any known issues that won't be fixed immediately:

| Issue | Severity | Browser/Device | Workaround | Planned Fix |
|-------|----------|----------------|------------|-------------|
| [Example] | Low | Safari iOS | [Workaround] | v2.1 |

---

## Testing Notes

Use this section to add notes during testing:

**Date**: [Date]
**Tester**: [Name]
**Session**: [Morning/Afternoon]

### Observations:
- [Note 1]
- [Note 2]

### Issues Found:
- [Issue 1]
- [Issue 2]

### Recommendations:
- [Recommendation 1]
- [Recommendation 2]
