import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

interface GradientButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, variant = 'primary', ...props }, ref) => {
    const gradients = {
      primary: 'linear(to-r, purple.500, pink.500)',
      secondary: 'linear(to-r, blue.500, teal.500)',
    };

    return (
      <Button
        as={motion.button}
        ref={ref}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        bgGradient={gradients[variant]}
        color="white"
        px={6}
        py={3}
        borderRadius="full"
        fontWeight="semibold"
        _hover={{
          bgGradient: gradients[variant],
          boxShadow: 'lg',
        }}
        _active={{
          bgGradient: gradients[variant],
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GradientButton.displayName = 'GradientButton';
