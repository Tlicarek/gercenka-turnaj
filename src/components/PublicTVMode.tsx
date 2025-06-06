
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users } from 'lucide-react';
import { Team, Game, TournamentSettings } from '@/pages/Index';

interface PublicTVModeProps {
  games: Game[];
  teams: Team[];
  tournamentSettings: TournamentSettings;
}

const PublicTVMode = ({ games, teams, tournamentSettings }: PublicTVModeProps) => {
  const runningGames = games.filter(g => g.isRunning);
  const upcomingGames = games.filter(g => !g.isComplete && !g.isRunning).slice(0, 3);

  const getTeamWinningStatus = (game: Game, teamKey: 'team1' | 'team2') => {
    if (tournamentSettings.winCondition === 'sets') {
      const team1SetsWon = game.sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length;
      const team2SetsWon = game.sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length;
      
      if (teamKey === 'team1') {
        return team1SetsWon >= tournamentSettings.setsToWin ? 'won' : team1SetsWon > team2SetsWon ? 'winning' : 'losing';
      } else {
        return team2SetsWon >= tournamentSettings.setsToWin ? 'won' : team2SetsWon > team1SetsWon ? 'winning' : 'losing';
      }
    } else {
      const currentSet = game.sets[game.currentSet] || { team1Score: 0, team2Score: 0, isComplete: false };
      if (teamKey === 'team1') {
        return currentSet.team1Score > currentSet.team2Score ? 'winning' : 'losing';
      } else {
        return currentSet.team2Score > currentSet.team1Score ? 'winning' : 'losing';
      }
    }
  };

  const getScoreDisplay = (game: Game) => {
    if (tournamentSettings.winCondition === 'sets') {
      const team1SetsWon = game.sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length;
      const team2SetsWon = game.sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length;
      const currentSet = game.sets[game.currentSet] || { team1Score: 0, team2Score: 0, isComplete: false };
      
      return {
        team1Sets: team1SetsWon,
        team2Sets: team2SetsWon,
        team1CurrentScore: currentSet.team1Score,
        team2CurrentScore: currentSet.team2Score,
        currentSetNumber: game.currentSet + 1
      };
    } else {
      const currentSet = game.sets[0] || { team1Score: 0, team2Score: 0, isComplete: false };
      return {
        team1Score: currentSet.team1Score,
        team2Score: currentSet.team2Score
      };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-4">
          <Trophy className="text-orange-500" size={64} />
          LIVE TOURNAMENT
        </h1>
        <p className="text-2xl text-gray-600">Real-time scores and updates</p>
      </div>

      {/* Running Games */}
      {runningGames.length > 0 && (
        <div>
          <h2 className="text-4xl font-bold mb-6 text-center text-blue-600">LIVE GAMES</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {runningGames.map(game => {
              const scoreData = getScoreDisplay(game);
              const team1Status = getTeamWinningStatus(game, 'team1');
              const team2Status = getTeamWinningStatus(game, 'team2');
              
              return (
                <Card key={game.id} className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-4 border-yellow-400">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-3xl font-bold">{game.field}</CardTitle>
                    {game.group && (
                      <Badge className="text-xl px-4 py-2 bg-yellow-400 text-black">
                        Group {game.group}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Team 1 */}
                    <div className={`p-6 rounded-lg text-center transition-all ${
                      team1Status === 'won' ? 'bg-green-600 shadow-2xl scale-105' : 
                      team1Status === 'winning' ? 'bg-green-500 shadow-xl' : 'bg-white/20'
                    }`}>
                      <div className="text-2xl font-bold mb-2">{game.team1.name}</div>
                      <div className="flex justify-center items-center gap-4">
                        {tournamentSettings.winCondition === 'sets' ? (
                          <>
                            <div className="text-5xl font-bold">{scoreData.team1Sets}</div>
                            <div className="text-xl">({scoreData.team1CurrentScore})</div>
                          </>
                        ) : (
                          <div className="text-6xl font-bold">{scoreData.team1Score}</div>
                        )}
                      </div>
                      {team1Status === 'won' && <div className="text-xl font-bold mt-2">🏆 WINNER!</div>}
                    </div>

                    {/* VS and Set Info */}
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">VS</div>
                      {tournamentSettings.winCondition === 'sets' && (
                        <div className="text-xl">Set {scoreData.currentSetNumber}</div>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className={`p-6 rounded-lg text-center transition-all ${
                      team2Status === 'won' ? 'bg-green-600 shadow-2xl scale-105' : 
                      team2Status === 'winning' ? 'bg-green-500 shadow-xl' : 'bg-white/20'
                    }`}>
                      <div className="text-2xl font-bold mb-2">{game.team2.name}</div>
                      <div className="flex justify-center items-center gap-4">
                        {tournamentSettings.winCondition === 'sets' ? (
                          <>
                            <div className="text-5xl font-bold">{scoreData.team2Sets}</div>
                            <div className="text-xl">({scoreData.team2CurrentScore})</div>
                          </>
                        ) : (
                          <div className="text-6xl font-bold">{scoreData.team2Score}</div>
                        )}
                      </div>
                      {team2Status === 'won' && <div className="text-xl font-bold mt-2">🏆 WINNER!</div>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Games */}
      {upcomingGames.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-orange-600">NEXT GAMES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingGames.map(game => (
              <Card key={game.id} className="bg-white/90 backdrop-blur-sm border-2 border-orange-300">
                <CardContent className="p-6 text-center">
                  <div className="text-xl font-bold text-orange-600 mb-3">{game.field}</div>
                  <div className="space-y-3">
                    <div className="text-lg font-semibold">{game.team1.name}</div>
                    <div className="text-2xl font-bold text-gray-500">VS</div>
                    <div className="text-lg font-semibold">{game.team2.name}</div>
                  </div>
                  {game.group && (
                    <Badge className="mt-3" variant="outline">Group {game.group}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tournament Stats */}
      <Card className="bg-gradient-to-r from-orange-100 to-blue-100 border-2 border-gray-300">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white/80 rounded-lg">
              <Users className="mx-auto mb-2 text-blue-600" size={32} />
              <div className="text-3xl font-bold text-blue-600">{teams.length}</div>
              <div className="text-lg text-gray-600">Teams</div>
            </div>
            <div className="p-4 bg-white/80 rounded-lg">
              <Trophy className="mx-auto mb-2 text-green-600" size={32} />
              <div className="text-3xl font-bold text-green-600">
                {games.filter(g => g.isComplete).length}
              </div>
              <div className="text-lg text-gray-600">Completed</div>
            </div>
            <div className="p-4 bg-white/80 rounded-lg">
              <Clock className="mx-auto mb-2 text-orange-600" size={32} />
              <div className="text-3xl font-bold text-orange-600">{runningGames.length}</div>
              <div className="text-lg text-gray-600">Live Now</div>
            </div>
            <div className="p-4 bg-white/80 rounded-lg">
              <Calendar className="mx-auto mb-2 text-purple-600" size={32} />
              <div className="text-3xl font-bold text-purple-600">
                {games.filter(g => !g.isComplete && !g.isRunning).length}
              </div>
              <div className="text-lg text-gray-600">Upcoming</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No active games message */}
      {runningGames.length === 0 && upcomingGames.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="mx-auto mb-4 text-gray-400" size={64} />
            <div className="text-3xl font-bold text-gray-600 mb-2">No Active Games</div>
            <div className="text-xl text-gray-500">Check back soon for live updates!</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicTVMode;
