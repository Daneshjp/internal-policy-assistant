import { Box, Heading, Text, SimpleGrid, Flex } from '@chakra-ui/react';
import { FiFileText, FiMessageSquare, FiFolder, FiUsers } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickAsk } from '../components/dashboard/QuickAsk';
import { RecentList } from '../components/dashboard/RecentList';
import { useDashboardStats, useRecentConversations, useRecentDocuments } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentConversations, isLoading: conversationsLoading } = useRecentConversations();
  const { data: recentDocuments, isLoading: documentsLoading } = useRecentDocuments();

  return (
    <PageWrapper>
      {/* Welcome Section */}
      <Box mb={8}>
        <Heading size="lg" color="gray.800">
          Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
        </Heading>
        <Text color="gray.500" mt={1}>
          Here's what's happening with your policy assistant today.
        </Text>
      </Box>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Total Documents"
          value={stats?.total_documents || 0}
          icon={FiFileText}
          color="purple"
        />
        <StatCard
          label="Conversations"
          value={stats?.total_conversations || 0}
          icon={FiMessageSquare}
          color="blue"
        />
        <StatCard
          label="Categories"
          value={stats?.total_categories || 0}
          icon={FiFolder}
          color="green"
        />
        {user?.role === 'admin' && (
          <StatCard
            label="Total Users"
            value={stats?.total_users || 0}
            icon={FiUsers}
            color="orange"
          />
        )}
      </SimpleGrid>

      {/* Quick Ask */}
      <Box mb={8}>
        <QuickAsk />
      </Box>

      {/* Recent Activity */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <RecentList
          title="Recent Conversations"
          items={recentConversations || []}
          type="conversations"
          viewAllLink="/chat"
          isLoading={conversationsLoading}
        />
        <RecentList
          title="Recent Documents"
          items={recentDocuments || []}
          type="documents"
          viewAllLink="/documents"
          isLoading={documentsLoading}
        />
      </SimpleGrid>
    </PageWrapper>
  );
}
