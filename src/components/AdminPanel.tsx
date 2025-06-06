
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, Plus, Trash2, Users, Settings, Edit, ArrowRight } from 'lucide-react';
import { Team, Game, TournamentSettings } from '@/pages/Index';
import { toast } from "@/hooks/use-toast";
import GameSettings from './GameSettings';

interface AdminPanelProps {
  teams: Team[];
  games: Game[];
  onTeamUpdate: (teams: Team[]) => void;
  onGameUpdate: (games: Game[]) => void;
  isAuthenticated: boolean;
  onAuthChange: (authenticated: boolean) => void;
  tournamentSettings: TournamentSettings;
  onSettingsUpdate: (settings: TournamentSettings) => void;
  onResetTournament: () => void;
  currentPhase: 'group' | 'quarterfinal' | 'semifinal' | 'final';
  onPhaseChange: (phase: 'group' | 'quarterfinal' | 'semifinal' | 'final') => void;
  generateRoundRobinGames: () => Promise<boolean>;
}

const AdminPanel = ({ 
  teams, 
  games, 
  onTeamUpdate, 
  onGameUpdate, 
  isAuthenticated, 
  onAuthChange,
  tournamentSettings,
  onSettingsUpdate,
  onResetTournament,
  currentPhase,
  onPhaseChange
}: AdminPanelProps) => {
  const [password, setPassword] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamGroup, setEditTeamGroup] = useState('');

  const getGroupNames = () => {
    const groups = [];
    for (let i = 0; i < tournamentSettings.numberOfGroups; i++) {
      groups.push(String.fromCharCode(65 + i)); // A, B, C, D, etc.
    }
    return groups;
  };

  const getCourtNames = () => {
    const courts = [];
    for (let i = 1; i <= tournamentSettings.numberOfCourts; i++) {
      courts.push(`Court ${i}`);
    }
    return courts;
  };

  const handleLogin = () => {
    if (password === tournamentSettings.adminPassword) {
      onAuthChange(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
    setPassword('');
  };

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    
    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      group: selectedGroup,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      setsWon: 0,
      setsLost: 0,
    };

    onTeamUpdate([...teams, newTeam]);
    setNewTeamName('');
    toast({
      title: "Team Added",
      description: `${newTeam.name} has been added to Group ${selectedGroup}`,
    });
  };

  const startEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamGroup(team.group);
  };

  const saveEditTeam = () => {
    if (!editingTeam || !editTeamName.trim()) return;

    const updatedTeams = teams.map(team => 
      team.id === editingTeam.id 
        ? { ...team, name: editTeamName.trim(), group: editTeamGroup }
        : team
    );

    onTeamUpdate(updatedTeams);
    setEditingTeam(null);
    setEditTeamName('');
    setEditTeamGroup('');
    
    toast({
      title: "Team Updated",
      description: `Team has been successfully updated`,
    });
  };

  const removeTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    onTeamUpdate(updatedTeams);
    
    const updatedGames = games.filter(game => 
      game.team1.id !== teamId && game.team2.id !== teamId
    );
    onGameUpdate(updatedGames);
    
    toast({
      title: "Team Removed",
      description: "Team and associated games have been removed",
    });
  };

  const generateRoundRobin = () => {
    const newGames: Game[] = [];
    let gameId = Date.now();
    const groups = getGroupNames();
    const courts = getCourtNames();

    groups.forEach(group => {
      const groupTeams = teams.filter(team => team.group === group);
      
      if (groupTeams.length < 2) return;

      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const courtIndex = newGames.length % courts.length;
          
          const newGame: Game = {
            id: (gameId++).toString(),
            team1: groupTeams[i],
            team2: groupTeams[j],
            sets: [{
              team1Score: 0,
              team2Score: 0,
              isComplete: false
            }],
            currentSet: 0,
            isComplete: false,
            field: courts[courtIndex],
            phase: 'group',
            group: group,
            isRunning: false,
            team1Score: 0,
            team2Score: 0,
            time: '00:00',
          };

          if (tournamentSettings.winCondition === 'sets') {
            newGame.sets = Array(tournamentSettings.numberOfSets).fill(null).map(() => ({
              team1Score: 0,
              team2Score: 0,
              isComplete: false
            }));
          }

          newGames.push(newGame);
        }
      }
    });

    onGameUpdate([...games, ...newGames]);
    toast({
      title: "Round Robin Generated",
      description: `${newGames.length} group stage games created`,
    });
  };

  const resetAllGroups = () => {
    const resetTeams = teams.map(team => ({
      ...team,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      setsWon: 0,
      setsLost: 0,
    }));

    onTeamUpdate(resetTeams);
    onGameUpdate([]);
    
    toast({
      title: "Groups Reset",
      description: "All group statistics have been reset",
    });
  };

  const startGame = (gameId: string) => {
    const updatedGames = games.map(game =>
      game.id === gameId ? { ...game, isRunning: true } : game
    );
    onGameUpdate(updatedGames);
    
    toast({
      title: "Game Started",
      description: "Game is now live and can be scored",
    });
  };

  const stopGame = (gameId: string) => {
    const updatedGames = games.map(game =>
      game.id === gameId ? { ...game, isRunning: false } : game
    );
    onGameUpdate(updatedGames);
    
    toast({
      title: "Game Stopped",
      description: "Game is no longer live",
    });
  };

  const generateKnockoutGames = () => {
    let qualifiedTeams: Team[] = [];

    if (tournamentSettings.numberOfGroups === 1) {
      // Single group - take top 8 teams based on current standings
      const groupTeams = teams
        .filter(team => team.group === 'A')
        .sort((a, b) => {
          if (a.wins !== b.wins) return b.wins - a.wins;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });
      
      qualifiedTeams = groupTeams.slice(0, 8);
      
      if (qualifiedTeams.length < 8) {
        // If not enough teams, just take what we have and warn
        qualifiedTeams = groupTeams;
        if (qualifiedTeams.length < 4) {
          toast({
            title: "Not Enough Teams",
            description: `Need at least 4 teams. Currently have ${qualifiedTeams.length} teams.`,
            variant: "destructive",
          });
          return;
        }
      }
    } else {
      // Multiple groups - take top teams from each group (or all available teams if not enough)
      qualifiedTeams = getQualifiedTeamsFlexible();
      
      if (qualifiedTeams.length < 4) {
        toast({
          title: "Not Enough Teams",
          description: `Need at least 4 teams. Currently have ${qualifiedTeams.length} teams.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Pad with dummy teams if needed for bracket structure
    while (qualifiedTeams.length < 8) {
      qualifiedTeams.push({
        id: `dummy-${qualifiedTeams.length}`,
        name: `TBD ${qualifiedTeams.length + 1}`,
        group: '',
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        setsWon: 0,
        setsLost: 0
      });
    }

    const newGames: Game[] = [];
    let gameId = Date.now();
    const courts = getCourtNames();

    // Generate Quarterfinals
    const quarterfinalMatchups = [
      [qualifiedTeams[0], qualifiedTeams[7]], // 1st vs 8th
      [qualifiedTeams[1], qualifiedTeams[6]], // 2nd vs 7th
      [qualifiedTeams[2], qualifiedTeams[5]], // 3rd vs 6th
      [qualifiedTeams[3], qualifiedTeams[4]], // 4th vs 5th
    ];

    quarterfinalMatchups.forEach((matchup, index) => {
      const courtIndex = index % courts.length;
      
      const newGame: Game = {
        id: (gameId++).toString(),
        team1: matchup[0],
        team2: matchup[1],
        sets: [{
          team1Score: 0,
          team2Score: 0,
          isComplete: false
        }],
        currentSet: 0,
        isComplete: false,
        field: courts[courtIndex],
        phase: 'quarterfinal',
        isRunning: false,
        team1Score: 0,
        team2Score: 0,
        time: '00:00'
      };

      if (tournamentSettings.winCondition === 'sets') {
        newGame.sets = Array(tournamentSettings.numberOfSets).fill(null).map(() => ({
          team1Score: 0,
          team2Score: 0,
          isComplete: false
        }));
      }

      newGames.push(newGame);
    });

    // Generate placeholder Semifinals
    for (let i = 0; i < 2; i++) {
      const newGame: Game = {
        id: (gameId++).toString(),
        team1: { id: '', name: `QF Winner ${i * 2 + 1}`, group: '', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, setsWon: 0, setsLost: 0 },
        team2: { id: '', name: `QF Winner ${i * 2 + 2}`, group: '', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, setsWon: 0, setsLost: 0 },
        sets: [{
          team1Score: 0,
          team2Score: 0,
          isComplete: false
        }],
        currentSet: 0,
        isComplete: false,
        field: courts[i % courts.length],
        phase: 'semifinal',
        isRunning: false,
        team1Score: 0,
        team2Score: 0,
        time: '00:00'
      };

      if (tournamentSettings.winCondition === 'sets') {
        newGame.sets = Array(tournamentSettings.numberOfSets).fill(null).map(() => ({
          team1Score: 0,
          team2Score: 0,
          isComplete: false
        }));
      }

      newGames.push(newGame);
    }

    // Generate placeholder Final
    const finalGame: Game = {
      id: (gameId++).toString(),
      team1: { id: '', name: 'SF Winner 1', group: '', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, setsWon: 0, setsLost: 0 },
      team2: { id: '', name: 'SF Winner 2', group: '', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, setsWon: 0, setsLost: 0 },
      sets: [{
        team1Score: 0,
        team2Score: 0,
        isComplete: false
      }],
      currentSet: 0,
      isComplete: false,
      field: courts[0],
      phase: 'final',
      isRunning: false,
      team1Score: 0,
      team2Score: 0,
      time: '00:00'
    };

    if (tournamentSettings.winCondition === 'sets') {
      finalGame.sets = Array(tournamentSettings.numberOfSets).fill(null).map(() => ({
        team1Score: 0,
        team2Score: 0,
        isComplete: false
      }));
    }

    newGames.push(finalGame);

    onGameUpdate([...games, ...newGames]);
    onPhaseChange('quarterfinal');
    
    toast({
      title: "Knockout Stage Generated",
      description: `Generated ${newGames.length} knockout games with ${qualifiedTeams.filter(t => !t.id.startsWith('dummy')).length} real teams`,
    });
  };

  const getQualifiedTeamsFlexible = () => {
    const groups = getGroupNames();
    const qualifiedTeams: Team[] = [];

    groups.forEach(group => {
      const groupTeams = teams
        .filter(team => team.group === group)
        .sort((a, b) => {
          if (a.wins !== b.wins) return b.wins - a.wins;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });
      
      // Take top 2 teams from each group, or all if less than 2
      qualifiedTeams.push(...groupTeams.slice(0, Math.min(2, groupTeams.length)));
    });

    // If we still don't have enough teams, take more from the groups
    if (qualifiedTeams.length < 8) {
      const remainingTeams = teams
        .filter(team => !qualifiedTeams.some(qt => qt.id === team.id))
        .sort((a, b) => {
          if (a.wins !== b.wins) return b.wins - a.wins;
          return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
        });
      
      qualifiedTeams.push(...remainingTeams.slice(0, 8 - qualifiedTeams.length));
    }

    return qualifiedTeams;
  };

  const addManualGame = () => {
    if (!selectedTeam1 || !selectedTeam2 || selectedTeam1 === selectedTeam2) {
      toast({
        title: "Invalid Selection",
        description: "Please select two different teams",
        variant: "destructive",
      });
      return;
    }

    const team1 = teams.find(t => t.id === selectedTeam1);
    const team2 = teams.find(t => t.id === selectedTeam2);
    
    if (!team1 || !team2) return;

    const courts = getCourtNames();
    const courtIndex = games.length % courts.length;

    const newGame: Game = {
      id: Date.now().toString(),
      team1,
      team2,
      sets: [{
        team1Score: 0,
        team2Score: 0,
        isComplete: false
      }],
      currentSet: 0,
      isComplete: false,
      field: courts[courtIndex],
      phase: currentPhase,
      group: currentPhase === 'group' ? team1.group : undefined,
      isRunning: false,
      team1Score: 0,
      team2Score: 0,
    };

    if (tournamentSettings.winCondition === 'sets') {
      newGame.sets = Array(tournamentSettings.numberOfSets).fill(null).map(() => ({
        team1Score: 0,
        team2Score: 0,
        isComplete: false
      }));
    }

    onGameUpdate([...games, newGame]);
    setSelectedTeam1('');
    setSelectedTeam2('');
    
    toast({
      title: "Game Added",
      description: `${team1.name} vs ${team2.name} has been scheduled`,
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="text-orange-500" size={24} />
            Admin Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">Enter Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password..."
              className="mt-1"
            />
          </div>
          <Button onClick={handleLogin} className="w-full bg-orange-500 hover:bg-orange-600">
            Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  const runningGames = games.filter(g => g.isRunning);
  const pendingGames = games.filter(g => !g.isComplete && !g.isRunning);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tournament Administration</h2>
        <Button 
          onClick={() => onAuthChange(false)} 
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tournament Settings */}
        <GameSettings 
          settings={tournamentSettings}
          onSettingsUpdate={onSettingsUpdate}
        />

        {/* Team Management */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-blue-500" size={20} />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name..."
                />
              </div>
              <div>
                <Label>Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getGroupNames().map(group => (
                      <SelectItem key={group} value={group}>Group {group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addTeam} className="w-full bg-blue-500 hover:bg-blue-600">
              <Plus size={16} className="mr-2" />
              Add Team
            </Button>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Group {team.group}</Badge>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEditTeam(team)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => removeTeam(team.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Game Addition */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="text-green-500" size={20} />
            Add Manual Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <Label>Team 1</Label>
              <Select value={selectedTeam1} onValueChange={setSelectedTeam1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team 1" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} (Group {team.group})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Team 2</Label>
              <Select value={selectedTeam2} onValueChange={setSelectedTeam2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team 2" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} (Group {team.group})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addManualGame} className="bg-green-500 hover:bg-green-600">
              <Plus size={16} className="mr-2" />
              Add Game
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Running Games */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-600">Running Games</CardTitle>
          </CardHeader>
          <CardContent>
            {runningGames.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No games currently running</p>
            ) : (
              <div className="space-y-2">
                {runningGames.map(game => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">{game.team1.name} vs {game.team2.name}</div>
                      <div className="text-sm text-gray-600">{game.field}</div>
                    </div>
                    <Button
                      onClick={() => stopGame(game.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600"
                    >
                      Stop
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Games */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-600">Pending Games</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingGames.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending games</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingGames.slice(0, 5).map(game => (
                  <div key={game.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium">{game.team1.name} vs {game.team2.name}</div>
                      <div className="text-sm text-gray-600">{game.field}</div>
                    </div>
                    <Button
                      onClick={() => startGame(game.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={generateRoundRobin} 
              className="bg-purple-500 hover:bg-purple-600"
              disabled={teams.length < 2}
            >
              Generate Round Robin
            </Button>
            
            <Button 
              onClick={generateKnockoutGames} 
              className="bg-orange-500 hover:bg-orange-600"
              disabled={teams.length < 4}
            >
              <ArrowRight size={16} className="mr-2" />
              Force Generate Knockout Stage
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-yellow-300 text-yellow-600">
                  Reset All Groups
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset All Groups</DialogTitle>
                </DialogHeader>
                <p>This will reset all team statistics but keep teams and settings. Continue?</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={resetAllGroups} className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                    Yes, Reset Groups
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Reset Tournament
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Entire Tournament</DialogTitle>
                </DialogHeader>
                <p>This will delete all teams, games, and reset to default settings. Are you sure?</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={onResetTournament} variant="destructive" className="flex-1">
                    Yes, Reset Everything
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Edit Team Dialog */}
      {editingTeam && (
        <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  placeholder="Enter team name..."
                />
              </div>
              <div>
                <Label>Group</Label>
                <Select value={editTeamGroup} onValueChange={setEditTeamGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getGroupNames().map(group => (
                      <SelectItem key={group} value={group}>Group {group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEditTeam} className="flex-1">
                  Save Changes
                </Button>
                <Button onClick={() => setEditingTeam(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPanel;
