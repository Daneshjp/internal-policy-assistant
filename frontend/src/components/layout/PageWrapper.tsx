import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Box minH="100vh">
        {children}
      </Box>
    </motion.div>
  );
}
