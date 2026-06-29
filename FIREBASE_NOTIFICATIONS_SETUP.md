# Firebase Notifications Setup Guide

## 1. Firebase Console Setup

### Enable Cloud Messaging
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fooddeliveryapp-d17ef`
3. Navigate to **Project Settings** (gear icon)
4. Go to **Cloud Messaging** tab
5. Ensure Cloud Messaging API is enabled

### Get Server Key (for backend sending)
1. In Cloud Messaging tab, look for **Server Key** or **Service Account**
2. Copy the server key for sending notifications from your backend

### Configure iOS (APNs)
1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Under **iOS app configuration**, add your app:
   - Bundle ID: `com.fooddeliveryapp` (or your actual bundle ID)
   - APNs Key: Upload your Apple Push Notification service key
   - Team ID: Your Apple Developer Team ID
3. Upload your APNs authentication key (`.p8` file) from Apple Developer Portal

### Configure Android (FCM)
1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Under **Android app configuration**, add your app:
   - Package name: `com.fooddeliveryapp` (or your actual package name)
   - SHA-1 fingerprint: Get from your signing certificate
3. Download `google-services.json` and place in your project root

## 2. Firestore Security Rules

Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Notifications collection rules
    match /notifications/{notificationId} {
      // Users can read their own notifications
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // Users can create notifications for themselves
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
      
      // Users can update their own notifications (mark as read)
      allow update: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
      
      // Users can delete their own notifications
      allow delete: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
    }
    
    // Other existing rules...
  }
}
```

## 3. Sending Notifications

### Method 1: From Within Your App (Client-side)

Use the `saveNotificationToFirestore` function:

```typescript
import { saveNotificationToFirestore } from '@/services/notificationService';

// Send an order notification
await saveNotificationToFirestore(
  "Order Delivered",
  "Your order from Burger Palace has been delivered!",
  "order"
);

// Send a promotion notification
await saveNotificationToFirestore(
  "Special Offer",
  "Get 20% off on your next order. Use code: SAVE20",
  "promotion"
);

// Send a system notification
await saveNotificationToFirestore(
  "Account Update",
  "Your profile has been updated successfully.",
  "system"
);
```

### Method 2: From Firebase Console (Manual)

1. Go to Firebase Console > **Cloud Messaging**
2. Click **Send your first message**
3. Fill in:
   - **Notification title**: Your message title
   - **Notification text**: Your message body
4. Click **Send test message** and enter a device token
5. Or target by **User segment** (requires analytics integration)

### Method 3: From Backend Server (Production)

Using Firebase Admin SDK:

```javascript
// Node.js backend example
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send to a specific user
const sendNotification = async (userId, title, body) => {
  // Get user's FCM token from Firestore
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const fcmToken = userDoc.data().fcmToken;
  
  const message = {
    notification: {
      title: title,
      body: body
    },
    token: fcmToken
  };
  
  await admin.messaging().send(message);
  console.log('Notification sent successfully');
};

// Also save to Firestore for in-app display
await admin.firestore().collection('notifications').add({
  title,
  message: body,
  type: 'order',
  read: false,
  userId,
  time: new Date().toISOString(),
  createdAt: new Date()
});
```

## 4. Testing Notifications

### Test In-App Notifications
```typescript
// In any screen, test by calling:
import { saveNotificationToFirestore } from '@/services/notificationService';

await saveNotificationToFirestore(
  "Test Notification",
  "This is a test notification from the app",
  "system"
);
```

### Test Push Notifications
1. Run your app on a physical device (simulator may not receive push)
2. Grant notification permissions when prompted
3. Send a notification from Firebase Console
4. Check if notification appears in device notification center

### Check Notification Token
Add this to see your device's push token:

```typescript
import { requestNotificationPermissions } from '@/services/notificationService';

const token = await requestNotificationPermissions();
console.log('Device push token:', token);
```

## 5. Store User FCM Tokens

To send push notifications to specific users, store their FCM tokens:

```typescript
// In your auth flow or user profile screen
import { requestNotificationPermissions } from '@/services/notificationService';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const saveUserToken = async () => {
  const user = auth.currentUser;
  if (!user) return;
  
  const fcmToken = await requestNotificationPermissions();
  if (fcmToken) {
    await updateDoc(doc(db, 'users', user.uid), {
      fcmToken: fcmToken
    });
  }
};
```

## 6. Common Issues & Solutions

### Issue: Notifications not appearing
- **Solution**: Check if user is authenticated
- **Solution**: Verify Firestore security rules allow read access
- **Solution**: Check browser console for errors

### Issue: Push notifications not received
- **Solution**: Use physical device, not simulator
- **Solution**: Ensure notification permissions are granted
- **Solution**: Verify APNs/FCM configuration in Firebase Console
- **Solution**: Check device notification settings

### Issue: "Permission denied" in Firestore
- **Solution**: Update Firestore security rules as shown above
- **Solution**: Ensure user is authenticated before accessing notifications

## 7. Production Checklist

- [ ] Enable Cloud Messaging in Firebase Console
- [ ] Configure APNs for iOS
- [ ] Configure FCM for Android
- [ ] Set up Firestore security rules
- [ ] Store user FCM tokens in Firestore
- [ ] Implement backend notification service
- [ ] Test on physical devices
- [ ] Set up notification analytics (optional)
