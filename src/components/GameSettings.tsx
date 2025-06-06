
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from 'lucide-react';
import { TournamentSettings } from '@/pages/Index';

interface GameSettingsProps {
  settings: TournamentSettings;
  onSettingsUpdate: (settings: TournamentSettings) => void;
}

const GameSettings = ({ settings, onSettingsUpdate }: GameSettingsProps) => {
  const updateSetting = (key: keyof TournamentSettings, value: any) => {
    onSettingsUpdate({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-blue-500" size={20} />
          Tournament Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Number of Courts</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={settings.numberOfCourts}
              onChange={(e) => updateSetting('numberOfCourts', parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label>Number of Groups</Label>
            <Input
              type="number"
              min="1"
              max="8"
              value={settings.numberOfGroups}
              onChange={(e) => updateSetting('numberOfGroups', parseInt(e.target.value) || 2)}
            />
          </div>
        </div>

        <div>
          <Label>Teams Advancing from Each Group</Label>
          <Select value={settings.teamsAdvancingFromGroup.toString()} onValueChange={(value) => updateSetting('teamsAdvancingFromGroup', parseInt(value) as 1 | 2)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 team per group (4-team knockout)</SelectItem>
              <SelectItem value="2">2 teams per group (8-team knockout)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Win Condition</Label>
          <Select value={settings.winCondition} onValueChange={(value: 'points' | 'time' | 'sets') => updateSetting('winCondition', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points (Volleyball)</SelectItem>
              <SelectItem value="time">Time (Football/Soccer)</SelectItem>
              <SelectItem value="sets">Sets (Tennis/Volleyball)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.winCondition === 'points' && (
          <div>
            <Label>Points to Win</Label>
            <Input
              type="number"
              min="1"
              value={settings.pointsToWin}
              onChange={(e) => updateSetting('pointsToWin', parseInt(e.target.value) || 15)}
            />
          </div>
        )}

        {settings.winCondition === 'time' && (
          <div>
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              min="1"
              value={settings.timeLimit}
              onChange={(e) => updateSetting('timeLimit', parseInt(e.target.value) || 20)}
            />
          </div>
        )}

        {settings.winCondition === 'sets' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Sets</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={settings.numberOfSets}
                onChange={(e) => updateSetting('numberOfSets', parseInt(e.target.value) || 3)}
              />
            </div>
            <div>
              <Label>Sets to Win</Label>
              <Input
                type="number"
                min="1"
                max={Math.ceil(settings.numberOfSets / 2)}
                value={settings.setsToWin}
                onChange={(e) => updateSetting('setsToWin', parseInt(e.target.value) || 2)}
              />
            </div>
            <div className="col-span-2">
              <Label>Points to Win Each Set</Label>
              <Input
                type="number"
                min="1"
                value={settings.pointsToWinSet}
                onChange={(e) => updateSetting('pointsToWinSet', parseInt(e.target.value) || 25)}
              />
            </div>
          </div>
        )}

        <div>
          <Label>Auto-Start Delay (minutes)</Label>
          <Input
            type="number"
            min="0"
            max="60"
            value={settings.autoStartDelay || 0}
            onChange={(e) => updateSetting('autoStartDelay', parseInt(e.target.value) || 0)}
            placeholder="0 = manual start only"
          />
        </div>

        <div>
          <Label>Admin Password</Label>
          <Input
            type="password"
            value={settings.adminPassword}
            onChange={(e) => updateSetting('adminPassword', e.target.value)}
            placeholder="Enter new admin password..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettings;
