import { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Edit, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberList } from '@/components/teams/MemberList';
import type { Team, TeamMember } from '@/types/team';

export const TeamDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  const team: Team = {
    id: Number(id),
    name: 'Alpha Team',
    description: 'Primary inspection team for pressure vessels and tanks',
    team_leader_id: 1,
    specialization: 'Pressure Vessels',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-01-13T00:00:00Z',
  };

  const members: TeamMember[] = [
    {
      id: 1,
      team_id: team.id,
      user_id: 1,
      role_in_team: 'leader',
      joined_at: '2024-01-01T00:00:00Z',
      is_active: true,
      user_name: 'John Doe',
      user_email: 'john.doe@adnoc.ae',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
    {
      id: 2,
      team_id: team.id,
      user_id: 2,
      role_in_team: 'inspector',
      joined_at: '2024-01-15T00:00:00Z',
      is_active: true,
      user_name: 'Jane Smith',
      user_email: 'jane.smith@adnoc.ae',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
    {
      id: 3,
      team_id: team.id,
      user_id: 3,
      role_in_team: 'inspector',
      joined_at: '2024-02-01T00:00:00Z',
      is_active: true,
      user_name: 'Bob Johnson',
      user_email: 'bob.johnson@adnoc.ae',
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
    {
      id: 4,
      team_id: team.id,
      user_id: 4,
      role_in_team: 'inspector',
      joined_at: '2024-03-01T00:00:00Z',
      is_active: true,
      user_name: 'Alice Williams',
      user_email: 'alice.williams@adnoc.ae',
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
    {
      id: 5,
      team_id: team.id,
      user_id: 5,
      role_in_team: 'support',
      joined_at: '2024-04-01T00:00:00Z',
      is_active: true,
      user_name: 'Charlie Brown',
      user_email: 'charlie.brown@adnoc.ae',
      created_at: '2024-04-01T00:00:00Z',
      updated_at: '2026-01-13T00:00:00Z',
    },
  ];

  const recentAssignments = [
    {
      id: 1,
      date: '2026-01-12',
      asset: 'Pressure Vessel PV-101',
      status: 'completed',
    },
    {
      id: 2,
      date: '2026-01-11',
      asset: 'Tank TK-205',
      status: 'in_progress',
    },
    {
      id: 3,
      date: '2026-01-10',
      asset: 'Pressure Vessel PV-103',
      status: 'completed',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/teams')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                <Badge variant={team.is_active ? 'success' : 'secondary'}>
                  {team.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-gray-600">{team.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Team
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>

          {team.specialization && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Award className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Specialization:</span>
              <span className="text-gray-700">{team.specialization}</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold">{members.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Active Assignments</p>
              <p className="text-2xl font-bold">7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Completed This Month</p>
              <p className="text-2xl font-bold">38</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">84%</p>
            </CardContent>
          </Card>
        </div>

        {/* Members Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={members} />
          </CardContent>
        </Card>

        {/* Recent Assignments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{assignment.asset}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(assignment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      assignment.status === 'completed' ? 'success' : 'default'
                    }
                  >
                    {assignment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
