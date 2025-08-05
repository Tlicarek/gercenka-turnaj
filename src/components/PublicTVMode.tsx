import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Clock, Target } from 'lucide-react';
import { Team, Game, TournamentSettings } from '@/pages/Index';

interface PublicTVModeProps {
  games: Game[];
  teams: Team[];
  tournamentSettings: TournamentSettings;
}

const PublicTVMode = ({ games, teams, tournamentSettings }: PublicTVModeProps) => {
  const runningGames = games.filter(g => g.isRunning);
  const nextGames = games.filter(g => !g.isComplete).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Tournament Live</h1>
        <p className="text-lg">Stay updated with the latest scores</p>
      </div>

      {/* Running Games */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Live Games</h2>
        {runningGames.length === 0 ? (
          <p className="text-gray-300">No games currently live.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runningGames.map(game => (
              <Card key={game.id} className="bg-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{game.team1.name} vs {game.team2.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg">Score</div>
                      <div className="text-3xl font-bold">{game.team1Score} - {game.team2Score}</div>
                    </div>
                    <div>
                      <Clock className="text-gray-400" size={32} />
                      <div className="text-sm text-gray-400">In Progress</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge className="bg-blue-500">Court: {game.field}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Games */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Next Up</h2>
        {nextGames.length === 0 ? (
          <p className="text-gray-300">No upcoming games scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextGames.map(game => (
              <Card key={game.id} className="bg-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{game.team1.name} vs {game.team2.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg">Teams</div>
                      <div className="text-gray-300">{game.team1.name}</div>
                      <div className="text-gray-300">{game.team2.name}</div>
                    </div>
                    <div>
                      <Target className="text-gray-400" size={32} />
                      <div className="text-sm text-gray-400">Coming Soon</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge className="bg-purple-500">Court: {game.field}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTVMode;
