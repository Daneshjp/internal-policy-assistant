import { useState } from 'react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Link,
  Spinner,
  useToast,
  Flex,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiShield, FiFileText, FiMessageCircle, FiLock } from 'react-icons/fi';
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

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Feature items for the left panel
const features = [
  {
    icon: FiFileText,
    title: 'Policy Documents',
    description: 'Access all company policies in one place',
  },
  {
    icon: FiMessageCircle,
    title: 'AI Assistant',
    description: 'Get instant answers to your policy questions',
  },
  {
    icon: FiLock,
    title: 'Secure Access',
    description: 'Enterprise-grade security for your data',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

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
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
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
    <Flex minH="100vh" w="100%">
      {/* Left Panel - Branding (hidden on mobile) */}
      {!isMobile && (
        <MotionFlex
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          flex={1}
          bgGradient="linear(135deg, purple.600 0%, purple.700 50%, pink.600 100%)"
          color="white"
          direction="column"
          justify="center"
          align="center"
          p={12}
          position="relative"
          overflow="hidden"
        >
          {/* Background decoration */}
          <Box
            position="absolute"
            top="-20%"
            right="-10%"
            w="400px"
            h="400px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(60px)"
          />
          <Box
            position="absolute"
            bottom="-10%"
            left="-10%"
            w="300px"
            h="300px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(40px)"
          />

          <VStack spacing={8} maxW="400px" textAlign="center" zIndex={1}>
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Flex
                w={20}
                h={20}
                bg="whiteAlpha.200"
                borderRadius="2xl"
                align="center"
                justify="center"
                backdropFilter="blur(10px)"
              >
                <Icon as={FiShield} boxSize={10} />
              </Flex>
            </MotionBox>

            <VStack spacing={3}>
              <Heading as="h1" size="2xl" fontWeight="bold">
                Policy Assistant
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                Your intelligent companion for navigating company policies
              </Text>
            </VStack>

            <VStack spacing={4} w="100%" pt={8}>
              {features.map((feature, index) => (
                <MotionBox
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  w="100%"
                >
                  <HStack
                    spacing={4}
                    p={4}
                    bg="whiteAlpha.100"
                    borderRadius="xl"
                    backdropFilter="blur(10px)"
                  >
                    <Flex
                      w={10}
                      h={10}
                      bg="whiteAlpha.200"
                      borderRadius="lg"
                      align="center"
                      justify="center"
                    >
                      <Icon as={feature.icon} boxSize={5} />
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold">{feature.title}</Text>
                      <Text fontSize="sm" opacity={0.8}>
                        {feature.description}
                      </Text>
                    </VStack>
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          </VStack>
        </MotionFlex>
      )}

      {/* Right Panel - Login Form */}
      <Flex
        flex={1}
        bg="gray.50"
        align="center"
        justify="center"
        p={{ base: 6, md: 12 }}
        position="relative"
      >
        {/* Subtle background pattern */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-br, purple.50, transparent, pink.50)"
          opacity={0.5}
        />

        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          w="100%"
          maxW="420px"
          zIndex={1}
        >
          <Box
            bg="white"
            p={{ base: 6, md: 10 }}
            borderRadius="2xl"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.100"
          >
            <VStack spacing={8} align="stretch">
              {/* Header */}
              <VStack spacing={3} align="center">
                {isMobile && (
                  <MotionBox
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <Flex
                      w={16}
                      h={16}
                      bgGradient="linear(135deg, purple.500, pink.500)"
                      borderRadius="2xl"
                      align="center"
                      justify="center"
                      mb={2}
                    >
                      <Icon as={FiShield} boxSize={8} color="white" />
                    </Flex>
                  </MotionBox>
                )}
                <Heading
                  as="h2"
                  size="xl"
                  textAlign="center"
                  bgGradient="linear(to-r, purple.600, pink.600)"
                  bgClip="text"
                >
                  Welcome Back
                </Heading>
                <Text color="gray.500" textAlign="center">
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
                    mt={2}
                  >
                    Sign In
                  </GradientButton>
                </VStack>
              </form>

              {/* Footer */}
              <Text textAlign="center" color="gray.500" fontSize="sm">
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
          </Box>

          {/* Trust badges */}
          <HStack justify="center" spacing={6} mt={8} color="gray.400">
            <HStack spacing={2}>
              <Icon as={FiLock} boxSize={4} />
              <Text fontSize="xs">Secure Login</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FiShield} boxSize={4} />
              <Text fontSize="xs">256-bit Encryption</Text>
            </HStack>
          </HStack>
        </MotionBox>
      </Flex>
    </Flex>
  );
}
