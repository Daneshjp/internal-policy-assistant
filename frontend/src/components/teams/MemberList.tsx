import { FC } from 'react';
import { Mail, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/types/team';

interface MemberListProps {
  members: TeamMember[];
}

export const MemberList: FC<MemberListProps> = ({ members }) => {
  const getRoleBadge = (role: TeamMember['role_in_team']) => {
    switch (role) {
      case 'leader':
        return <Badge variant="success">Leader</Badge>;
      case 'inspector':
        return <Badge variant="default">Inspector</Badge>;
      case 'support':
        return <Badge variant="secondary">Support</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Member</th>
            <th className="text-left p-3 font-semibold">Role</th>
            <th className="text-left p-3 font-semibold">Contact</th>
            <th className="text-left p-3 font-semibold">Joined</th>
            <th className="text-left p-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{member.user_name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">ID: {member.user_id}</p>
                  </div>
                </div>
              </td>
              <td className="p-3">{getRoleBadge(member.role_in_team)}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{member.user_email || 'N/A'}</span>
                </div>
              </td>
              <td className="p-3">
                <span className="text-sm">
                  {new Date(member.joined_at).toLocaleDateString()}
                </span>
              </td>
              <td className="p-3">
                <Badge variant={member.is_active ? 'success' : 'secondary'}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No team members found
        </div>
      )}
    </div>
  );
};
