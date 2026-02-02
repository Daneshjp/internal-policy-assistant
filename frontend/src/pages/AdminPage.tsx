import { Box, Heading, Text, SimpleGrid, Flex, Spinner, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, useToast } from '@chakra-ui/react';
import { FiUsers, FiFileText, FiMessageSquare, FiFolder, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/dashboard/StatCard';

export function AdminPage() {
  const toast = useToast();

  // Placeholder data - would use real admin hooks
  const stats = {
    total_users: 45,
    total_documents: 128,
    total_conversations: 312,
    total_categories: 8,
  };

  const users = [
    { id: 1, email: 'admin@company.com', full_name: 'Admin User', role: 'admin', is_active: true },
    { id: 2, email: 'manager@company.com', full_name: 'Manager User', role: 'manager', is_active: true },
    { id: 3, email: 'employee1@company.com', full_name: 'John Doe', role: 'employee', is_active: true },
    { id: 4, email: 'employee2@company.com', full_name: 'Jane Smith', role: 'employee', is_active: false },
  ];

  const roleColors: Record<string, string> = {
    admin: 'red',
    manager: 'blue',
    employee: 'green',
  };

  return (
    <PageWrapper>
      <Box mb={6}>
        <Heading size="lg">Admin Dashboard</Heading>
        <Text color="gray.500" mt={1}>
          Manage users and system settings
        </Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Total Users"
          value={stats.total_users}
          icon={FiUsers}
          color="purple"
        />
        <StatCard
          label="Documents"
          value={stats.total_documents}
          icon={FiFileText}
          color="blue"
        />
        <StatCard
          label="Conversations"
          value={stats.total_conversations}
          icon={FiMessageSquare}
          color="green"
        />
        <StatCard
          label="Categories"
          value={stats.total_categories}
          icon={FiFolder}
          color="orange"
        />
      </SimpleGrid>

      {/* Users Table */}
      <GlassCard>
        <Heading size="md" mb={4}>Users</Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="medium">{user.full_name}</Td>
                  <Td color="gray.600">{user.email}</Td>
                  <Td>
                    <Badge colorScheme={roleColors[user.role]} borderRadius="full">
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={user.is_active ? 'green' : 'gray'} borderRadius="full">
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={1}>
                      <IconButton
                        aria-label="Edit user"
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        onClick={() => toast({ title: 'Edit user modal coming soon', status: 'info' })}
                      />
                      <IconButton
                        aria-label="Delete user"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => toast({ title: 'Delete confirmation coming soon', status: 'info' })}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </GlassCard>
    </PageWrapper>
  );
}
