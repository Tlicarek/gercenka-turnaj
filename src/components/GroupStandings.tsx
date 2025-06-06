
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from 'lucide-react';
import { Team } from '@/pages/Index';

interface GroupStandingsProps {
  teams: Team[];
}

const GroupStandings = ({ teams }: GroupStandingsProps) => {
  const groups = ['A', 'B', 'C', 'D'];

  const getGroupStandings = (group: string) => {
    return teams
      .filter(team => team.group === group)
      .sort((a, b) => {
        // Sort by wins first, then by point difference
        if (a.wins !== b.wins) return b.wins - a.wins;
        const aPointDiff = a.pointsFor - a.pointsAgainst;
        const bPointDiff = b.pointsFor - b.pointsAgainst;
        if (aPointDiff !== bPointDiff) return bPointDiff - aPointDiff;
        return b.pointsFor - a.pointsFor;
      });
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={20} />;
      case 3: return <Award className="text-orange-600" size={20} />;
      default: return null;
    }
  };

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2: return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Group Standings</h2>
        <p className="text-gray-600">Current tournament rankings by group</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => {
          const groupTeams = getGroupStandings(group);
          
          return (
            <Card key={group} className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    Group {group}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupTeams.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No teams in this group yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupTeams.map((team, index) => {
                      const position = index + 1;
                      const pointDiff = team.pointsFor - team.pointsAgainst;
                      
                      return (
                        <div
                          key={team.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            position <= 2 
                              ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getPositionIcon(position)}
                              <Badge className={getPositionBadge(position)}>
                                #{position}
                              </Badge>
                            </div>
                            <div>
                              <div className="font-bold text-lg">{team.name}</div>
                              <div className="text-sm text-gray-600">
                                {team.wins}W - {team.losses}L
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {team.pointsFor} - {team.pointsAgainst}
                            </div>
                            <div className={`text-sm font-medium ${
                              pointDiff > 0 ? 'text-green-600' : pointDiff < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {pointDiff > 0 ? '+' : ''}{pointDiff}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Stats Summary */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-700 font-medium mb-2">Group Statistics</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Teams:</span>
                          <span className="ml-2 font-medium">{groupTeams.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Games Played:</span>
                          <span className="ml-2 font-medium">{groupTeams.reduce((sum, team) => sum + team.wins + team.losses, 0) / 2}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Top 2 advance to knockouts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Tournament Stats */}
      <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-center">Tournament Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/80 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
              <div className="text-sm text-gray-600">Total Teams</div>
            </div>
            <div className="p-3 bg-white/80 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teams.reduce((sum, team) => sum + team.wins, 0)}
              </div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="p-3 bg-white/80 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {teams.reduce((sum, team) => sum + team.pointsFor, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="p-3 bg-white/80 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {groups.map(g => getGroupStandings(g)).filter(teams => teams.length >= 2).length}
              </div>
              <div className="text-sm text-gray-600">Groups Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupStandings;
