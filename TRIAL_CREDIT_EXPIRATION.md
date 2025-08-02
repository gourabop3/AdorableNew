# Trial Credit Expiration System

## 🎯 Overview

This system handles the scenario when users run out of their free trial credits and need to upgrade to continue creating apps. It provides a seamless, professional experience that guides users through the upgrade process.

## 🚀 Key Features

### 1. **Automatic Credit Checking**
- Checks user credits before app creation
- Prevents app creation when credits are insufficient
- Seamless redirect to upgrade page

### 2. **Professional Upgrade Prompt**
- Modern, card-like design
- Clear credit status display
- Compelling upgrade benefits
- Multiple action options

### 3. **Seamless User Flow**
- Preserves original app creation intent
- Returns to app creation after upgrade
- Graceful error handling
- Mobile-responsive design

## 📁 Components

### `UpgradePrompt` (`src/components/upgrade-prompt.tsx`)
**Purpose**: Professional upgrade prompt component
**Features**:
- Current credit status display
- Missing credits calculation
- Pro plan benefits showcase
- Upgrade and navigation buttons
- Professional card-based design

**Props**:
```typescript
interface UpgradePromptProps {
  currentCredits: number;
  requiredCredits: number;
  onUpgrade: () => void;
  onGoHome: () => void;
  showHomeButton?: boolean;
}
```

### `UpgradePage` (`src/app/app/upgrade/page.tsx`)
**Purpose**: Handles upgrade flow logic
**Features**:
- Fetches user billing data
- Checks credit requirements
- Redirects to app creation if sufficient credits
- Shows upgrade prompt if insufficient credits

### `InsufficientCreditsError` (`src/actions/create-app-with-billing.ts`)
**Purpose**: Custom error for insufficient credits
**Features**:
- Contains current and required credit amounts
- Used for proper error handling
- Triggers upgrade flow

## 🔄 User Flow

### 1. **App Creation Attempt**
```
User clicks "Create App" → System checks credits
```

### 2. **Credit Check**
```
If credits >= 10: Proceed with app creation
If credits < 10: Redirect to upgrade page
```

### 3. **Upgrade Page**
```
Show professional upgrade prompt → User chooses action
```

### 4. **User Actions**
```
Upgrade: Redirect to billing page
Go Home: Return to homepage
```

### 5. **Post-Upgrade**
```
After payment: Return to original app creation
```

## 🎨 Design Features

### Visual Design
- **Gradient Backgrounds**: Purple to pink for premium feel
- **Card Layout**: Professional card-based design
- **Status Indicators**: Clear credit status display
- **Action Buttons**: Prominent upgrade and navigation options

### Color Scheme
- **Primary**: Purple to pink gradients
- **Status**: Red for insufficient credits
- **Success**: Green for positive actions
- **Info**: Blue for informational sections

### Typography
- **Headers**: Bold, large text for hierarchy
- **Body**: Clean, readable fonts
- **Status**: Clear credit numbers and labels

## 🔧 Technical Implementation

### Credit Checking Logic
```typescript
// Check credits before app creation
const creditCheck = await checkCredits(user.userId, 10);
if (!creditCheck.success) {
  throw new InsufficientCreditsError(creditCheck.currentCredits, 10);
}
```

### Error Handling
```typescript
// Handle insufficient credits error
if (error instanceof InsufficientCreditsError) {
  redirect(`/app/upgrade?${upgradeParams.toString()}`);
}
```

### URL Parameter Preservation
```typescript
// Preserve original app creation parameters
const upgradeParams = new URLSearchParams();
if (message) upgradeParams.set('message', message);
if (template) upgradeParams.set('template', template);
```

## 📱 Mobile Experience

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets
- **Readable Text**: Appropriate font sizes
- **Fast Loading**: Optimized performance

### Mobile-Specific Features
- **Compact Layout**: Optimized for small screens
- **Simplified Navigation**: Streamlined mobile menu
- **Touch Gestures**: Swipe-friendly interactions

## 🛠️ Configuration

### Credit Requirements
- **App Creation**: 10 credits per app
- **Free Trial**: 50 credits for new users
- **Pro Plan**: 100 credits per month

### Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

## 🧪 Testing

### Component Testing
Run the test script to verify all components:
```bash
node test-upgrade-flow.js
```

### Manual Testing
1. **Credit Check**: Verify credit checking works
2. **Upgrade Flow**: Test complete upgrade process
3. **Navigation**: Test all navigation options
4. **Mobile**: Test on mobile devices
5. **Error Handling**: Test error scenarios

## 📊 Monitoring

### Key Metrics
- **Upgrade Conversion Rate**: Users who upgrade after seeing prompt
- **Credit Usage**: How quickly users consume credits
- **Bounce Rate**: Users who leave without upgrading
- **Mobile Usage**: Mobile vs desktop upgrade rates

### Analytics Events
- `credit_check_failed`: When user lacks credits
- `upgrade_prompt_shown`: When upgrade page is displayed
- `upgrade_button_clicked`: When user clicks upgrade
- `upgrade_completed`: When upgrade is successful

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Test credit checking logic
- [ ] Verify upgrade page routing
- [ ] Test payment integration
- [ ] Check mobile responsiveness
- [ ] Verify error handling

### Post-Deployment
- [ ] Monitor upgrade conversion rates
- [ ] Track user feedback
- [ ] Monitor error rates
- [ ] Test with real users
- [ ] Optimize based on data

## 🔮 Future Enhancements

### Planned Features
- **Credit Usage Analytics**: Track how users consume credits
- **Personalized Offers**: Custom upgrade offers based on usage
- **Usage Alerts**: Notify users when credits are low
- **Trial Extensions**: Offer trial extensions for active users
- **Usage History**: Show detailed credit usage history

### Technical Improvements
- **Caching**: Cache user credit data
- **Real-time Updates**: Live credit balance updates
- **A/B Testing**: Test different upgrade prompts
- **Analytics**: Enhanced conversion tracking

## 🎯 Success Metrics

### User Experience
- **Reduced Friction**: Smooth upgrade flow
- **Clear Communication**: Users understand why upgrade is needed
- **High Conversion**: Good upgrade conversion rates
- **Positive Feedback**: Users satisfied with experience

### Business Metrics
- **Conversion Rate**: Percentage of users who upgrade
- **Revenue Impact**: Increased revenue from upgrades
- **User Retention**: Users stay after upgrade
- **Support Reduction**: Fewer support tickets

## 📞 Support

### Common Issues
1. **Credits Not Updating**: Check webhook processing
2. **Upgrade Page Not Loading**: Verify routing configuration
3. **Payment Failures**: Check Stripe integration
4. **Mobile Issues**: Test responsive design

### Debugging
- **Credit Logs**: Check credit deduction logs
- **Error Logs**: Monitor error rates
- **User Feedback**: Collect user reports
- **Analytics**: Track user behavior

## 🔒 Security

### Data Protection
- **Secure API Calls**: All billing API calls are secure
- **User Privacy**: No sensitive data exposed
- **Payment Security**: Stripe handles payment security
- **Error Handling**: No sensitive data in error messages

### Access Control
- **Authentication Required**: Users must be logged in
- **Credit Validation**: Server-side credit checking
- **Payment Verification**: Webhook signature verification
- **Rate Limiting**: Prevent abuse

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✅