import { Box, Text, Flex, Icon } from '@chakra-ui/react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  label: string;
  value: number;
  icon: IconType;
  color: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1 });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      bg="white"
      borderRadius="2xl"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      p={6}
      transition="all 0.2s"
      _hover={{ boxShadow: 'lg' }}
    >
      <Flex justify="space-between" align="start">
        <Box>
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            {label}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800" mt={1}>
            <AnimatedNumber value={value} />
          </Text>
        </Box>
        <Flex
          w={12}
          h={12}
          borderRadius="xl"
          bg={`${color}.100`}
          align="center"
          justify="center"
        >
          <Icon as={icon} boxSize={6} color={`${color}.500`} />
        </Flex>
      </Flex>
    </Box>
  );
}
