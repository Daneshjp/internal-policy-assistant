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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiCheck, FiX } from 'react-icons/fi';
import { MeshBackground } from '../components/layout/MeshBackground';
import { GlassCard } from '../components/ui/GlassCard';
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
      <Flex minH="100vh" align="center" justify="center">
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
                    bg="pink.100"
                    borderRadius="2xl"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUserPlus} boxSize={8} color="pink.600" />
                  </Flex>
                </motion.div>
                <Heading
                  as="h1"
                  size="xl"
                  textAlign="center"
                  bgGradient="linear(to-r, purple.600, pink.600)"
                  bgClip="text"
                >
                  Create Account
                </Heading>
                <Text color="gray.600" textAlign="center">
                  Join the Internal Policy Assistant
                </Text>
              </VStack>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={5}>
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
                  >
                    Create Account
                  </GradientButton>
                </VStack>
              </form>

              {/* Footer */}
              <Text textAlign="center" color="gray.600" fontSize="sm">
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
          </GlassCard>
        </motion.div>
      </Flex>
    </Box>
  );
}
