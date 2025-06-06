
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Team, Game, TournamentSettings } from '@/pages/Index';
import { Plus, Minus, Trophy, Clock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ScoreBoardProps {
  games: Game[];
  onGameUpdate: (games: Game[]) => void;
  teams: Team[];
  onTeamUpdate: (teams: Team[]) => void;
  currentPhase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
  onPhaseChange: (phase: 'group' | 'quarterfinal' | 'semifinal' | 'final') => void;
  tournamentSettings: TournamentSettings;
}

const ScoreBoard = ({ 
  games, 
  onGameUpdate, 
  teams, 
  onTeamUpdate, 
  currentPhase, 
  onPhaseChange,
  tournamentSettings 
}: ScoreBoardProps) => {
  const updateScore = (gameId: string, team: 'team1' | 'team2', change: number) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId && !game.isComplete && game.isRunning) {
        const currentSet = game.sets[game.currentSet];
        if (!currentSet || currentSet.isComplete) return game;

        const newScore = Math.max(0, currentSet[`${team}Score`] + change);
        const otherTeamScore = team === 'team1' ? currentSet.team2Score : currentSet.team1Score;
        
        let isSetComplete = false;
        let isGameComplete = false;
        let newCurrentSet = game.currentSet;

        // Check win conditions
        if (tournamentSettings.winCondition === 'points') {
          isSetComplete = newScore >= tournamentSettings.pointsToWin;
        } else if (tournamentSettings.winCondition === 'sets') {
          isSetComplete = newScore >= 25 || (newScore >= 15 && Math.abs(newScore - otherTeamScore) >= 2);
        }

        const updatedSets = game.sets.map((set, index) => {
          if (index === game.currentSet) {
            return {
              ...set,
              [`${team}Score`]: newScore,
              isComplete: isSetComplete
            };
          }
          return set;
        });

        // Check if we need to start a new set or complete the game
        if (isSetComplete && tournamentSettings.winCondition === 'sets') {
          const team1SetsWon = updatedSets.filter(set => set.isComplete && set.team1Score > set.team2Score).length;
          const team2SetsWon = updatedSets.filter(set => set.isComplete && set.team2Score > set.team1Score).length;
          
          if (team1SetsWon >= tournamentSettings.setsToWin || team2SetsWon >= tournamentSettings.setsToWin) {
            isGameComplete = true;
          } else if (newCurrentSet + 1 < tournamentSettings.numberOfSets) {
            newCurrentSet = newCurrentSet + 1;
          }
        } else if (isSetComplete && tournamentSettings.winCondition === 'points') {
          isGameComplete = true;
        }

        if (isGameComplete) {
          const winningTeam = team === 'team1' ? game.team1 : game.team2;
          const losingTeam = team === 'team1' ? game.team2 : game.team1;
          
          updateTeamStats(winningTeam.id, losingTeam.id, newScore, otherTeamScore, updatedSets);
          
          toast({
            title: "Game Complete!",
            description: `${winningTeam.name} wins!`,
          });
        }
        
        return {
          ...game,
          sets: updatedSets,
          currentSet: newCurrentSet,
          isComplete: isGameComplete,
          isRunning: isGameComplete ? false : game.isRunning,
          winner: isGameComplete ? (team === 'team1' ? game.team1 : game.team2) : undefined
        };
      }
      return game;
    });
    
    onGameUpdate(updatedGames);
    checkPhaseProgression(updatedGames);
  };

  const updateTeamStats = (winnerTeamId: string, loserTeamId: string, winnerScore: number, loserScore: number, sets: any[]) => {
    const updatedTeams = teams.map(team => {
      if (team.id === winnerTeamId) {
        const setsWon = sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length;
        const setsLost = sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length;
        
        return {
          ...team,
          wins: team.wins + 1,
          pointsFor: team.pointsFor + winnerScore,
          pointsAgainst: team.pointsAgainst + loserScore,
          setsWon: team.setsWon + setsWon,
          setsLost: team.setsLost + setsLost
        };
      } else if (team.id === loserTeamId) {
        const setsWon = sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length;
        const setsLost = sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length;
        
        return {
          ...team,
          losses: team.losses + 1,
          pointsFor: team.pointsFor + loserScore,
          pointsAgainst: team.pointsAgainst + winnerScore,
          setsWon: team.setsWon + setsWon,
          setsLost: team.setsLost + setsLost
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
      const quarterfinalPairs = [
        [topTeams[0], topTeams[7]],
        [topTeams[1], topTeams[6]],
        [topTeams[2], topTeams[5]],
        [topTeams[3], topTeams[4]],
      ];

      newGames = quarterfinalPairs.map((pair, index) => ({
        id: (gameId++).toString(),
        team1: pair[0],
        team2: pair[1],
        sets: [{
          team1Score: 0,
          team2Score: 0,
          isComplete: false
        }],
        currentSet: 0,
        isComplete: false,
        field: `Court ${(index % tournamentSettings.numberOfCourts) + 1}`,
        phase: 'quarterfinal' as const,
        isRunning: false,
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
    const groups = Array.from({length: tournamentSettings.numberOfGroups}, (_, i) => String.fromCharCode(65 + i));
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

  const runningGames = games.filter(g => g.isRunning);
  const completedGames = games.filter(g => g.isComplete);

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="text-center">
        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white">
          {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
        </Badge>
      </div>

      {/* Running Games */}
      {runningGames.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-green-500" size={24} />
            Live Games (Admin Can Edit)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {runningGames.map(game => {
              const currentSet = game.sets[game.currentSet] || { team1Score: 0, team2Score: 0, isComplete: false };
              
              return (
                <Card key={game.id} className="bg-white/90 backdrop-blur-sm border-2 border-green-400">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{game.field}</CardTitle>
                      <Badge className="bg-green-500 text-white">LIVE</Badge>
                    </div>
                    {game.group && <Badge variant="outline">Group {game.group}</Badge>}
                    {tournamentSettings.winCondition === 'sets' && (
                      <Badge variant="outline">Set {game.currentSet + 1}/{tournamentSettings.numberOfSets}</Badge>
                    )}
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
                          disabled={currentSet.team1Score === 0}
                        >
                          <Minus size={16} />
                        </Button>
                        <div className="text-3xl font-bold text-blue-600 min-w-[3rem] text-center">
                          {currentSet.team1Score}
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
                          disabled={currentSet.team2Score === 0}
                        >
                          <Minus size={16} />
                        </Button>
                        <div className="text-3xl font-bold text-orange-600 min-w-[3rem] text-center">
                          {currentSet.team2Score}
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

                    {/* Sets Display for multi-set games */}
                    {tournamentSettings.winCondition === 'sets' && game.sets.length > 1 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Sets Won</div>
                        <div className="flex justify-between">
                          <span>
                            {game.team1.name}: {game.sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length}
                          </span>
                          <span>
                            {game.team2.name}: {game.sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
            {completedGames.slice(-6).map(game => {
              const finalScore = tournamentSettings.winCondition === 'sets' 
                ? {
                    team1: game.sets.filter(set => set.isComplete && set.team1Score > set.team2Score).length,
                    team2: game.sets.filter(set => set.isComplete && set.team2Score > set.team1Score).length
                  }
                : {
                    team1: game.sets[0]?.team1Score || 0,
                    team2: game.sets[0]?.team2Score || 0
                  };

              return (
                <Card key={game.id} className="bg-white/90 backdrop-blur-sm border border-gray-200">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-sm text-gray-600">{game.field}</div>
                      <div className="flex items-center justify-center gap-2 text-lg font-bold">
                        <span className={finalScore.team1 > finalScore.team2 ? 'text-green-600' : 'text-gray-600'}>
                          {game.team1.name}
                        </span>
                        <span className="text-2xl">{finalScore.team1}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-2xl">{finalScore.team2}</span>
                        <span className={finalScore.team2 > finalScore.team1 ? 'text-green-600' : 'text-gray-600'}>
                          {game.team2.name}
                        </span>
                      </div>
                      {game.group && <Badge variant="outline" className="text-xs">Group {game.group}</Badge>}
                      {game.winner && (
                        <div className="text-sm text-green-600 font-medium">
                          🏆 {game.winner.name} wins!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {runningGames.length === 0 && completedGames.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 text-lg">
              No games available. Use the Admin Panel to create and start games.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScoreBoard;
