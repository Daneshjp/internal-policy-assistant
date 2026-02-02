import { useState } from 'react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  VStack,
  Heading,
  Text,
  Link,
  Spinner,
  useToast,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';
import { MeshBackground } from '../components/layout/MeshBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  if (authLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Invalid email or password. Please try again.';
      toast({
        title: 'Login failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" position="relative">
      <MeshBackground />

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        px={4}
        py={12}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '28rem' }}
        >
          <GlassCard p={8}>
            <VStack spacing={8} align="stretch">
              {/* Header */}
              <VStack spacing={3}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Flex
                    w={16}
                    h={16}
                    bg="purple.100"
                    borderRadius="2xl"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiShield} boxSize={8} color="purple.600" />
                  </Flex>
                </motion.div>
                <Heading
                  as="h1"
                  size="xl"
                  textAlign="center"
                  bgGradient="linear(to-r, purple.600, pink.600)"
                  bgClip="text"
                >
                  Welcome Back
                </Heading>
                <Text color="gray.600" textAlign="center">
                  Sign in to access your policy assistant
                </Text>
              </VStack>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={5}>
                  <AnimatedInput
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <AnimatedInput
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <GradientButton
                    type="submit"
                    w="full"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </GradientButton>
                </VStack>
              </form>

              {/* Footer */}
              <Text textAlign="center" color="gray.600" fontSize="sm">
                Don't have an account?{' '}
                <Link
                  as={RouterLink}
                  to="/register"
                  color="purple.600"
                  fontWeight="semibold"
                  _hover={{ color: 'purple.700', textDecoration: 'underline' }}
                >
                  Sign up
                </Link>
              </Text>
            </VStack>
          </GlassCard>
        </motion.div>
      </Flex>
    </Box>
  );
}
