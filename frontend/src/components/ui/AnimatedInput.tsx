import { motion } from 'framer-motion';
import { Input, InputProps, FormControl, FormLabel, FormErrorMessage, Box } from '@chakra-ui/react';
import { forwardRef } from 'react';

interface AnimatedInputProps extends InputProps {
  label?: string;
  error?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <FormControl isInvalid={!!error}>
        {label && (
          <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
            {label}
          </FormLabel>
        )}
        <Box
          as={motion.div}
          whileFocus={{ scale: 1.01 }}
        >
          <Input
            ref={ref}
            px={4}
            py={3}
            borderRadius="xl"
            border="2px solid"
            borderColor={error ? 'red.500' : 'gray.200'}
            _hover={{
              borderColor: error ? 'red.500' : 'gray.300',
            }}
            _focus={{
              borderColor: error ? 'red.500' : 'purple.500',
              boxShadow: 'none',
            }}
            {...props}
          />
        </Box>
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';
