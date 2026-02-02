import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  useToast,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBell, FiMail, FiMessageSquare } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: typeof FiMail;
  enabled: boolean;
}

export function SettingsPage() {
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'email_updates',
      label: 'Email Updates',
      description: 'Receive email notifications for important updates',
      icon: FiMail,
      enabled: true,
    },
    {
      id: 'new_documents',
      label: 'New Documents',
      description: 'Get notified when new policy documents are added',
      icon: FiMessageSquare,
      enabled: true,
    },
    {
      id: 'chat_responses',
      label: 'Chat Responses',
      description: 'Notifications for AI assistant responses',
      icon: FiBell,
      enabled: false,
    },
  ]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileUpdating(true);
    try {
      await authService.updateProfile({ full_name: data.fullName });
      await refreshUser();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Failed to update profile. Please try again.';
      toast({
        title: 'Update failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProfileUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordUpdating(true);
    try {
      await authService.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      passwordForm.reset();
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Failed to change password. Please verify your current password.';
      toast({
        title: 'Password change failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
    toast({
      title: 'Notification settings updated',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <PageWrapper>
      <Box p={8}>
        {/* Page Header */}
        <Box
          as={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          mb={8}
        >
          <Heading
            size="xl"
            bgGradient="linear(to-r, purple.600, pink.600)"
            bgClip="text"
          >
            Settings
          </Heading>
          <Text color="gray.600" mt={2}>
            Manage your account settings and preferences
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Profile Section */}
          <GlassCard>
            <VStack align="stretch" spacing={6}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  bg="purple.100"
                  borderRadius="xl"
                >
                  <Icon as={FiUser} boxSize={5} color="purple.600" />
                </Box>
                <Box>
                  <Heading size="md">Profile Information</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Update your personal details
                  </Text>
                </Box>
              </HStack>

              <Divider />

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <VStack spacing={5}>
                  <Box w="full">
                    <FormLabel fontSize="sm" color="gray.600">
                      Email Address
                    </FormLabel>
                    <Box
                      p={3}
                      bg="gray.50"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                    >
                      <Text color="gray.600">{user?.email}</Text>
                    </Box>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Email cannot be changed
                    </Text>
                  </Box>

                  <AnimatedInput
                    label="Full Name"
                    type="text"
                    placeholder="Your full name"
                    error={profileForm.formState.errors.fullName?.message}
                    {...profileForm.register('fullName')}
                  />

                  <Box w="full">
                    <FormLabel fontSize="sm" color="gray.600">
                      Role
                    </FormLabel>
                    <Badge
                      colorScheme={
                        user?.role === 'admin'
                          ? 'purple'
                          : user?.role === 'manager'
                          ? 'blue'
                          : 'gray'
                      }
                      px={3}
                      py={1}
                      borderRadius="full"
                      textTransform="capitalize"
                    >
                      {user?.role}
                    </Badge>
                  </Box>

                  <GradientButton
                    type="submit"
                    w="full"
                    isLoading={isProfileUpdating}
                    loadingText="Updating..."
                  >
                    Save Changes
                  </GradientButton>
                </VStack>
              </form>
            </VStack>
          </GlassCard>

          {/* Password Section */}
          <GlassCard>
            <VStack align="stretch" spacing={6}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  bg="pink.100"
                  borderRadius="xl"
                >
                  <Icon as={FiLock} boxSize={5} color="pink.600" />
                </Box>
                <Box>
                  <Heading size="md">Change Password</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Update your account password
                  </Text>
                </Box>
              </HStack>

              <Divider />

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <VStack spacing={5}>
                  <AnimatedInput
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                  />

                  <AnimatedInput
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                  />

                  <AnimatedInput
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                    error={passwordForm.formState.errors.confirmNewPassword?.message}
                    {...passwordForm.register('confirmNewPassword')}
                  />

                  <GradientButton
                    type="submit"
                    w="full"
                    variant="secondary"
                    isLoading={isPasswordUpdating}
                    loadingText="Changing password..."
                  >
                    Change Password
                  </GradientButton>
                </VStack>
              </form>
            </VStack>
          </GlassCard>

          {/* Notification Preferences */}
          <GlassCard gridColumn={{ lg: 'span 2' }}>
            <VStack align="stretch" spacing={6}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  bg="blue.100"
                  borderRadius="xl"
                >
                  <Icon as={FiBell} boxSize={5} color="blue.600" />
                </Box>
                <Box>
                  <Heading size="md">Notification Preferences</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Manage how you receive notifications
                  </Text>
                </Box>
                <Badge colorScheme="yellow" ml="auto">
                  Coming Soon
                </Badge>
              </HStack>

              <Divider />

              <VStack spacing={4} align="stretch">
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    as={motion.div}
                    whileHover={{ x: 5 }}
                    p={4}
                    bg="gray.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <FormControl display="flex" alignItems="center">
                      <HStack flex={1} spacing={3}>
                        <Icon
                          as={notification.icon}
                          boxSize={5}
                          color="gray.500"
                        />
                        <Box>
                          <FormLabel mb={0} fontWeight="medium">
                            {notification.label}
                          </FormLabel>
                          <Text fontSize="sm" color="gray.500">
                            {notification.description}
                          </Text>
                        </Box>
                      </HStack>
                      <Switch
                        colorScheme="purple"
                        isChecked={notification.enabled}
                        onChange={() => toggleNotification(notification.id)}
                        isDisabled
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </GlassCard>
        </SimpleGrid>
      </Box>
    </PageWrapper>
  );
}
