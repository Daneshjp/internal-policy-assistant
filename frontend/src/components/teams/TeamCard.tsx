import { FC } from 'react';
import { motion } from 'framer-motion';
import { Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Team, TeamStats } from '@/types/team';

interface TeamCardProps {
  team: Team;
  stats?: TeamStats;
  onClick: (id: number) => void;
}

export const TeamCard: FC<TeamCardProps> = ({ team, stats, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onClick(team.id)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
            <Badge variant={team.is_active ? 'success' : 'secondary'}>
              {team.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {team.description}
          </p>

          {team.specialization && (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">{team.specialization}</span>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="font-semibold">{stats.total_members}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="font-semibold">{stats.completion_rate}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
