# Manual Testing Instructions - Task 14.4

## Overview

This document provides step-by-step instructions for completing Task 14.4: Manual Testing of the unified dashboard and dark mode implementation.

---

## What Has Been Prepared

I've created comprehensive testing documentation to guide your manual testing process:

1. **MANUAL_TESTING_GUIDE.md** - Detailed testing procedures and checklists
2. **TESTING_CHECKLIST.md** - Quick reference checklist for testing sessions
3. **TESTING_REPORT.md** - Template for documenting test results
4. **BUGS_AND_ISSUES.md** - Bug tracking document
5. **ACCESSIBILITY_AUDIT.md** - Comprehensive accessibility audit checklist

---

## How to Perform Manual Testing

### Step 1: Setup Your Testing Environment

1. **Install Required Browsers**:
   - Chrome (latest version)
   - Firefox (latest version)
   - Safari (latest version - macOS/iOS)
   - Edge (latest version)

2. **Install Accessibility Tools**:
   - Chrome Lighthouse (built into Chrome DevTools)
   - [axe DevTools](https://www.deque.com/axe/devtools/) browser extension
   - [WAVE](https://wave.webaim.org/extension/) browser extension
   - Screen reader: NVDA (Windows) or VoiceOver (macOS/iOS)

3. **Prepare Test Data**:
   - Create at least 3 test projects with different budget levels
   - Add sample financial data (income and expenses)
   - Generate some notifications

4. **Build the Application**:
   ```bash
   npm run build
   npm run preview
   ```
   Or for development testing:
   ```bash
   npm run dev
   ```

### Step 2: Device Testing

#### Desktop Testing
1. Open the application in each browser at 1920x1080 resolution
2. Follow the Desktop Testing checklist in MANUAL_TESTING_GUIDE.md
3. Test at 1366x768 resolution as well
4. Document any issues in BUGS_AND_ISSUES.md

#### Tablet Testing
1. Use browser DevTools device emulation:
   - Chrome: F12 → Toggle device toolbar (Ctrl+Shift+M)
   - Set to iPad (768x1024) portrait and landscape
2. Follow the Tablet Testing checklist
3. If possible, test on actual tablet device
4. Document any issues

#### Mobile Testing
1. Use browser DevTools device emulation:
   - iPhone SE (375x667)
   - iPhone 11 Pro (414x896)
2. Follow the Mobile Testing checklist
3. Test on actual mobile devices if available
4. Document any issues

### Step 3: Browser Testing

For each browser (Chrome, Firefox, Safari, Edge):

1. **Functional Testing**:
   - Load the dashboard
   - Test all features (theme switching, modals, filters, export, etc.)
   - Check for console errors (F12 → Console tab)
   - Verify localStorage persistence

2. **Visual Testing**:
   - Verify layout renders correctly
   - Check that colors and fonts are consistent
   - Test both light and dark themes
   - Verify animations are smooth

3. **Performance Testing** (Chrome):
   - Open DevTools (F12)
   - Go to Lighthouse tab
   - Run audit for Performance, Accessibility, Best Practices, SEO
   - Document scores in TESTING_REPORT.md

### Step 4: User Flow Testing

Test each of the 10 critical user flows documented in MANUAL_TESTING_GUIDE.md:

1. First-Time User Experience
2. Theme Customization
3. Dashboard Configuration
4. Financial Data Entry
5. Data Filtering
6. Data Export
7. Notification Management
8. Error Handling
9. Auto-Refresh
10. Visit Scheduling

For each flow:
- Follow the step-by-step instructions
- Mark each step as complete in TESTING_REPORT.md
- Document any issues or unexpected behavior
- Take screenshots of any problems

### Step 5: Accessibility Testing

#### Keyboard Navigation Testing
1. Use only your keyboard (no mouse)
2. Press Tab to move through interactive elements
3. Verify:
   - Tab order is logical
   - Focus indicators are visible
   - Enter/Space activate buttons
   - ESC closes modals
   - No keyboard traps
4. Document any issues

#### Screen Reader Testing

**Windows (NVDA)**:
1. Download and install [NVDA](https://www.nvaccess.org/download/)
2. Start NVDA (Ctrl+Alt+N)
3. Navigate the dashboard using:
   - Tab: Move through interactive elements
   - H: Jump between headings
   - B: Jump between buttons
   - F: Jump between form fields
4. Verify all content is announced clearly
5. Document any issues

**macOS (VoiceOver)**:
1. Enable VoiceOver (Cmd+F5)
2. Navigate using VoiceOver commands
3. Verify all content is accessible
4. Document any issues

#### Color Contrast Testing
1. Open Chrome DevTools (F12)
2. Select an element with text
3. In the Styles panel, click the color swatch
4. Check the contrast ratio shown
5. Verify it meets WCAG AA standards:
   - Normal text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - UI components: 3:1 minimum
6. Test both light and dark themes
7. Document any failures

#### Automated Accessibility Audits

**Lighthouse**:
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Click "Analyze page load"
5. Review results (target: >95 score)
6. Document issues in ACCESSIBILITY_AUDIT.md

**axe DevTools**:
1. Install the browser extension
2. Open DevTools and go to axe DevTools tab
3. Click "Scan ALL of my page"
4. Review issues by severity
5. Fix critical and serious issues
6. Document in ACCESSIBILITY_AUDIT.md

**WAVE**:
1. Install the browser extension
2. Click the WAVE icon in your browser toolbar
3. Review errors (red icons) and alerts (yellow icons)
4. Fix all errors
5. Document in ACCESSIBILITY_AUDIT.md

### Step 6: Performance Testing

#### Load Time Testing
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Reload the page (Ctrl+Shift+R)
5. Check the load time at the bottom
6. Verify:
   - Initial page load < 3 seconds
   - Dashboard data loads < 2 seconds
7. Document results in TESTING_REPORT.md

#### Runtime Performance
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with the dashboard (scroll, click, switch themes)
5. Stop recording
6. Analyze the flame chart for:
   - Frame rate (should be 60fps)
   - Long tasks (should be minimal)
   - Layout shifts (should be minimal)
7. Document any performance issues

#### Memory Leak Testing
1. Open Chrome DevTools (F12)
2. Go to Memory tab
3. Take a heap snapshot
4. Use the application for 5-10 minutes
5. Take another heap snapshot
6. Compare the two snapshots
7. Look for growing memory usage
8. Document any memory leaks

### Step 7: Document Findings

As you test, document everything:

1. **For Each Test**:
   - Mark as complete in TESTING_REPORT.md
   - Note pass/fail status
   - Add any observations

2. **For Each Bug**:
   - Create an entry in BUGS_AND_ISSUES.md
   - Include: severity, browser/device, steps to reproduce
   - Add screenshots if helpful
   - Copy any console errors

3. **For Accessibility Issues**:
   - Document in ACCESSIBILITY_AUDIT.md
   - Note the WCAG criterion violated
   - Describe the issue and impact
   - Suggest a fix

### Step 8: Fix Critical Issues

1. Review all documented bugs
2. Prioritize critical and high-priority issues
3. Fix the issues in the code
4. Re-test to verify fixes
5. Update bug status to "Fixed"

### Step 9: Generate Final Report

1. Complete all sections of TESTING_REPORT.md
2. Calculate pass rates and coverage
3. Summarize findings
4. Make recommendations
5. Sign off on the testing

---

## Quick Testing Session (If Time is Limited)

If you need to do a quick validation, follow TESTING_CHECKLIST.md:

1. **Quick Smoke Test** (5 minutes)
   - Dashboard loads
   - Theme switching works
   - No console errors

2. **Device Quick Check** (15 minutes)
   - Desktop: All features work
   - Mobile: Responsive layout works

3. **Browser Quick Check** (10 minutes)
   - Chrome and one other browser

4. **Critical Flows** (20 minutes)
   - Theme switching
   - Add income/expense
   - Filter data

5. **Accessibility Quick Check** (10 minutes)
   - Run Lighthouse
   - Test keyboard navigation
   - Check color contrast

**Total Time**: ~60 minutes

---

## Testing Tools Quick Reference

### Browser DevTools
- **Open DevTools**: F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Device Emulation**: Ctrl+Shift+M (Cmd+Shift+M on Mac)
- **Console**: Ctrl+Shift+J (Cmd+Option+J on Mac)

### Lighthouse
- Open Chrome DevTools → Lighthouse tab → Generate report

### axe DevTools
- Install extension → Open DevTools → axe DevTools tab → Scan

### WAVE
- Install extension → Click WAVE icon in toolbar

### Screen Readers
- **NVDA (Windows)**: Ctrl+Alt+N to start
- **VoiceOver (Mac)**: Cmd+F5 to toggle

---

## What to Look For

### Common Issues to Watch For

**Layout Issues**:
- Horizontal scrolling on mobile
- Overlapping elements
- Cut-off content
- Misaligned components

**Theme Issues**:
- Flash of unstyled content
- Inconsistent colors
- Poor contrast
- Slow transitions

**Functionality Issues**:
- Buttons not working
- Forms not submitting
- Data not loading
- Modals not opening/closing

**Accessibility Issues**:
- Missing focus indicators
- Poor color contrast
- Missing ARIA labels
- Keyboard traps
- Unclear error messages

**Performance Issues**:
- Slow page load
- Laggy animations
- Memory leaks
- Excessive network requests

---

## Success Criteria

Testing is complete when:

- [ ] All device tests completed (6 devices)
- [ ] All browser tests completed (4 browsers)
- [ ] All user flows tested (10 flows)
- [ ] All accessibility audits passed
- [ ] Lighthouse scores meet targets:
  - Performance: >90
  - Accessibility: >95
  - Best Practices: >90
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] Testing report completed
- [ ] Sign-off obtained

---

## Need Help?

If you encounter issues or have questions:

1. Check the detailed procedures in MANUAL_TESTING_GUIDE.md
2. Review the bug template in BUGS_AND_ISSUES.md
3. Consult the accessibility checklist in ACCESSIBILITY_AUDIT.md
4. Document unclear issues for team discussion

---

## Next Steps After Testing

Once manual testing is complete:

1. Review and fix all critical/high bugs
2. Re-test fixed issues
3. Update TESTING_REPORT.md with final results
4. Get sign-off from stakeholders
5. Proceed to Phase 15: Deployment

---

## Estimated Time

**Full Testing**: 4-6 hours
**Quick Testing**: 1 hour
**Accessibility Audit**: 1-2 hours
**Bug Fixing**: Variable (depends on issues found)

**Total**: 6-10 hours for comprehensive testing

---

## Notes

- Testing can be done in multiple sessions
- Prioritize critical flows and accessibility
- Document everything as you go
- Don't skip browser testing - issues vary by browser
- Real device testing is ideal but emulation is acceptable
- Take breaks to maintain focus and attention to detail

Good luck with your testing! 🚀
