import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Box, Textarea, IconButton, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, isLoading = false, placeholder = 'Ask a question about company policies...' }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (content.trim() && !isLoading) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      bg="white"
      borderRadius="2xl"
      boxShadow="lg"
      p={2}
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex align="flex-end" gap={2}>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          resize="none"
          minH="44px"
          maxH="150px"
          border="none"
          _focus={{ boxShadow: 'none' }}
          fontSize="sm"
          rows={1}
          disabled={isLoading}
        />
        <IconButton
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Send message"
          icon={<FiSend />}
          colorScheme="purple"
          borderRadius="full"
          onClick={handleSend}
          isDisabled={!content.trim() || isLoading}
          isLoading={isLoading}
        />
      </Flex>
    </Box>
  );
}
