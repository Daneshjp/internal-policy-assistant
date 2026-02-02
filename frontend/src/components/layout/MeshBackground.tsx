import { Box } from '@chakra-ui/react';

export function MeshBackground() {
  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={-1}
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, purple.50, white, pink.50)"
      />
      <Box
        position="absolute"
        top={0}
        left="25%"
        w="96"
        h="96"
        bg="purple.200"
        borderRadius="full"
        filter="blur(80px)"
        opacity={0.3}
        sx={{ animation: 'pulse 4s ease-in-out infinite' }}
      />
      <Box
        position="absolute"
        bottom={0}
        right="25%"
        w="96"
        h="96"
        bg="pink.200"
        borderRadius="full"
        filter="blur(80px)"
        opacity={0.3}
        sx={{ animation: 'pulse 4s ease-in-out infinite 2s' }}
      />
    </Box>
  );
}
