# Quick Testing Checklist

## Overview
This is a condensed checklist for quick manual testing sessions. For detailed testing procedures, see MANUAL_TESTING_GUIDE.md.

---

## Pre-Testing Setup

- [ ] Install required browsers (Chrome, Firefox, Safari, Edge)
- [ ] Install accessibility tools (Lighthouse, axe DevTools, WAVE)
- [ ] Prepare test data (projects, financial data, notifications)
- [ ] Clear browser cache and localStorage
- [ ] Set up device emulation for mobile/tablet testing

---

## Quick Smoke Test (5 minutes)

### Core Functionality
- [ ] Dashboard loads without errors
- [ ] Stats cards display data
- [ ] Charts render correctly
- [ ] Dark mode toggle works
- [ ] Theme persists after reload
- [ ] No console errors

---

## Device Testing (30 minutes)

### Desktop (1920x1080)
- [ ] Layout correct
- [ ] All features work
- [ ] Theme switching smooth
- [ ] Modals work

### Tablet (768x1024)
- [ ] Responsive layout
- [ ] Touch interactions work
- [ ] All features accessible

### Mobile (375x667)
- [ ] Single column layout
- [ ] Touch targets adequate
- [ ] No horizontal scroll
- [ ] Forms usable

---

## Browser Testing (20 minutes)

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

---

## Critical User Flows (30 minutes)

1. [ ] Theme switching and persistence
2. [ ] Add income/expense
3. [ ] Filter data by date range
4. [ ] Export data
5. [ ] Configure dashboard settings
6. [ ] Manage notifications
7. [ ] Schedule visit
8. [ ] Auto-refresh functionality

---

## Accessibility Quick Check (20 minutes)

### Keyboard Navigation
- [ ] Tab through all elements
- [ ] Focus indicators visible
- [ ] ESC closes modals
- [ ] No keyboard traps

### Color Contrast
- [ ] Run Lighthouse audit
- [ ] Check score > 95
- [ ] Verify contrast in both themes

### Screen Reader
- [ ] Test with NVDA/VoiceOver
- [ ] All buttons labeled
- [ ] Form fields labeled
- [ ] Errors announced

### Tools
- [ ] Run Lighthouse (score > 90)
- [ ] Run axe DevTools (0 critical issues)
- [ ] Run WAVE (0 errors)

---

## Performance Quick Check (10 minutes)

- [ ] Page load < 3 seconds
- [ ] Lighthouse Performance > 90
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations (60fps)

---

## Bug Documentation

If you find bugs:
1. Document in BUGS_AND_ISSUES.md
2. Include: severity, browser, device, steps to reproduce
3. Add screenshots if applicable
4. Note console errors

---

## Sign-Off

**Tester**: ___________________
**Date**: ___________________
**Duration**: ___________________
**Issues Found**: ___________________
**Status**: ☐ Pass ☐ Fail ☐ Pass with Issues

**Notes**:
