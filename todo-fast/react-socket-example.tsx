// // React/Next.js Socket.IO Integration Example
// // Install: npm install socket.io-client

// import { useEffect, useState, useCallback } from 'react';
// import { io, Socket } from 'socket.io-client';

// // Types for notifications
// interface TaskNotification {
//   type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED';
//   taskId: string;
//   taskTitle: string;
//   message: string;
//   assignedTo?: string;
//   assignedBy?: string;
//   timestamp: string;
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'USER' | 'MANAGER' | 'ADMIN';
// }

// // Custom hook for Socket.IO notifications
// export const useSocketNotifications = (user: User | null) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [notifications, setNotifications] = useState<TaskNotification[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   const connectSocket = useCallback(() => {
//     if (!user) return;

//     const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
//       withCredentials: true,
//       transports: ['websocket', 'polling'],
//     });

//     newSocket.on('connect', () => {
//       console.log('Connected to notifications:', newSocket.id);
//       setIsConnected(true);
//       setConnectionError(null);
      
//       // Join user-specific notification room
//       newSocket.emit('join', {
//         userId: user.id,
//         user: user,
//       });
//     });

//     newSocket.on('disconnect', () => {
//       console.log('Disconnected from notifications');
//       setIsConnected(false);
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//       setConnectionError(error.message);
//       setIsConnected(false);
//     });

//     newSocket.on('joined', (data) => {
//       console.log('Successfully joined notifications:', data);
//     });

//     newSocket.on('taskNotification', (notification: TaskNotification) => {
//       console.log('Received notification:', notification);
//       setNotifications(prev => [notification, ...prev]);
      
//       // Show browser notification if permission granted
//       if (Notification.permission === 'granted') {
//         new Notification(`Task ${notification.type.replace('_', ' ')}`, {
//           body: notification.message,
//           icon: '/favicon.ico',
//         });
//       }
//     });

//     setSocket(newSocket);
//   }, [user]);

//   const disconnectSocket = useCallback(() => {
//     if (socket && user) {
//       socket.emit('leave', { userId: user.id });
//       socket.disconnect();
//       setSocket(null);
//       setIsConnected(false);
//     }
//   }, [socket, user]);

//   const clearNotifications = useCallback(() => {
//     setNotifications([]);
//   }, []);

//   const markAsRead = useCallback((notificationIndex: number) => {
//     setNotifications(prev => prev.filter((_, index) => index !== notificationIndex));
//   }, []);

//   // Auto-connect when user is available
//   useEffect(() => {
//     if (user) {
//       connectSocket();
//     }

//     return () => {
//       disconnectSocket();
//     };
//   }, [user, connectSocket, disconnectSocket]);

//   // Request notification permission
//   useEffect(() => {
//     if (typeof window !== 'undefined' && 'Notification' in window) {
//       if (Notification.permission === 'default') {
//         Notification.requestPermission();
//       }
//     }
//   }, []);

//   return {
//     socket,
//     notifications,
//     isConnected,
//     connectionError,
//     connectSocket,
//     disconnectSocket,
//     clearNotifications,
//     markAsRead,
//   };
// };

// // Notification Component
// interface NotificationItemProps {
//   notification: TaskNotification;
//   onMarkAsRead: () => void;
// }

// const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
//   const getNotificationIcon = (type: string) => {
//     const icons = {
//       'TASK_ASSIGNED': '📋',
//       'TASK_UPDATED': '✏️',
//       'TASK_COMPLETED': '✅',
//       'TASK_DELETED': '🗑️',
//     };
//     return icons[type as keyof typeof icons] || '📢';
//   };

//   const getNotificationColor = (type: string) => {
//     const colors = {
//       'TASK_ASSIGNED': 'bg-green-50 border-green-200',
//       'TASK_UPDATED': 'bg-orange-50 border-orange-200',
//       'TASK_COMPLETED': 'bg-blue-50 border-blue-200',
//       'TASK_DELETED': 'bg-red-50 border-red-200',
//     };
//     return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
//   };

//   return (
//     <div className={`p-4 border rounded-lg ${getNotificationColor(notification.type)} mb-2`}>
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center mb-2">
//             <span className="text-lg mr-2">{getNotificationIcon(notification.type)}</span>
//             <span className="font-semibold text-sm text-gray-600">
//               {notification.type.replace('_', ' ')}
//             </span>
//           </div>
//           <p className="text-gray-800 mb-2">{notification.message}</p>
//           <div className="text-xs text-gray-500">
//             <span>📋 {notification.taskTitle}</span>
//             <span className="ml-4">🕒 {new Date(notification.timestamp).toLocaleString()}</span>
//           </div>
//         </div>
//         <button
//           onClick={onMarkAsRead}
//           className="ml-4 text-gray-400 hover:text-gray-600 text-sm"
//           title="Mark as read"
//         >
//           ✕
//         </button>
//       </div>
//     </div>
//   );
// };

// // Main Notifications Panel Component
// interface NotificationsPanelProps {
//   user: User | null;
// }

// export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ user }) => {
//   const {
//     notifications,
//     isConnected,
//     connectionError,
//     clearNotifications,
//     markAsRead,
//   } = useSocketNotifications(user);

//   const [isOpen, setIsOpen] = useState(false);

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="relative">
//       {/* Notification Bell Icon */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
//       >
//         <span className="text-xl">🔔</span>
//         {notifications.length > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//             {notifications.length > 9 ? '9+' : notifications.length}
//           </span>
//         )}
//       </button>

//       {/* Notifications Dropdown */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Notifications</h3>
//               <div className="flex items-center space-x-2">
//                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                 <span className="text-xs text-gray-500">
//                   {isConnected ? 'Connected' : 'Disconnected'}
//                 </span>
//               </div>
//             </div>
//             {connectionError && (
//               <p className="text-red-500 text-sm mt-1">Error: {connectionError}</p>
//             )}
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="p-8 text-center text-gray-500">
//                 <span className="text-4xl mb-2 block">📭</span>
//                 <p>No notifications yet</p>
//               </div>
//             ) : (
//               <div className="p-2">
//                 {notifications.map((notification, index) => (
//                   <NotificationItem
//                     key={`${notification.taskId}-${notification.timestamp}-${index}`}
//                     notification={notification}
//                     onMarkAsRead={() => markAsRead(index)}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>

//           {notifications.length > 0 && (
//             <div className="p-4 border-t border-gray-200">
//               <button
//                 onClick={clearNotifications}
//                 className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
//               >
//                 Clear All Notifications
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Usage Example in a Layout or Header Component
// export const HeaderWithNotifications: React.FC = () => {
//   // This would come from your auth context/state
//   const [user, setUser] = useState<User | null>(null);

//   // Example: Get user from your auth system
//   useEffect(() => {
//     // Replace with your actual user fetching logic
//     const fetchUser = async () => {
//       try {
//         const response = await fetch('/api/auth/me', {
//           credentials: 'include',
//         });
//         if (response.ok) {
//           const userData = await response.json();
//           setUser(userData.user);
//         }
//       } catch (error) {
//         console.error('Failed to fetch user:', error);
//       }
//     };

//     fetchUser();
//   }, []);

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <h1 className="text-xl font-semibold text-gray-900">Task Management</h1>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             {user && (
//               <>
//                 <span className="text-sm text-gray-700">Welcome, {user.name}</span>
//                 <NotificationsPanel user={user} />
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default NotificationsPanel;
