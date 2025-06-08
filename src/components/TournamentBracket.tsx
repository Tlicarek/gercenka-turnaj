
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { Team, Game } from '@/pages/Index';

interface TournamentBracketProps {
  teams: Team[];
  games: Game[];
  currentPhase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
}

const TournamentBracket = ({ teams, games, currentPhase }: TournamentBracketProps) => {
  const getTopTeamsFromGroups = () => {
    // Get unique groups that actually have teams
    const activeGroups = [...new Set(teams.map(team => team.group))].sort();
    const qualifiedTeams: { team: Team; position: number; group: string }[] = [];

    activeGroups.forEach(group => {
      const groupTeams = teams
        .filter(team => team.group === group)
        .sort((a, b) => {
          if (a.wins !== b.wins) return b.wins - a.wins;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });
      
      groupTeams.slice(0, 2).forEach((team, index) => {
        qualifiedTeams.push({ team, position: index + 1, group });
      });
    });

    return { qualifiedTeams, activeGroups };
  };

  const knockoutGames = games.filter(g => g.phase !== 'group');
  const quarterfinals = knockoutGames.filter(g => g.phase === 'quarterfinal');
  const semifinals = knockoutGames.filter(g => g.phase === 'semifinal');
  const finals = knockoutGames.filter(g => g.phase === 'final');

  const getGameWinner = (game: Game) => {
    if (!game.isComplete) return null;
    
    // Check sets for winner
    if (game.sets && game.sets.length > 1) {
      const team1SetsWon = game.sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length;
      const team2SetsWon = game.sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length;
      return team1SetsWon > team2SetsWon ? game.team1 : game.team2;
    }
    
    // Check individual game score
    return game.team1Score > game.team2Score ? game.team1 : game.team2;
  };

  const getGameScore = (game: Game, team: 'team1' | 'team2') => {
    if (game.sets && game.sets.length > 1) {
      return game.sets.filter(set => 
        set.isComplete && 
        (team === 'team1' ? set.team1Score > set.team2Score : set.team2Score > set.team1Score)
      ).length;
    }
    return team === 'team1' ? game.team1Score : game.team2Score;
  };

  const renderGameCard = (game: Game | null, title: string, isPlaceholder = false) => {
    if (!game && !isPlaceholder) return null;

    return (
      <Card className={`w-full ${isPlaceholder ? 'border-dashed border-gray-300 bg-gray-50' : 'bg-white border-orange-200'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {game ? (
            <div className="space-y-2">
              <div className={`flex justify-between items-center p-2 rounded ${
                game.isComplete && getGameWinner(game)?.id === game.team1.id
                  ? 'bg-green-100 border border-green-300' 
                  : 'bg-blue-50'
              }`}>
                <span className="font-medium text-sm">{game.team1.name}</span>
                <span className="font-bold">{getGameScore(game, 'team1')}</span>
              </div>
              <div className={`flex justify-between items-center p-2 rounded ${
                game.isComplete && getGameWinner(game)?.id === game.team2.id
                  ? 'bg-green-100 border border-green-300' 
                  : 'bg-orange-50'
              }`}>
                <span className="font-medium text-sm">{game.team2.name}</span>
                <span className="font-bold">{getGameScore(game, 'team2')}</span>
              </div>
              {game.isComplete && (
                <div className="text-center">
                  <Badge className="bg-green-500 text-white">
                    <Trophy size={12} className="mr-1" />
                    {getGameWinner(game)?.name} Wins
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <div className="text-sm">TBD</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const { qualifiedTeams, activeGroups } = getTopTeamsFromGroups();
  const isSingleGroup = activeGroups.length === 1;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Tournament Bracket</h2>
        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
        </Badge>
      </div>

      {/* Group Stage Qualifiers */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Medal className="text-blue-500" size={24} />
            Group Stage Qualifiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSingleGroup ? (
            // Single group layout - show teams in a single column
            <div className="max-w-md mx-auto space-y-4">
              <h4 className="font-bold text-center text-xl">Group {activeGroups[0]}</h4>
              <div className="space-y-2">
                {[1, 2].map(position => {
                  const qualifier = qualifiedTeams.find(q => q.position === position);
                  
                  return (
                    <div
                      key={position}
                      className={`p-4 rounded-lg text-center ${
                        qualifier 
                          ? position === 1 
                            ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                            : 'bg-gray-100 border border-gray-300 text-gray-800'
                          : 'bg-white border-2 border-dashed border-gray-300 text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {position === 1 ? <Trophy size={20} /> : <Medal size={20} />}
                        <span className="font-medium text-lg">
                          {qualifier ? qualifier.team.name : `${position === 1 ? '1st' : '2nd'} Place`}
                        </span>
                      </div>
                      {qualifier && (
                        <div className="text-sm mt-2">
                          {qualifier.team.wins}W - {qualifier.team.losses}L
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Multi-group layout - show all groups
            <div className={`grid ${activeGroups.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
              {activeGroups.map(group => {
                const groupQualifiers = qualifiedTeams.filter(q => q.group === group);
                
                return (
                  <div key={group} className="space-y-2">
                    <h4 className="font-bold text-center">Group {group}</h4>
                    {[1, 2].map(position => {
                      const qualifier = groupQualifiers.find(q => q.position === position);
                      
                      return (
                        <div
                          key={position}
                          className={`p-3 rounded-lg text-center ${
                            qualifier 
                              ? position === 1 
                                ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                                : 'bg-gray-100 border border-gray-300 text-gray-800'
                              : 'bg-white border-2 border-dashed border-gray-300 text-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {position === 1 ? <Trophy size={16} /> : <Medal size={16} />}
                            <span className="font-medium">
                              {qualifier ? qualifier.team.name : `${position === 1 ? '1st' : '2nd'} Place`}
                            </span>
                          </div>
                          {qualifier && (
                            <div className="text-xs mt-1">
                              {qualifier.team.wins}W - {qualifier.team.losses}L
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knockout Bracket */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-orange-200">
        <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Crown className="text-yellow-500" size={28} />
          Knockout Stage
        </h3>

        {isSingleGroup ? (
          // Single group knockout - simplified layout (just final)
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                With only one group, the top 2 teams advance directly to the final
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-center text-purple-600">Final</h4>
              <div className="mt-8">
                {renderGameCard(
                  finals[0] || null,
                  'Championship',
                  !finals[0]
                )}
              </div>
            </div>

            {/* Champion */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-center text-yellow-600">Champion</h4>
              <div className="mt-8">
                <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
                  <CardContent className="p-6 text-center">
                    {finals[0] && finals[0].isComplete ? (
                      <div className="space-y-3">
                        <Trophy className="text-yellow-500 mx-auto" size={48} />
                        <div className="text-2xl font-bold text-yellow-800">
                          {getGameWinner(finals[0])?.name}
                        </div>
                        <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                          🏆 Tournament Champion
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Trophy className="text-gray-400 mx-auto" size={48} />
                        <div className="text-gray-500 font-medium">
                          Awaiting Final
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          // Multi-group knockout - full bracket
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quarterfinals */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-center text-orange-600">Quarterfinals</h4>
              {[0, 1, 2, 3].map(index => (
                <div key={index}>
                  {renderGameCard(
                    quarterfinals[index] || null,
                    `QF ${index + 1}`,
                    !quarterfinals[index]
                  )}
                </div>
              ))}
            </div>

            {/* Semifinals */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-center text-blue-600">Semifinals</h4>
              <div className="mt-8">
                {renderGameCard(
                  semifinals[0] || null,
                  'SF 1',
                  !semifinals[0]
                )}
              </div>
              <div className="mt-16">
                {renderGameCard(
                  semifinals[1] || null,
                  'SF 2',
                  !semifinals[1]
                )}
              </div>
            </div>

            {/* Finals */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-center text-purple-600">Final</h4>
              <div className="mt-20">
                {renderGameCard(
                  finals[0] || null,
                  'Championship',
                  !finals[0]
                )}
              </div>
            </div>

            {/* Champion */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-center text-yellow-600">Champion</h4>
              <div className="mt-20">
                <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
                  <CardContent className="p-6 text-center">
                    {finals[0] && finals[0].isComplete ? (
                      <div className="space-y-3">
                        <Trophy className="text-yellow-500 mx-auto" size={48} />
                        <div className="text-2xl font-bold text-yellow-800">
                          {getGameWinner(finals[0])?.name}
                        </div>
                        <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                          🏆 Tournament Champion
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Trophy className="text-gray-400 mx-auto" size={48} />
                        <div className="text-gray-500 font-medium">
                          Awaiting Final
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tournament Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-center">Tournament Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/80 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {qualifiedTeams.length}/{activeGroups.length * 2}
              </div>
              <div className="text-sm text-gray-600">Teams Qualified</div>
            </div>
            {!isSingleGroup && (
              <div className="p-3 bg-white/80 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {quarterfinals.filter(g => g.isComplete).length}/4
                </div>
                <div className="text-sm text-gray-600">QF Complete</div>
              </div>
            )}
            {!isSingleGroup && (
              <div className="p-3 bg-white/80 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {semifinals.filter(g => g.isComplete).length}/2
                </div>
                <div className="text-sm text-gray-600">SF Complete</div>
              </div>
            )}
            <div className="p-3 bg-white/80 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">
                {finals.filter(g => g.isComplete).length}/1
              </div>
              <div className="text-sm text-gray-600">Final Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentBracket;
