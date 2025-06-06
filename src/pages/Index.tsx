
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  pointsToWinSet: number; // Points needed to win each set
  adminPassword: string;
  teamsAdvancingFromGroup: 1 | 2; // New setting for advancement
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
    pointsToWinSet: 25,
    adminPassword: 'admin123',
    teamsAdvancingFromGroup: 2,
  });

  const isMobile = useIsMobile();

  const handleTeamUpdate = (updatedTeams: Team[]) => {
    setTeams(updatedTeams);
  };

  const handleGameUpdate = (updatedGames: Game[]) => {
    setGames(updatedGames);
  };

  const handleSettingsUpdate = (newSettings: TournamentSettings) => {
    setTournamentSettings(newSettings);
  };

  const generateGroupStageGames = () => {
    const groups = Array.from({length: tournamentSettings.numberOfGroups}, (_, i) => String.fromCharCode(65 + i));
    const newGames: Game[] = [];
    let gameId = Date.now();

    groups.forEach(groupLetter => {
      const groupTeams = teams.filter(team => team.group === groupLetter);
      
      // Generate round-robin matches for each group
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const game: Game = {
            id: (gameId++).toString(),
            team1: groupTeams[i],
            team2: groupTeams[j],
            sets: Array.from({length: tournamentSettings.numberOfSets}, () => ({
              team1Score: 0,
              team2Score: 0,
              isComplete: false
            })),
            currentSet: 0,
            isComplete: false,
            field: `Court ${((newGames.length) % tournamentSettings.numberOfCourts) + 1}`,
            phase: 'group',
            group: groupLetter,
            isRunning: false,
            team1Score: 0,
            team2Score: 0,
            time: '00:00'
          };
          newGames.push(game);
        }
      }
    });

    setGames(newGames);
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
      <div className="container mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-gray-800 mb-4 flex items-center justify-center gap-2 sm:gap-3`}>
            <Trophy className="text-orange-500" size={isMobile ? 32 : 48} />
            <span className={isMobile ? 'text-2xl' : ''}>Tournament Manager Pro</span>
          </h1>
          <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-600`}>Advanced tournament management system</p>
        </div>

        {/* Stats Overview */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-3 sm:gap-4 mb-6 sm:mb-8`}>
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
              <Users className="text-orange-500 mx-auto mb-2" size={isMobile ? 20 : 24} />
              <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>{stats.totalTeams}</div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Teams</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
              <Target className="text-blue-500 mx-auto mb-2" size={isMobile ? 20 : 24} />
              <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>{stats.completedGames}/{stats.totalGames}</div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Games</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
              <Calendar className="text-green-500 mx-auto mb-2" size={isMobile ? 20 : 24} />
              <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>{stats.activeCourts}/{tournamentSettings.numberOfCourts}</div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Courts</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
              <Trophy className="text-purple-500 mx-auto mb-2" size={isMobile ? 20 : 24} />
              <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 capitalize`}>{currentPhase}</div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Phase</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scoreboard" className="space-y-4 sm:space-y-6">
          <TabsList className={`${isMobile ? 'grid grid-cols-3 h-auto' : 'grid w-full grid-cols-6'} bg-white/80 backdrop-blur-sm`}>
            <TabsTrigger value="scoreboard" className={isMobile ? 'text-xs p-2' : ''}>
              {isMobile ? 'Scores' : 'Live Scores'}
            </TabsTrigger>
            <TabsTrigger value="tv-mode" className={isMobile ? 'text-xs p-2' : ''}>
              <Tv size={isMobile ? 14 : 16} className={isMobile ? 'mr-1' : 'mr-2'} />
              {isMobile ? 'TV' : 'TV Mode'}
            </TabsTrigger>
            <TabsTrigger value="standings" className={isMobile ? 'text-xs p-2' : ''}>
              {isMobile ? 'Groups' : 'Group Standings'}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="bracket">Tournament Bracket</TabsTrigger>
                <TabsTrigger value="schedule">Court Schedule</TabsTrigger>
                <TabsTrigger value="admin">Admin Panel</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Mobile additional tabs */}
          {isMobile && (
            <TabsList className="grid grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="bracket" className="text-xs p-2">Bracket</TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs p-2">Schedule</TabsTrigger>
              <TabsTrigger value="admin" className="text-xs p-2">Admin</TabsTrigger>
            </TabsList>
          )}

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
              onGenerateGroupStage={generateGroupStageGames}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
