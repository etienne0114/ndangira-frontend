import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  VStack,
  useToast
} from "@chakra-ui/react";
import { BellIcon, CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import type { Notification } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const notificationIcons: Record<string, string> = {
  SELLER_APPROVED: "🎉",
  SELLER_REJECTED: "📋",
  LISTING_CREATED: "✓",
  LISTING_LOW_STOCK: "⚠️",
  NEW_SELLER_APPLICATION: "👤",
  SYSTEM_ANNOUNCEMENT: "📢"
};

const notificationColors: Record<string, string> = {
  SELLER_APPROVED: "green",
  SELLER_REJECTED: "orange",
  LISTING_CREATED: "blue",
  LISTING_LOW_STOCK: "orange",
  NEW_SELLER_APPLICATION: "purple",
  SYSTEM_ANNOUNCEMENT: "brand"
};

export function NotificationIcon() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function fetchNotifications() {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch notifications");
      
      const data = await res.json();
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }

  async function fetchUnreadCount() {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch unread count");
      
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }

  async function markAsRead(notificationId: string) {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to mark as read");
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        status: "error",
        duration: 3000
      });
    }
  }

  async function markAllAsRead() {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to mark all as read");
      
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
        status: "success",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        status: "error",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotification(notificationId: string) {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to delete notification");
      
      const wasUnread = notifications.find((n) => n.id === notificationId)?.read === false;
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
      toast({
        title: "Deleted",
        description: "Notification removed",
        status: "info",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        status: "error",
        duration: 3000
      });
    }
  }

  useEffect(() => {
    if (user && token) {
      void fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        void fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, token]);

  useEffect(() => {
    if (isOpen && token) {
      void fetchNotifications();
    }
  }, [isOpen, token]);

  if (!user) return null;

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <Menu onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
      <MenuButton
        as={IconButton}
        icon={<BellIcon />}
        variant="ghost"
        position="relative"
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="red"
            borderRadius="full"
            fontSize="xs"
            minW="18px"
            h="18px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </MenuButton>
      
      <MenuList maxW="400px" maxH="600px" overflowY="auto" p={0}>
        <Box p={4} borderBottom="1px solid" borderColor="gray.100">
          <HStack justify="space-between">
            <Text fontWeight="800" fontSize="lg">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={markAllAsRead}
                isLoading={loading}
                leftIcon={<CheckIcon />}
              >
                Mark all read
              </Button>
            )}
          </HStack>
        </Box>

        {notifications.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500" fontSize="sm">
              No notifications yet
            </Text>
          </Box>
        ) : (
          <VStack spacing={0} align="stretch">
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <HStack
                  p={4}
                  spacing={3}
                  align="start"
                  bg={notification.read ? "white" : "blue.50"}
                  _hover={{ bg: notification.read ? "gray.50" : "blue.100" }}
                  cursor="pointer"
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <Box
                    fontSize="2xl"
                    flexShrink={0}
                    w="40px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg={`${notificationColors[notification.type]}.100`}
                    borderRadius="full"
                  >
                    {notificationIcons[notification.type] || "📬"}
                  </Box>
                  
                  <VStack align="start" spacing={1} flex="1" minW="0">
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="700" fontSize="sm" noOfLines={1}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <Box
                          w="8px"
                          h="8px"
                          bg="blue.500"
                          borderRadius="full"
                          flexShrink={0}
                        />
                      )}
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {notification.message}
                    </Text>
                    
                    <HStack justify="space-between" w="100%" mt={1}>
                      <Text fontSize="xs" color="gray.500">
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                      
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Delete notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteNotification(notification.id);
                        }}
                      />
                    </HStack>
                  </VStack>
                </HStack>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </VStack>
        )}
      </MenuList>
    </Menu>
  );
}
