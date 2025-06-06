
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Team, Game } from '@/pages/Index';
import { Plus, Minus, Play, Trophy, Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ScoreBoardProps {
  games: Game[];
  onGameUpdate: (games: Game[]) => void;
  teams: Team[];
  onTeamUpdate: (teams: Team[]) => void;
  currentPhase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
  onPhaseChange: (phase: 'group' | 'quarterfinal' | 'semifinal' | 'final') => void;
}

const ScoreBoard = ({ games, onGameUpdate, teams, onTeamUpdate, currentPhase, onPhaseChange }: ScoreBoardProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const updateScore = (gameId: string, team: 'team1' | 'team2', change: number) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId && !game.isComplete) {
        const newScore = Math.max(0, game[`${team}Score`] + change);
        const otherTeamScore = team === 'team1' ? game.team2Score : game.team1Score;
        
        // Check if game should be completed (first to 15 points)
        const isComplete = newScore >= 15;
        
        if (isComplete) {
          // Update team statistics
          const winningTeam = team === 'team1' ? game.team1 : game.team2;
          const losingTeam = team === 'team1' ? game.team2 : game.team1;
          
          updateTeamStats(winningTeam.id, losingTeam.id, newScore, otherTeamScore);
          
          toast({
            title: "Game Complete!",
            description: `${winningTeam.name} wins ${newScore}-${otherTeamScore}!`,
          });
        }
        
        return {
          ...game,
          [`${team}Score`]: newScore,
          isComplete
        };
      }
      return game;
    });
    
    onGameUpdate(updatedGames);
    
    // Check if phase should advance
    checkPhaseProgression(updatedGames);
  };

  const updateTeamStats = (winnerTeamId: string, loserTeamId: string, winnerScore: number, loserScore: number) => {
    const updatedTeams = teams.map(team => {
      if (team.id === winnerTeamId) {
        return {
          ...team,
          wins: team.wins + 1,
          pointsFor: team.pointsFor + winnerScore,
          pointsAgainst: team.pointsAgainst + loserScore
        };
      } else if (team.id === loserTeamId) {
        return {
          ...team,
          losses: team.losses + 1,
          pointsFor: team.pointsFor + loserScore,
          pointsAgainst: team.pointsAgainst + winnerScore
        };
      }
      return team;
    });
    
    onTeamUpdate(updatedTeams);
  };

  const checkPhaseProgression = (updatedGames: Game[]) => {
    const groupGames = updatedGames.filter(g => g.phase === 'group');
    const allGroupGamesComplete = groupGames.length > 0 && groupGames.every(g => g.isComplete);
    
    if (allGroupGamesComplete && currentPhase === 'group') {
      generateKnockoutPhase('quarterfinal', updatedGames);
    }
  };

  const generateKnockoutPhase = (phase: 'quarterfinal' | 'semifinal' | 'final', currentGames: Game[]) => {
    const topTeams = getTopTeamsFromGroups();
    
    if (topTeams.length < 8) {
      toast({
        title: "Not Ready",
        description: "Need at least 8 teams to generate knockout phase",
        variant: "destructive",
      });
      return;
    }

    let newGames: Game[] = [];
    let gameId = Date.now();

    if (phase === 'quarterfinal') {
      // Generate quarterfinals with top 2 from each group
      const quarterfinalPairs = [
        [topTeams[0], topTeams[7]], // Group A 1st vs Group D 2nd
        [topTeams[1], topTeams[6]], // Group B 1st vs Group C 2nd
        [topTeams[2], topTeams[5]], // Group C 1st vs Group B 2nd
        [topTeams[3], topTeams[4]], // Group D 1st vs Group A 2nd
      ];

      newGames = quarterfinalPairs.map((pair, index) => ({
        id: (gameId++).toString(),
        team1: pair[0],
        team2: pair[1],
        team1Score: 0,
        team2Score: 0,
        isComplete: false,
        field: `Field ${(index % 4) + 1}`,
        time: `${14 + Math.floor(index / 2)}:00`,
        phase: 'quarterfinal' as const,
      }));

      onPhaseChange('quarterfinal');
      toast({
        title: "Quarterfinals Generated!",
        description: "Knockout phase has begun!",
      });
    }

    onGameUpdate([...currentGames, ...newGames]);
  };

  const getTopTeamsFromGroups = () => {
    const groups = ['A', 'B', 'C', 'D'];
    const topTeams: Team[] = [];

    groups.forEach(group => {
      const groupTeams = teams
        .filter(team => team.group === group)
        .sort((a, b) => {
          if (a.wins !== b.wins) return b.wins - a.wins;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });
      
      topTeams.push(...groupTeams.slice(0, 2));
    });

    return topTeams;
  };

  const activeGames = games.filter(g => !g.isComplete);
  const completedGames = games.filter(g => g.isComplete);

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center">
        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white">
          {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
        </Badge>
      </div>

      {/* Active Games */}
      {activeGames.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Play className="text-green-500" size={24} />
            Active Games
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeGames.map(game => (
              <Card key={game.id} className="bg-white/90 backdrop-blur-sm border-2 border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{game.field}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      {game.time}
                    </div>
                  </div>
                  {game.group && <Badge variant="outline">Group {game.group}</Badge>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{game.team1.name}</span>
                      <Badge variant="outline">Group {game.team1.group}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateScore(game.id, 'team1', -1)}
                        disabled={game.team1Score === 0}
                      >
                        <Minus size={16} />
                      </Button>
                      <div className="text-3xl font-bold text-blue-600 min-w-[3rem] text-center">
                        {game.team1Score}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => updateScore(game.id, 'team1', 1)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="text-center text-xl font-bold text-gray-500">VS</div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{game.team2.name}</span>
                      <Badge variant="outline">Group {game.team2.group}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateScore(game.id, 'team2', -1)}
                        disabled={game.team2Score === 0}
                      >
                        <Minus size={16} />
                      </Button>
                      <div className="text-3xl font-bold text-orange-600 min-w-[3rem] text-center">
                        {game.team2Score}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => updateScore(game.id, 'team2', 1)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Games */}
      {completedGames.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            Completed Games
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGames.slice(-6).map(game => (
              <Card key={game.id} className="bg-white/90 backdrop-blur-sm border border-gray-200">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-600">{game.field} • {game.time}</div>
                    <div className="flex items-center justify-center gap-2 text-lg font-bold">
                      <span className={game.team1Score > game.team2Score ? 'text-green-600' : 'text-gray-600'}>
                        {game.team1.name}
                      </span>
                      <span className="text-2xl">{game.team1Score}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-2xl">{game.team2Score}</span>
                      <span className={game.team2Score > game.team1Score ? 'text-green-600' : 'text-gray-600'}>
                        {game.team2.name}
                      </span>
                    </div>
                    {game.group && <Badge variant="outline" className="text-xs">Group {game.group}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeGames.length === 0 && completedGames.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 text-lg">
              No games scheduled. Use the Admin Panel to create games.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScoreBoard;
