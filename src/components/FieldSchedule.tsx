
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Play, CheckCircle, Calendar } from 'lucide-react';
import { Game } from '@/pages/Index';

interface FieldScheduleProps {
  games: Game[];
  numberOfCourts: number;
}

const FieldSchedule = ({ games, numberOfCourts }: FieldScheduleProps) => {
  const [selectedField, setSelectedField] = useState<string>('all');

  // Get unique fields from actual games data
  const uniqueFields = [...new Set(games.map(g => g.field))].sort();
  
  // If no games exist, show expected fields based on numberOfCourts
  const expectedFields = Array.from({length: numberOfCourts}, (_, i) => `Court ${i + 1}`);
  const fieldsToShow = uniqueFields.length > 0 ? uniqueFields : expectedFields;

  const getGamesByField = (field: string) => {
    return games
      .filter(g => g.field === field)
      .sort((a, b) => {
        // Sort by status: running first, then pending, then completed
        if (a.isRunning && !b.isRunning) return -1;
        if (!a.isRunning && b.isRunning) return 1;
        if (!a.isComplete && b.isComplete) return -1;
        if (a.isComplete && !b.isComplete) return 1;
        return a.team1.name.localeCompare(b.team1.name);
      });
  };

  const getAllGamesSorted = () => {
    return games.sort((a, b) => {
      // Sort by status first, then by field
      if (a.isRunning && !b.isRunning) return -1;
      if (!a.isRunning && b.isRunning) return 1;
      if (!a.isComplete && b.isComplete) return -1;
      if (a.isComplete && !b.isComplete) return 1;
      return a.field.localeCompare(b.field);
    });
  };

  const getGameStatusIcon = (game: Game) => {
    if (game.isComplete) {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    if (game.isRunning) {
      return <Play className="text-blue-500" size={20} />;
    }
    return <Clock className="text-orange-500" size={20} />;
  };

  const getGameStatusBadge = (game: Game) => {
    if (game.isComplete) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
    }
    if (game.isRunning) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Live</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Pending</Badge>;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'group': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'quarterfinal': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'semifinal': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'final': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderGameCard = (game: Game) => (
    <Card key={game.id} className={`bg-white/90 backdrop-blur-sm ${
      game.isComplete ? 'border-green-200' : game.isRunning ? 'border-blue-200' : 'border-orange-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getGameStatusIcon(game)}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} />
              {game.field}
            </div>
          </div>
          <div className="flex gap-2">
            {getGameStatusBadge(game)}
            <Badge className={getPhaseColor(game.phase)}>
              {game.phase.charAt(0).toUpperCase() + game.phase.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`flex justify-between items-center p-2 rounded ${
            game.isComplete && game.team1Score > game.team2Score 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-blue-50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{game.team1.name}</span>
              <Badge variant="outline" className="text-xs">Group {game.team1.group}</Badge>
            </div>
            <span className="font-bold text-lg">{game.team1Score}</span>
          </div>

          <div className="text-center text-sm text-gray-500 font-medium">VS</div>

          <div className={`flex justify-between items-center p-2 rounded ${
            game.isComplete && game.team2Score > game.team1Score 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-orange-50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{game.team2.name}</span>
              <Badge variant="outline" className="text-xs">Group {game.team2.group}</Badge>
            </div>
            <span className="font-bold text-lg">{game.team2Score}</span>
          </div>
        </div>

        {game.group && (
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-xs">
              Group {game.group} Match
            </Badge>
          </div>
        )}

        {game.isComplete && (
          <div className="mt-3 text-center">
            <Badge className="bg-green-500 text-white">
              Winner: {game.team1Score > game.team2Score ? game.team1.name : game.team2.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Calendar className="text-blue-500" size={28} />
          Field Schedule
        </h2>
        <p className="text-gray-600">Complete tournament schedule across all fields</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{games.length}</div>
            <div className="text-sm text-gray-600">Total Games</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {games.filter(g => g.isComplete).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {games.filter(g => !g.isComplete && !g.isRunning).length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {games.filter(g => g.isRunning).length}
            </div>
            <div className="text-sm text-gray-600">Live</div>
          </CardContent>
        </Card>
      </div>

      {/* Field Selection */}
      <Tabs value={selectedField} onValueChange={setSelectedField} className="w-full">
        <TabsList className={`grid w-full bg-white/80 backdrop-blur-sm`} style={{gridTemplateColumns: `repeat(${Math.min(fieldsToShow.length + 1, 6)}, 1fr)`}}>
          <TabsTrigger value="all">All Fields</TabsTrigger>
          {fieldsToShow.slice(0, 5).map(field => (
            <TabsTrigger key={field} value={field}>
              {field}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fieldsToShow.map(field => {
              const fieldGames = getGamesByField(field);
              
              return (
                <Card key={field} className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-blue-500" size={20} />
                        {field}
                      </div>
                      <Badge variant="outline">
                        {fieldGames.length} games
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {fieldGames.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No games scheduled for this field
                      </div>
                    ) : (
                      fieldGames.map(game => (
                        <div key={game.id} className={`p-3 rounded-lg ${
                          game.isRunning ? 'bg-blue-50 border border-blue-200' :
                          game.isComplete ? 'bg-green-50 border border-green-200' :
                          'bg-orange-50 border border-orange-200'
                        }`}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              {getGameStatusIcon(game)}
                              <span className="font-medium">
                                {game.isRunning ? 'LIVE' : game.isComplete ? 'COMPLETED' : 'PENDING'}
                              </span>
                            </div>
                            {getGameStatusBadge(game)}
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium">
                              <span>{game.team1.name}</span>
                              <span className="font-bold">{game.team1Score}</span>
                              <span className="text-gray-400">-</span>
                              <span className="font-bold">{game.team2Score}</span>
                              <span>{game.team2.name}</span>
                            </div>
                            <Badge className={`${getPhaseColor(game.phase)} text-xs mt-1`}>
                              {game.phase.charAt(0).toUpperCase() + game.phase.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {fieldsToShow.map(field => (
          <TabsContent key={field} value={field} className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-blue-500" size={24} />
                  {field} Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getGamesByField(field).length === 0 ? (
                    <div className="col-span-2 text-center text-gray-500 py-12">
                      <MapPin className="mx-auto mb-4 text-gray-300" size={48} />
                      <div className="text-xl">No games scheduled for {field}</div>
                      <div className="text-sm">Use the Admin Panel to create games for this field</div>
                    </div>
                  ) : (
                    getGamesByField(field).map(game => renderGameCard(game))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {games.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Games Scheduled</h3>
            <p className="text-gray-500">Use the Admin Panel to create your tournament schedule</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FieldSchedule;
