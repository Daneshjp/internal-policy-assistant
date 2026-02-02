import { Box, VStack, Icon, Text, Flex, Divider } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiMessageSquare,
  FiFileText,
  FiFolder,
  FiBarChart2,
  FiSettings,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
}

function NavItem({ icon, label, to, isActive }: NavItemProps) {
  return (
    <Link to={to} style={{ width: '100%' }}>
      <Flex
        as={motion.div}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        align="center"
        px={4}
        py={3}
        borderRadius="lg"
        cursor="pointer"
        bg={isActive ? 'purple.50' : 'transparent'}
        color={isActive ? 'purple.600' : 'gray.600'}
        fontWeight={isActive ? 'semibold' : 'medium'}
        _hover={{
          bg: isActive ? 'purple.50' : 'gray.50',
        }}
      >
        <Icon as={icon} boxSize={5} mr={3} />
        <Text fontSize="sm">{label}</Text>
      </Flex>
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const mainNavItems = [
    { icon: FiHome, label: 'Dashboard', to: '/dashboard' },
    { icon: FiMessageSquare, label: 'Chat', to: '/chat' },
    { icon: FiFileText, label: 'Documents', to: '/documents' },
    { icon: FiFolder, label: 'Categories', to: '/categories' },
  ];

  const secondaryNavItems = [
    { icon: FiBarChart2, label: 'Analytics', to: '/analytics' },
    { icon: FiSettings, label: 'Settings', to: '/settings' },
  ];

  const adminNavItems = [
    { icon: FiShield, label: 'Admin', to: '/admin' },
  ];

  return (
    <Box
      as="aside"
      w="64"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      py={6}
    >
      <VStack spacing={1} align="stretch" px={4}>
        {/* Logo */}
        <Flex align="center" px={4} mb={6}>
          <Box
            w={8}
            h={8}
            borderRadius="lg"
            bgGradient="linear(to-br, purple.500, pink.500)"
            mr={3}
          />
          <Text fontWeight="bold" fontSize="lg" color="gray.800">
            Policy AI
          </Text>
        </Flex>

        {/* Main Navigation */}
        {mainNavItems.map((item) => (
          <NavItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={location.pathname === item.to}
          />
        ))}

        <Divider my={4} />

        {/* Secondary Navigation */}
        {secondaryNavItems.map((item) => (
          <NavItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            isActive={location.pathname === item.to}
          />
        ))}

        {/* Admin Navigation */}
        {user?.role === 'admin' && (
          <>
            <Divider my={4} />
            {adminNavItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={location.pathname.startsWith(item.to)}
              />
            ))}
          </>
        )}
      </VStack>
    </Box>
  );
}
