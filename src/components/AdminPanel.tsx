
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lock, Plus, Trash2, Users, Settings } from 'lucide-react';
import { Team, Game } from '@/pages/Index';
import { toast } from "@/hooks/use-toast";

interface AdminPanelProps {
  teams: Team[];
  games: Game[];
  onTeamUpdate: (teams: Team[]) => void;
  onGameUpdate: (games: Game[]) => void;
  isAuthenticated: boolean;
  onAuthChange: (authenticated: boolean) => void;
}

const AdminPanel = ({ teams, games, onTeamUpdate, onGameUpdate, isAuthenticated, onAuthChange }: AdminPanelProps) => {
  const [password, setPassword] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [newField, setNewField] = useState('');
  const [newTime, setNewTime] = useState('');
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');

  const ADMIN_PASSWORD = 'admin123';
  const GROUPS = ['A', 'B', 'C', 'D'];
  const FIELDS = ['Field 1', 'Field 2', 'Field 3', 'Field 4'];

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
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
    };

    onTeamUpdate([...teams, newTeam]);
    setNewTeamName('');
    toast({
      title: "Team Added",
      description: `${newTeam.name} has been added to Group ${selectedGroup}`,
    });
  };

  const removeTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    onTeamUpdate(updatedTeams);
    
    // Remove games involving this team
    const updatedGames = games.filter(game => 
      game.team1.id !== teamId && game.team2.id !== teamId
    );
    onGameUpdate(updatedGames);
    
    toast({
      title: "Team Removed",
      description: "Team and associated games have been removed",
    });
  };

  const createGame = () => {
    if (!selectedTeam1 || !selectedTeam2 || !newField || !newTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to create a game",
        variant: "destructive",
      });
      return;
    }

    if (selectedTeam1 === selectedTeam2) {
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

    const newGame: Game = {
      id: Date.now().toString(),
      team1,
      team2,
      team1Score: 0,
      team2Score: 0,
      isComplete: false,
      field: newField,
      time: newTime,
      phase: 'group',
      group: team1.group === team2.group ? team1.group : undefined,
    };

    onGameUpdate([...games, newGame]);
    setSelectedTeam1('');
    setSelectedTeam2('');
    setNewField('');
    setNewTime('');
    
    toast({
      title: "Game Created",
      description: `${team1.name} vs ${team2.name} scheduled for ${newTime}`,
    });
  };

  const generateGroupStageGames = () => {
    const newGames: Game[] = [];
    let gameId = Date.now();

    GROUPS.forEach(group => {
      const groupTeams = teams.filter(team => team.group === group);
      
      // Generate round-robin for each group
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const fieldIndex = newGames.length % FIELDS.length;
          const timeSlot = Math.floor(newGames.length / FIELDS.length) + 9; // Start at 9 AM
          
          newGames.push({
            id: (gameId++).toString(),
            team1: groupTeams[i],
            team2: groupTeams[j],
            team1Score: 0,
            team2Score: 0,
            isComplete: false,
            field: FIELDS[fieldIndex],
            time: `${timeSlot}:00`,
            phase: 'group',
            group: group,
          });
        }
      }
    });

    onGameUpdate([...games, ...newGames]);
    toast({
      title: "Group Stage Generated",
      description: `${newGames.length} group stage games created`,
    });
  };

  const resetTournament = () => {
    onTeamUpdate([]);
    onGameUpdate([]);
    toast({
      title: "Tournament Reset",
      description: "All teams and games have been cleared",
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
                    {GROUPS.map(group => (
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
                  <Button
                    onClick={() => removeTeam(team.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Management */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-green-500" size={20} />
              Game Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Team 1</Label>
                <Select value={selectedTeam1} onValueChange={setSelectedTeam1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team..." />
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
                    <SelectValue placeholder="Select team..." />
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
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Field</Label>
                <Select value={newField} onValueChange={setNewField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={createGame} className="w-full bg-green-500 hover:bg-green-600">
              <Plus size={16} className="mr-2" />
              Create Game
            </Button>

            <div className="flex gap-2">
              <Button 
                onClick={generateGroupStageGames} 
                className="flex-1 bg-purple-500 hover:bg-purple-600"
                disabled={teams.length < 8}
              >
                Generate Group Stage
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    Reset Tournament
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Reset</DialogTitle>
                  </DialogHeader>
                  <p>This will delete all teams and games. Are you sure?</p>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={resetTournament} variant="destructive" className="flex-1">
                      Yes, Reset Everything
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
