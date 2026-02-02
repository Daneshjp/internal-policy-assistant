import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { VStack, StackProps } from '@chakra-ui/react';

interface AnimatedListProps extends StackProps {
  children: ReactNode[];
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function AnimatedList({ children, ...props }: AnimatedListProps) {
  return (
    <VStack
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="visible"
      spacing={4}
      align="stretch"
      {...props}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={item}>
          {child}
        </motion.div>
      ))}
    </VStack>
  );
}
