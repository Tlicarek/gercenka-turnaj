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
        .order('game_number', { ascending: true });

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
          gameNumber: game.game_number,
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
          game_number: game.gameNumber,
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
      // Get current max game number
      const { data: maxGameData, error: maxGameError } = await supabase
        .from('games')
        .select('game_number')
        .order('game_number', { ascending: false })
        .limit(1);

      if (maxGameError) {
        console.error('Error getting max game number:', maxGameError);
        return false;
      }

      let currentGameNumber = (maxGameData?.[0]?.game_number || 0) + 1;

      // Generate smart scheduled games for all groups
      const generatedGames = generateSmartSchedule(teams, tournamentSettings, currentGameNumber);

      // Save all games to database
      for (const game of generatedGames) {
        const { error } = await supabase
          .from('games')
          .insert({
            id: game.id,
            team1_id: game.team1.id,
            team2_id: game.team2.id,
            sets: JSON.stringify(game.sets),
            current_set: game.currentSet,
            is_complete: game.isComplete,
            field: game.field,
            phase: game.phase,
            group_letter: game.group,
            is_running: game.isRunning,
            team1_score: game.team1Score,
            team2_score: game.team2Score,
            game_number: game.gameNumber,
          });

        if (error) {
          console.error('Error saving generated game:', error);
          toast({
            title: "Error generating games",
            description: `Failed to save game ${game.gameNumber}`,
            variant: "destructive",
          });
          return false;
        }
      }

      await loadGames();
      toast({
        title: "Smart Schedule Generated",
        description: `Generated ${generatedGames.length} games with optimal team rest periods!`,
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

  // Smart scheduling algorithm
  const generateSmartSchedule = (teams: Team[], settings: TournamentSettings, startingGameNumber: number): Game[] => {
    const games: Game[] = [];
    const courts = Array.from({length: settings.numberOfCourts}, (_, i) => `Court ${i + 1}`);
    let gameNumber = startingGameNumber;

    // Get all possible matchups for each group
    const allMatchups: Array<{team1: Team, team2: Team, group: string}> = [];
    
    for (let i = 0; i < settings.numberOfGroups; i++) {
      const groupLetter = String.fromCharCode(65 + i);
      const groupTeams = teams.filter(team => team.group === groupLetter);
      
      // Generate all possible pairings for this group
      for (let j = 0; j < groupTeams.length; j++) {
        for (let k = j + 1; k < groupTeams.length; k++) {
          allMatchups.push({
            team1: groupTeams[j],
            team2: groupTeams[k],
            group: groupLetter
          });
        }
      }
    }

    // Track when each team last played (game number)
    const teamLastPlayed = new Map<string, number>();
    
    // Schedule games with cooldown logic
    const scheduledMatchups = new Set<string>();
    let courtIndex = 0;

    while (allMatchups.length > 0) {
      let foundValidGame = false;

      for (let i = 0; i < allMatchups.length; i++) {
        const matchup = allMatchups[i];
        const matchupKey = `${matchup.team1.id}-${matchup.team2.id}`;
        
        if (scheduledMatchups.has(matchupKey)) continue;

        const team1LastGame = teamLastPlayed.get(matchup.team1.id) || 0;
        const team2LastGame = teamLastPlayed.get(matchup.team2.id) || 0;
        
        // Check if both teams have had enough rest (2 games cooldown)
        const team1CanPlay = gameNumber - team1LastGame >= 3 || team1LastGame === 0;
        const team2CanPlay = gameNumber - team2LastGame >= 3 || team2LastGame === 0;

        if (team1CanPlay && team2CanPlay) {
          // Create the game
          const newGame: Game = {
            id: crypto.randomUUID(),
            gameNumber: gameNumber,
            team1: matchup.team1,
            team2: matchup.team2,
            sets: [{
              team1Score: 0,
              team2Score: 0,
              isComplete: false
            }],
            currentSet: 0,
            isComplete: false,
            field: courts[courtIndex % courts.length],
            phase: 'group' as const,
            group: matchup.group,
            isRunning: false,
            team1Score: 0,
            team2Score: 0,
            time: '00:00'
          };

          if (settings.winCondition === 'sets') {
            newGame.sets = Array(settings.numberOfSets).fill(null).map(() => ({
              team1Score: 0,
              team2Score: 0,
              isComplete: false
            }));
          }

          games.push(newGame);
          scheduledMatchups.add(matchupKey);
          scheduledMatchups.add(`${matchup.team2.id}-${matchup.team1.id}`); // Also mark reverse
        
          // Update when teams last played
          teamLastPlayed.set(matchup.team1.id, gameNumber);
          teamLastPlayed.set(matchup.team2.id, gameNumber);

          // Remove this matchup from the list
          allMatchups.splice(i, 1);
          
          gameNumber++;
          courtIndex++;
          foundValidGame = true;
          break;
        }
      }

      // If no valid game found, we need to advance game number to allow teams to rest
      if (!foundValidGame) {
        gameNumber++;
        // Prevent infinite loop by breaking if we've tried too many times
        if (gameNumber > startingGameNumber + allMatchups.length * 5) {
          console.warn('Breaking out of scheduling loop to prevent infinite iteration');
          break;
        }
      }
    }

    console.log(`Generated ${games.length} games with smart scheduling`);
    return games;
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
