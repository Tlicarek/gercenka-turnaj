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
import PublicTVMode from '@/components/PublicTVMode';
import { Trophy, Users, Calendar, Target, Tv } from 'lucide-react';

export interface Team {
  id: string;
  name: string;
  group: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  setsWon: number;
  setsLost: number;
}

export interface GameSet {
  team1Score: number;
  team2Score: number;
  isComplete: boolean;
}

export interface Game {
  id: string;
  team1: Team;
  team2: Team;
  sets: GameSet[];
  currentSet: number;
  isComplete: boolean;
  field: string;
  phase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
  group?: string;
  winner?: Team;
  isRunning: boolean;
  team1Score: number;
  team2Score: number;
  time?: string;
}

export interface TournamentSettings {
  numberOfCourts: number;
  numberOfGroups: number;
  winCondition: 'points' | 'time' | 'sets';
  pointsToWin: number;
  timeLimit: number; // in minutes
  numberOfSets: number;
  setsToWin: number;
}

const Index = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'group' | 'quarterfinal' | 'semifinal' | 'final'>('group');
  const [tournamentSettings, setTournamentSettings] = useState<TournamentSettings>({
    numberOfCourts: 4,
    numberOfGroups: 4,
    winCondition: 'points',
    pointsToWin: 15,
    timeLimit: 20,
    numberOfSets: 1,
    setsToWin: 1,
  });

  const handleTeamUpdate = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
  };

  const handleGameUpdate = (updatedGames: Game[]) => {
    setGames(updatedGames);
  };

  const handleSettingsUpdate = (newSettings: TournamentSettings) => {
    setTournamentSettings(newSettings);
  };

  const resetTournament = () => {
    setTeams([]);
    setGames([]);
    setCurrentPhase('group');
  };

  const stats = {
    totalTeams: teams.length,
    completedGames: games.filter(g => g.isComplete).length,
    totalGames: games.length,
    activeCourts: games.filter(g => g.isRunning).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-orange-500" size={48} />
            Tournament Manager Pro
          </h1>
          <p className="text-xl text-gray-600">Advanced tournament management system</p>
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
              <div className="text-2xl font-bold text-gray-800">{stats.activeCourts}/{tournamentSettings.numberOfCourts}</div>
              <div className="text-sm text-gray-600">Active Courts</div>
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
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="scoreboard">Live Scores</TabsTrigger>
            <TabsTrigger value="tv-mode">
              <Tv size={16} className="mr-2" />
              TV Mode
            </TabsTrigger>
            <TabsTrigger value="standings">Group Standings</TabsTrigger>
            <TabsTrigger value="bracket">Tournament Bracket</TabsTrigger>
            <TabsTrigger value="schedule">Court Schedule</TabsTrigger>
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
              tournamentSettings={tournamentSettings}
            />
          </TabsContent>

          <TabsContent value="tv-mode">
            <PublicTVMode 
              games={games}
              teams={teams}
              tournamentSettings={tournamentSettings}
            />
          </TabsContent>

          <TabsContent value="standings">
            <GroupStandings teams={teams} numberOfGroups={tournamentSettings.numberOfGroups} />
          </TabsContent>

          <TabsContent value="bracket">
            <TournamentBracket 
              teams={teams} 
              games={games} 
              currentPhase={currentPhase}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <FieldSchedule games={games} numberOfCourts={tournamentSettings.numberOfCourts} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel 
              teams={teams}
              games={games}
              onTeamUpdate={handleTeamUpdate}
              onGameUpdate={handleGameUpdate}
              isAuthenticated={isAdminAuthenticated}
              onAuthChange={setIsAdminAuthenticated}
              tournamentSettings={tournamentSettings}
              onSettingsUpdate={handleSettingsUpdate}
              onResetTournament={resetTournament}
              currentPhase={currentPhase}
              onPhaseChange={setCurrentPhase}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
