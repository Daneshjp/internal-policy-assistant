import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

interface GlassCardProps extends Omit<BoxProps, 'transition'> {
  children: ReactNode;
}

export function GlassCard({ children, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        p={6}
        borderRadius="2xl"
        bg="white"
        boxShadow="xl"
        border="1px solid"
        borderColor="gray.100"
        _hover={{
          boxShadow: '2xl',
          transform: 'translateY(-2px)',
        }}
        {...props}
      >
        {children}
      </Box>
    </motion.div>
  );
}
