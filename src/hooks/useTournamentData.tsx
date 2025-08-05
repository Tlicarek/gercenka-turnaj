
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team, Game, TournamentSettings, GameSet } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

export const useTournamentData = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
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

  // Load initial data
  useEffect(() => {
    loadTournamentSettings();
    loadTeams();
    loadGames();
  }, []);

  const loadTournamentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading tournament settings:', error);
        return;
      }

      if (data) {
        setTournamentSettings({
          numberOfCourts: data.number_of_courts,
          numberOfGroups: data.number_of_groups,
          winCondition: data.win_condition as 'points' | 'time' | 'sets',
          pointsToWin: data.points_to_win,
          timeLimit: data.time_limit,
          numberOfSets: data.number_of_sets,
          setsToWin: data.sets_to_win,
          pointsToWinSet: data.points_to_win_set,
          adminPassword: data.admin_password,
          teamsAdvancingFromGroup: data.teams_advancing_from_group as 1 | 2,
          autoStartDelay: data.auto_start_delay,
        });
      }
    } catch (error) {
      console.error('Error loading tournament settings:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('group_letter', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading teams:', error);
        return;
      }

      const mappedTeams: Team[] = data.map(team => ({
        id: team.id,
        name: team.name,
        group: team.group_letter,
        wins: team.wins,
        losses: team.losses,
        pointsFor: team.points_for,
        pointsAgainst: team.points_against,
        setsWon: team.sets_won,
        setsLost: team.sets_lost,
      }));

      setTeams(mappedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          team1:teams!games_team1_id_fkey(*),
          team2:teams!games_team2_id_fkey(*),
          winner:teams!games_winner_id_fkey(*)
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading games:', error);
        return;
      }

      const mappedGames: Game[] = data.map(game => {
        // Parse sets from Json to GameSet[]
        let parsedSets: GameSet[] = [];
        try {
          if (Array.isArray(game.sets)) {
            parsedSets = game.sets as GameSet[];
          } else if (typeof game.sets === 'string') {
            parsedSets = JSON.parse(game.sets);
          } else {
            parsedSets = [];
          }
        } catch (e) {
          console.error('Error parsing sets:', e);
          parsedSets = [];
        }

        return {
          id: game.id,
          team1: {
            id: game.team1.id,
            name: game.team1.name,
            group: game.team1.group_letter,
            wins: game.team1.wins,
            losses: game.team1.losses,
            pointsFor: game.team1.points_for,
            pointsAgainst: game.team1.points_against,
            setsWon: game.team1.sets_won,
            setsLost: game.team1.sets_lost,
          },
          team2: {
            id: game.team2.id,
            name: game.team2.name,
            group: game.team2.group_letter,
            wins: game.team2.wins,
            losses: game.team2.losses,
            pointsFor: game.team2.points_for,
            pointsAgainst: game.team2.points_against,
            setsWon: game.team2.sets_won,
            setsLost: game.team2.sets_lost,
          },
          sets: parsedSets,
          currentSet: game.current_set,
          isComplete: game.is_complete,
          field: game.field,
          phase: game.phase as 'group' | 'quarterfinal' | 'semifinal' | 'final',
          group: game.group_letter,
          winner: game.winner ? {
            id: game.winner.id,
            name: game.winner.name,
            group: game.winner.group_letter,
            wins: game.winner.wins,
            losses: game.winner.losses,
            pointsFor: game.winner.points_for,
            pointsAgainst: game.winner.points_against,
            setsWon: game.winner.sets_won,
            setsLost: game.winner.sets_lost,
          } : undefined,
          isRunning: game.is_running,
          team1Score: game.team1_score,
          team2Score: game.team2_score,
          time: '00:00'
        };
      });

      setGames(mappedGames);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const saveTeam = async (team: Team) => {
    try {
      const { error } = await supabase
        .from('teams')
        .upsert({
          id: team.id,
          name: team.name,
          group_letter: team.group,
          wins: team.wins,
          losses: team.losses,
          points_for: team.pointsFor,
          points_against: team.pointsAgainst,
          sets_won: team.setsWon,
          sets_lost: team.setsLost,
        });

      if (error) {
        console.error('Error saving team:', error);
        toast({
          title: "Error saving team",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving team:', error);
      return false;
    }
  };

  const saveGame = async (game: Game) => {
    try {
      // Convert GameSet[] to Json compatible format
      const setsJson = JSON.stringify(game.sets);
      
      const { error } = await supabase
        .from('games')
        .upsert({
          id: game.id,
          team1_id: game.team1.id,
          team2_id: game.team2.id,
          sets: setsJson,
          current_set: game.currentSet,
          is_complete: game.isComplete,
          field: game.field,
          phase: game.phase,
          group_letter: game.group,
          winner_id: game.winner?.id,
          is_running: game.isRunning,
          team1_score: game.team1Score,
          team2_score: game.team2Score,
          start_time: game.isRunning ? new Date().toISOString() : null,
        });

      if (error) {
        console.error('Error saving game:', error);
        toast({
          title: "Error saving game",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  };

  const saveTournamentSettings = async (settings: TournamentSettings) => {
    try {
      const { error } = await supabase
        .from('tournament_settings')
        .update({
          number_of_courts: settings.numberOfCourts,
          number_of_groups: settings.numberOfGroups,
          win_condition: settings.winCondition,
          points_to_win: settings.pointsToWin,
          time_limit: settings.timeLimit,
          number_of_sets: settings.numberOfSets,
          sets_to_win: settings.setsToWin,
          points_to_win_set: settings.pointsToWinSet,
          admin_password: settings.adminPassword,
          teams_advancing_from_group: settings.teamsAdvancingFromGroup,
          auto_start_delay: settings.autoStartDelay || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('is_active', true);

      if (error) {
        console.error('Error saving tournament settings:', error);
        toast({
          title: "Error saving settings",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving tournament settings:', error);
      return false;
    }
  };

  const generateRoundRobinGames = async () => {
    try {
      const groups = Array.from({length: tournamentSettings.numberOfGroups}, (_, i) => String.fromCharCode(65 + i));
      
      for (const groupLetter of groups) {
        const { error } = await supabase.rpc('generate_round_robin_for_group', {
          group_letter: groupLetter,
          court_offset: 0
        });

        if (error) {
          console.error(`Error generating games for group ${groupLetter}:`, error);
          toast({
            title: "Error generating games",
            description: `Failed to generate games for group ${groupLetter}`,
            variant: "destructive",
          });
          return false;
        }
      }

      await loadGames();
      toast({
        title: "Games Generated",
        description: "Round-robin games have been generated for all groups!",
      });
      return true;
    } catch (error) {
      console.error('Error generating round-robin games:', error);
      return false;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      return false;
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) {
        console.error('Error deleting game:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      return false;
    }
  };

  const resetTournament = async () => {
    try {
      // Delete all games first (due to foreign key constraints)
      await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Delete all teams
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      await loadTeams();
      await loadGames();
      
      toast({
        title: "Tournament Reset",
        description: "All teams and games have been cleared!",
      });
      return true;
    } catch (error) {
      console.error('Error resetting tournament:', error);
      return false;
    }
  };

  return {
    teams,
    games,
    tournamentSettings,
    setTeams,
    setGames,
    setTournamentSettings,
    saveTeam,
    saveGame,
    saveTournamentSettings,
    generateRoundRobinGames,
    deleteTeam,
    deleteGame,
    resetTournament,
    loadTeams,
    loadGames,
  };
};
