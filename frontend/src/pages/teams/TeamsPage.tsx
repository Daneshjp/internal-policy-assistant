import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamCard } from '@/components/teams/TeamCard';
import type { Team, TeamStats } from '@/types/team';

export const TeamsPage: FC = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  const mockTeams: (Team & { stats: TeamStats })[] = [
    {
      id: 1,
      name: 'Alpha Team',
      description: 'Primary inspection team for pressure vessels and tanks',
      team_leader_id: 1,
      specialization: 'Pressure Vessels',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
      stats: {
        total_members: 8,
        active_members: 7,
        total_assignments: 45,
        completed_assignments: 38,
        pending_assignments: 7,
        completion_rate: 84,
      },
    },
    {
      id: 2,
      name: 'Bravo Team',
      description: 'Specialized in pipeline and piping inspections',
      team_leader_id: 2,
      specialization: 'Pipelines',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
      stats: {
        total_members: 6,
        active_members: 6,
        total_assignments: 52,
        completed_assignments: 48,
        pending_assignments: 4,
        completion_rate: 92,
      },
    },
    {
      id: 3,
      name: 'Charlie Team',
      description: 'Heat exchangers and rotating equipment specialists',
      team_leader_id: 3,
      specialization: 'Heat Exchangers',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
      stats: {
        total_members: 5,
        active_members: 5,
        total_assignments: 32,
        completed_assignments: 25,
        pending_assignments: 7,
        completion_rate: 78,
      },
    },
    {
      id: 4,
      name: 'Delta Team',
      description: 'Emergency response and critical inspections',
      team_leader_id: 4,
      specialization: 'Emergency Response',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
      stats: {
        total_members: 10,
        active_members: 9,
        total_assignments: 28,
        completed_assignments: 26,
        pending_assignments: 2,
        completion_rate: 93,
      },
    },
  ];

  const handleTeamClick = (id: number) => {
    navigate(`/teams/${id}`);
  };

  const handleCreateTeam = () => {
    navigate('/teams/new');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-2">
              Manage inspection teams and their assignments
            </p>
          </div>
          <Button onClick={handleCreateTeam} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              stats={team.stats}
              onClick={handleTeamClick}
            />
          ))}
        </div>

        {mockTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No teams found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
