import {
  Box,
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiSearch, FiBell, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={6}
      py={4}
      position="fixed"
      top={0}
      left="64"
      right={0}
      zIndex={10}
    >
      <Flex align="center" justify="space-between">
        {/* Search */}
        <InputGroup maxW="md">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search documents, policies..."
            borderRadius="full"
            bg="gray.50"
            border="none"
            _focus={{
              bg: 'white',
              boxShadow: 'sm',
              border: '1px solid',
              borderColor: 'purple.200',
            }}
          />
        </InputGroup>

        {/* Right side */}
        <Flex align="center" gap={4}>
          {/* Notifications */}
          <IconButton
            aria-label="Notifications"
            icon={<FiBell />}
            variant="ghost"
            borderRadius="full"
            color="gray.600"
          />

          {/* User Menu */}
          <Menu>
            <MenuButton>
              <Flex align="center" cursor="pointer">
                <Avatar
                  size="sm"
                  name={user?.full_name || user?.email}
                  bg="purple.500"
                  color="white"
                />
                <Box ml={3} textAlign="left" display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                    {user?.full_name || 'User'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user?.role}
                  </Text>
                </Box>
              </Flex>
            </MenuButton>
            <MenuList>
              <Link to="/profile">
                <MenuItem icon={<FiUser />}>Profile</MenuItem>
              </Link>
              <Link to="/settings">
                <MenuItem icon={<FiSettings />}>Settings</MenuItem>
              </Link>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
