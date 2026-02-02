import { Box, Heading, Text, SimpleGrid, Flex, Spinner } from '@chakra-ui/react';
import { FiTrendingUp, FiFileText, FiHelpCircle, FiAlertCircle } from 'react-icons/fi';
import { PageWrapper } from '../components/layout/PageWrapper';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/dashboard/StatCard';

export function AnalyticsPage() {
  // Placeholder - would use real analytics hooks
  const isLoading = false;
  const stats = {
    total_questions: 156,
    answered_questions: 142,
    unanswered_questions: 14,
    popular_documents: 5,
  };

  const topQuestions = [
    { question: 'What is the vacation policy?', count: 23 },
    { question: 'How do I request time off?', count: 18 },
    { question: 'What are the expense reimbursement rules?', count: 15 },
    { question: 'What is the remote work policy?', count: 12 },
    { question: 'How do I report harassment?', count: 10 },
  ];

  return (
    <PageWrapper>
      <Box mb={6}>
        <Heading size="lg">Analytics</Heading>
        <Text color="gray.500" mt={1}>
          Insights into policy usage and knowledge gaps
        </Text>
      </Box>

      {isLoading ? (
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
        </Flex>
      ) : (
        <>
          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <StatCard
              label="Total Questions"
              value={stats.total_questions}
              icon={FiHelpCircle}
              color="purple"
            />
            <StatCard
              label="Answered"
              value={stats.answered_questions}
              icon={FiTrendingUp}
              color="green"
            />
            <StatCard
              label="Unanswered"
              value={stats.unanswered_questions}
              icon={FiAlertCircle}
              color="red"
            />
            <StatCard
              label="Popular Documents"
              value={stats.popular_documents}
              icon={FiFileText}
              color="blue"
            />
          </SimpleGrid>

          {/* Top Questions */}
          <GlassCard>
            <Heading size="md" mb={4}>Top Questions</Heading>
            <Box>
              {topQuestions.map((q, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  py={3}
                  borderBottom={index < topQuestions.length - 1 ? '1px solid' : 'none'}
                  borderColor="gray.100"
                >
                  <Flex align="center" gap={3}>
                    <Box
                      w={6}
                      h={6}
                      borderRadius="full"
                      bg="purple.100"
                      color="purple.600"
                      fontSize="xs"
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {index + 1}
                    </Box>
                    <Text fontSize="sm">{q.question}</Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    {q.count} times
                  </Text>
                </Flex>
              ))}
            </Box>
          </GlassCard>
        </>
      )}
    </PageWrapper>
  );
}
