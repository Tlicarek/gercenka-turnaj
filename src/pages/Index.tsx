
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPanel from '@/components/AdminPanel';
import ScoreBoard from '@/components/ScoreBoard';
import GroupStandings from '@/components/GroupStandings';
import TournamentBracket from '@/components/TournamentBracket';
import FieldSchedule from '@/components/FieldSchedule';
import { Trophy, Users, Calendar, Target } from 'lucide-react';

export interface Team {
  id: string;
  name: string;
  group: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Game {
  id: string;
  team1: Team;
  team2: Team;
  team1Score: number;
  team2Score: number;
  isComplete: boolean;
  field: string;
  time: string;
  phase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
  group?: string;
}

const Index = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'group' | 'quarterfinal' | 'semifinal' | 'final'>('group');

  const handleTeamUpdate = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
  };

  const handleGameUpdate = (updatedGames: Game[]) => {
    setGames(updatedGames);
  };

  const stats = {
    totalTeams: teams.length,
    completedGames: games.filter(g => g.isComplete).length,
    totalGames: games.length,
    activeFields: new Set(games.filter(g => !g.isComplete).map(g => g.field)).size
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-orange-500" size={48} />
            Volleyball Tournament Manager
          </h1>
          <p className="text-xl text-gray-600">Professional tournament management system</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardContent className="p-4 text-center">
              <Users className="text-orange-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">{stats.totalTeams}</div>
              <div className="text-sm text-gray-600">Teams</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <Target className="text-blue-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">{stats.completedGames}/{stats.totalGames}</div>
              <div className="text-sm text-gray-600">Games Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <Calendar className="text-green-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">{stats.activeFields}</div>
              <div className="text-sm text-gray-600">Active Fields</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className="p-4 text-center">
              <Trophy className="text-purple-500 mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800 capitalize">{currentPhase}</div>
              <div className="text-sm text-gray-600">Current Phase</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scoreboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="scoreboard">Live Scores</TabsTrigger>
            <TabsTrigger value="standings">Group Standings</TabsTrigger>
            <TabsTrigger value="bracket">Tournament Bracket</TabsTrigger>
            <TabsTrigger value="schedule">Field Schedule</TabsTrigger>
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
          </TabsList>

          <TabsContent value="scoreboard">
            <ScoreBoard 
              games={games} 
              onGameUpdate={handleGameUpdate}
              teams={teams}
              onTeamUpdate={handleTeamUpdate}
              currentPhase={currentPhase}
              onPhaseChange={setCurrentPhase}
            />
          </TabsContent>

          <TabsContent value="standings">
            <GroupStandings teams={teams} />
          </TabsContent>

          <TabsContent value="bracket">
            <TournamentBracket 
              teams={teams} 
              games={games} 
              currentPhase={currentPhase}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <FieldSchedule games={games} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel 
              teams={teams}
              games={games}
              onTeamUpdate={handleTeamUpdate}
              onGameUpdate={handleGameUpdate}
              isAuthenticated={isAdminAuthenticated}
              onAuthChange={setIsAdminAuthenticated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
