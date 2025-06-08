
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Team } from '@/pages/Index';
import { FileSpreadsheet, Download, Upload, ExternalLink } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface GoogleSheetsIntegrationProps {
  teams: Team[];
  onTeamUpdate: (teams: Team[]) => void;
}

const GoogleSheetsIntegration = ({ teams, onTeamUpdate }: GoogleSheetsIntegrationProps) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const downloadTeamsAsCSV = () => {
    const headers = ['Team Name', 'Group', 'Wins', 'Losses', 'Points For', 'Points Against', 'Sets Won', 'Sets Lost'];
    const csvContent = [
      headers.join(','),
      ...teams.map(team => [
        `"${team.name}"`,
        team.group,
        team.wins,
        team.losses,
        team.pointsFor,
        team.pointsAgainst,
        team.setsWon,
        team.setsLost
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tournament_teams.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "Teams data has been downloaded as CSV. Upload this to Google Sheets!",
    });
  };

  const parseCSVFromGoogleSheets = async (url: string) => {
    try {
      setIsLoading(true);
      
      // Convert Google Sheets URL to CSV export URL
      let csvUrl = url;
      if (url.includes('docs.google.com/spreadsheets')) {
        const sheetId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        if (sheetId) {
          csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        }
      }

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch sheet data');
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Validate headers
      const requiredHeaders = ['Team Name', 'Group', 'Wins', 'Losses', 'Points For', 'Points Against', 'Sets Won', 'Sets Lost'];
      const hasValidHeaders = requiredHeaders.every(header => 
        headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
      );

      if (!hasValidHeaders) {
        throw new Error('CSV must contain columns: Team Name, Group, Wins, Losses, Points For, Points Against, Sets Won, Sets Lost');
      }

      const updatedTeams: Team[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length >= 8) {
          const existingTeam = teams.find(t => t.name === values[0]);
          const teamId = existingTeam?.id || `team-${Date.now()}-${i}`;
          
          updatedTeams.push({
            id: teamId,
            name: values[0],
            group: values[1],
            wins: parseInt(values[2]) || 0,
            losses: parseInt(values[3]) || 0,
            pointsFor: parseInt(values[4]) || 0,
            pointsAgainst: parseInt(values[5]) || 0,
            setsWon: parseInt(values[6]) || 0,
            setsLost: parseInt(values[7]) || 0,
          });
        }
      }

      onTeamUpdate(updatedTeams);
      setIsDialogOpen(false);
      
      toast({
        title: "Teams Updated!",
        description: `Successfully imported ${updatedTeams.length} teams from Google Sheets`,
      });

    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleSheetsTemplate = () => {
    const templateUrl = 'https://docs.google.com/spreadsheets/create';
    window.open(templateUrl, '_blank');
    
    toast({
      title: "Template Opened",
      description: "Create your sheet with columns: Team Name, Group, Wins, Losses, Points For, Points Against, Sets Won, Sets Lost",
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="text-green-500" size={24} />
          Google Sheets Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadTeamsAsCSV} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export to CSV
          </Button>
          
          <Button onClick={openGoogleSheetsTemplate} variant="outline" className="flex items-center gap-2">
            <ExternalLink size={16} />
            Create Template
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600">
                <Upload size={16} />
                Import from Sheets
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Teams from Google Sheets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Sheets URL (must be publicly viewable)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Required columns:</p>
                  <p className="text-gray-600">Team Name, Group, Wins, Losses, Points For, Points Against, Sets Won, Sets Lost</p>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">⚠️ Important:</p>
                  <p className="text-gray-600">Make sure your Google Sheet is set to "Anyone with the link can view" in sharing settings.</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => parseCSVFromGoogleSheets(sheetUrl)}
                    disabled={!sheetUrl || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Importing...' : 'Import Teams'}
                  </Button>
                  <Button 
                    onClick={() => setIsDialogOpen(false)} 
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>How to use:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Export to CSV" to download current teams</li>
            <li>Upload the CSV to Google Sheets or create a new sheet with the template</li>
            <li>Edit your teams in Google Sheets</li>
            <li>Make sure the sheet is publicly viewable (Anyone with link can view)</li>
            <li>Copy the sheet URL and click "Import from Sheets"</li>
          </ol>
        </div>

        {teams.length > 0 && (
          <div>
            <Badge variant="outline" className="text-xs">
              {teams.length} teams currently loaded
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsIntegration;
