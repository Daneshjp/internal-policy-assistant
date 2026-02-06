import { useState, useMemo } from 'react';
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
  Progress,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiCheck, FiX, FiZap, FiUsers, FiAward, FiShield } from 'react-icons/fi';
import { AnimatedInput } from '../components/ui/AnimatedInput';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

// Benefits for the left panel
const benefits = [
  {
    icon: FiZap,
    title: 'Instant Answers',
    description: 'Get immediate responses to policy questions',
  },
  {
    icon: FiUsers,
    title: 'Team Collaboration',
    description: 'Share insights with your colleagues',
  },
  {
    icon: FiAward,
    title: 'Always Up-to-Date',
    description: 'Access the latest policy documents',
  },
];

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { strength, color, label } = useMemo(() => {
    const passedCount = passwordRequirements.filter((req) =>
      req.test(password)
    ).length;
    const percentage = (passedCount / passwordRequirements.length) * 100;

    if (percentage <= 20) return { strength: percentage, color: 'red.500', label: 'Very weak' };
    if (percentage <= 40) return { strength: percentage, color: 'orange.500', label: 'Weak' };
    if (percentage <= 60) return { strength: percentage, color: 'yellow.500', label: 'Fair' };
    if (percentage <= 80) return { strength: percentage, color: 'blue.500', label: 'Good' };
    return { strength: percentage, color: 'green.500', label: 'Strong' };
  }, [password]);

  if (!password) return null;

  return (
    <Box w="full">
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color="gray.500">
          Password strength
        </Text>
        <Text fontSize="xs" color={color} fontWeight="medium">
          {label}
        </Text>
      </Flex>
      <Progress
        value={strength}
        size="xs"
        borderRadius="full"
        sx={{
          '& > div': {
            bg: color,
          },
        }}
      />
      <VStack align="start" mt={3} spacing={1}>
        {passwordRequirements.map((req) => {
          const passed = req.test(password);
          return (
            <HStack key={req.label} spacing={2}>
              <Icon
                as={passed ? FiCheck : FiX}
                boxSize={3}
                color={passed ? 'green.500' : 'gray.400'}
              />
              <Text
                fontSize="xs"
                color={passed ? 'green.600' : 'gray.500'}
              >
                {req.label}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.password, data.fullName);
      toast({
        title: 'Account created!',
        description: 'Welcome to Internal Policy Assistant.',
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
            'Failed to create account. Please try again.';
      toast({
        title: 'Registration failed',
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
          bgGradient="linear(135deg, pink.500 0%, purple.600 50%, purple.700 100%)"
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
            left="-10%"
            w="400px"
            h="400px"
            bg="whiteAlpha.100"
            borderRadius="full"
            filter="blur(60px)"
          />
          <Box
            position="absolute"
            bottom="-10%"
            right="-10%"
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
                <Icon as={FiUserPlus} boxSize={10} />
              </Flex>
            </MotionBox>

            <VStack spacing={3}>
              <Heading as="h1" size="2xl" fontWeight="bold">
                Join Us Today
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                Create your account and start exploring company policies with AI
              </Text>
            </VStack>

            <VStack spacing={4} w="100%" pt={8}>
              {benefits.map((benefit, index) => (
                <MotionBox
                  key={benefit.title}
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
                      <Icon as={benefit.icon} boxSize={5} />
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold">{benefit.title}</Text>
                      <Text fontSize="sm" opacity={0.8}>
                        {benefit.description}
                      </Text>
                    </VStack>
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          </VStack>
        </MotionFlex>
      )}

      {/* Right Panel - Registration Form */}
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
          bgGradient="linear(to-br, pink.50, transparent, purple.50)"
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
            <VStack spacing={6} align="stretch">
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
                      bgGradient="linear(135deg, pink.500, purple.500)"
                      borderRadius="2xl"
                      align="center"
                      justify="center"
                      mb={2}
                    >
                      <Icon as={FiUserPlus} boxSize={8} color="white" />
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
                  Create Account
                </Heading>
                <Text color="gray.500" textAlign="center">
                  Join the Internal Policy Assistant
                </Text>
              </VStack>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <AnimatedInput
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />

                  <AnimatedInput
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Box w="full">
                    <AnimatedInput
                      label="Password"
                      type="password"
                      placeholder="Create a strong password"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <Box mt={3}>
                      <PasswordStrengthIndicator password={password || ''} />
                    </Box>
                  </Box>

                  <AnimatedInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <GradientButton
                    type="submit"
                    w="full"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Creating account..."
                    mt={2}
                  >
                    Create Account
                  </GradientButton>
                </VStack>
              </form>

              {/* Footer */}
              <Text textAlign="center" color="gray.500" fontSize="sm">
                Already have an account?{' '}
                <Link
                  as={RouterLink}
                  to="/login"
                  color="purple.600"
                  fontWeight="semibold"
                  _hover={{ color: 'purple.700', textDecoration: 'underline' }}
                >
                  Sign in
                </Link>
              </Text>
            </VStack>
          </Box>

          {/* Trust badges */}
          <HStack justify="center" spacing={6} mt={8} color="gray.400">
            <HStack spacing={2}>
              <Icon as={FiShield} boxSize={4} />
              <Text fontSize="xs">Secure Signup</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FiCheck} boxSize={4} />
              <Text fontSize="xs">Free to Join</Text>
            </HStack>
          </HStack>
        </MotionBox>
      </Flex>
    </Flex>
  );
}
