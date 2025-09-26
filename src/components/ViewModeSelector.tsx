import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { ViewMode } from './types';
import { Grid3x3, List, LayoutGrid } from 'lucide-react';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ viewMode, onViewModeChange }: ViewModeSelectorProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
      className="justify-start"
    >
      <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula">
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Cuadrícula</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Vista de lista">
        <List className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Lista</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="compact" aria-label="Vista compacta">
        <Grid3x3 className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Compacta</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}