import { auth, db } from '@/lib/firebase';
import * as Notifications from 'expo-notifications';
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'promotion' | 'system';
  read: boolean;
  userId: string;
}

// Request notification permissions and get FCM token
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }
  
  // Get FCM token from Firebase (only works in development build, not Expo Go)
  let fcmToken;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  // Note: FCM token requires native Firebase messaging which only works in development builds
  // For Expo Go, we only use local notifications
  console.log('FCM token not available in Expo Go (requires development build)');
  
  return fcmToken;
};

// Save notification to Firestore
export const saveNotificationToFirestore = async (
  title: string,
  message: string,
  type: 'order' | 'promotion' | 'system'
) => {
  try {
    if (!auth || !db) {
      console.log('Firebase not available (running in Expo Go)');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    const notificationData = {
      title,
      message,
      type,
      read: false,
      userId: user.uid,
      time: new Date().toISOString(),
      createdAt: new Date(),
    };
    
    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error saving notification to Firestore:', error);
  }
};

// Subscribe to user notifications from Firestore
export const subscribeToNotifications = (
  callback: (notifications: NotificationData[]) => void
) => {
  if (!auth || !db) {
    console.log('Firebase not available (running in Expo Go)');
    return () => {};
  }
  
  const user = auth.currentUser;
  if (!user) return () => {};
  
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications: NotificationData[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        message: data.message,
        time: formatTime(data.time),
        type: data.type,
        read: data.read,
        userId: data.userId,
      };
    });
    callback(notifications);
  }, (error) => {
    console.error('Error listening to notifications:', error);
  });
  
  return unsubscribe;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    if (!db) {
      console.log('Firebase not available (running in Expo Go)');
      return;
    }
    
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    if (!auth || !db) {
      console.log('Firebase not available (running in Expo Go)');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );
    
    const snapshot = await new Promise<any>((resolve) => {
      const unsubscribe = onSnapshot(q, (snap) => {
        unsubscribe();
        resolve(snap);
      });
    });
    
    const batch = snapshot.docs.map((docSnap: any) => 
      updateDoc(doc(db, 'notifications', docSnap.id), { read: true })
    );
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Format timestamp to relative time
const formatTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return time.toLocaleDateString();
};

// Schedule local notification
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Show immediately
  });
};
