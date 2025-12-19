# ProcrastinAct Deployment Guide

## App Store Deployment Checklist

### Pre-Deployment Requirements

#### Assets Required

- [ ] App Icon (1024x1024 for iOS, 512x512 for Android)
- [ ] Splash screen image (1284x2778 for iOS, adaptive for Android)
- [ ] Adaptive icon foreground (Android, 432x432)
- [ ] Notification icon (Android, 96x96, white with transparency)
- [ ] App Store screenshots (various sizes)
- [ ] Feature graphic (Android, 1024x500)

#### Metadata Required

- [ ] App name: ProcrastinAct
- [ ] Short description (80 chars): "ADHD-friendly task management. Small steps lead to big wins."
- [ ] Full description (4000 chars)
- [ ] Keywords/Tags
- [ ] Category: Productivity
- [ ] Content rating: Everyone
- [ ] Privacy policy URL
- [ ] Support email

### iOS App Store Submission

1. **Build Configuration**

   ```bash
   cd apps/mobile
   eas build --platform ios --profile production
   ```

2. **App Store Connect Setup**
   - Create app in App Store Connect
   - Fill in all required metadata
   - Upload screenshots for all device sizes
   - Set pricing and availability
   - Configure in-app purchases (if any)

3. **Required Screenshots**
   - iPhone 6.7" (1290x2796)
   - iPhone 6.5" (1284x2778)
   - iPhone 5.5" (1242x2208)
   - iPad Pro 12.9" (2048x2732)

4. **Privacy Declarations**
   - Analytics: No
   - Advertising: No
   - User tracking: No
   - Data collection: Local only
   - Third-party data sharing: None

### Android Play Store Submission

1. **Build Configuration**

   ```bash
   cd apps/mobile
   eas build --platform android --profile production
   ```

2. **Play Console Setup**
   - Create app in Play Console
   - Complete store listing
   - Upload screenshots and graphics
   - Set content rating
   - Configure pricing

3. **Required Graphics**
   - Phone screenshots (min 2, max 8)
   - 7-inch tablet screenshots
   - 10-inch tablet screenshots
   - Feature graphic (1024x500)
   - App icon (512x512)

4. **Data Safety Form**
   - Data collection: Minimal (local storage only)
   - Data sharing: None
   - Data encryption: Yes (secure store)
   - Data deletion: User can delete all data

### Environment Configuration

#### Production Secrets

```env
# .env.production
EXPO_PUBLIC_APP_VARIANT=production
EXPO_PUBLIC_API_URL=https://api.procrastinact.app
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### EAS Build Profiles

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-asc-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Testing Before Submission

#### Functionality Tests

- [ ] App launches without crash
- [ ] All screens load correctly
- [ ] Task creation/completion works
- [ ] Timer functions properly
- [ ] Notifications work (iOS and Android)
- [ ] Settings persist after restart
- [ ] Achievements unlock correctly
- [ ] Progress visualization shows data
- [ ] Export/backup works
- [ ] Dark mode works correctly

#### Performance Tests

- [ ] App size under 100MB
- [ ] Startup time under 3 seconds
- [ ] No memory leaks
- [ ] Smooth animations (60fps)
- [ ] Works offline

#### Accessibility Tests

- [ ] VoiceOver/TalkBack works
- [ ] Touch targets ≥ 44pt
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion respected
- [ ] Dynamic text scaling works

### Post-Submission

1. **Monitor Review Status**
   - Check App Store Connect / Play Console daily
   - Respond to review feedback quickly

2. **Address Rejections**
   - Common iOS issues: Privacy policy, metadata accuracy
   - Common Android issues: Content rating, permissions

3. **After Approval**
   - Schedule release date
   - Prepare marketing materials
   - Monitor crash reports
   - Gather initial feedback

### Update Process

1. Increment version in `app.json`
2. Update changelog
3. Build and test
4. Submit for review
5. Stage release

### Support Resources

- **Bug Reports**: GitHub Issues
- **User Support**: support@procrastinact.app
- **Privacy Policy**: https://procrastinact.app/privacy
- **Terms of Service**: https://procrastinact.app/terms

---

## App Description (for stores)

### Short Description

ADHD-friendly task management. Small steps lead to big wins.

### Full Description

ProcrastinAct is a task management app designed specifically for people with ADHD and anyone who struggles with procrastination. Unlike other apps that make you feel guilty, ProcrastinAct celebrates every small win.

**Key Features:**

✓ SHRINK YOUR TASKS
Break overwhelming tasks into smaller, manageable pieces. When a task feels too big, shrink it until it feels doable.

✓ FOCUS TIMER
Customizable Pomodoro-style timer with gentle reminders. No guilt, just encouragement to try again.

✓ GENTLE ENCOURAGEMENT
AI-powered motivational messages that understand your struggles and celebrate your progress.

✓ ACHIEVEMENT SYSTEM
Unlock achievements for healthy productivity habits, not just for working hard. Self-care badges included!

✓ PROGRESS INSIGHTS
See your patterns and wins with beautiful visualizations. Always positive, never judgmental.

✓ PRIVACY FIRST
Your data stays on your device. No tracking, no ads, no selling your information.

**Built for ADHD:**

- Large touch targets for motor control differences
- High contrast mode available
- Reduced motion option
- Flexible, not rigid scheduling
- Stop buttons that don't shame you

ProcrastinAct helps you get things done without the guilt trip. Start small, celebrate often.

---

_Created by someone who understands the ADHD struggle._
