import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CalendarEvent, User, canManageCalendar } from './types';
import { CalendarDays, Clock, Plus, X, Palette } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CalendarManagerProps {
  user: User;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onRemoveEvent: (eventId: string) => void;
}

const colorOptions = [
  { name: 'Azul', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Verde', value: '#10b981', class: 'bg-green-500' },
  { name: 'Rojo', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Amarillo', value: '#f59e0b', class: 'bg-yellow-500' },
  { name: 'Púrpura', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Rosa', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Naranja', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Índigo', value: '#6366f1', class: 'bg-indigo-500' }
];

export function CalendarManager({ user, events, onAddEvent, onRemoveEvent }: CalendarManagerProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'important' as 'important' | 'inactive',
    description: '',
    color: '#3b82f6'
  });

  const canManage = canManageCalendar(user.role);
  
  const getEventsByDates = (dates: Date[]) => {
    return events.filter(event => 
      event.dates.some(eventDate => 
        dates.some(selectedDate => 
          eventDate.toDateString() === selectedDate.toDateString()
        )
      )
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDates(prev => {
      const existingIndex = prev.findIndex(d => d.toDateString() === date.toDateString());
      if (existingIndex >= 0) {
        // Si la fecha ya está seleccionada, la removemos
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Si no está seleccionada, la agregamos
        return [...prev, date];
      }
    });
  };

  const handleAddEvent = () => {
    if (selectedDates.length === 0 || !newEvent.title.trim()) {
      toast.error('Por favor selecciona al menos una fecha y completa el título');
      return;
    }

    onAddEvent({
      dates: [...selectedDates],
      title: newEvent.title,
      type: newEvent.type,
      description: newEvent.description,
      color: newEvent.color,
      createdBy: user.username
    });

    setNewEvent({ title: '', type: 'important', description: '', color: '#3b82f6' });
    setSelectedDates([]);
    setIsDialogOpen(false);
    toast.success('Evento agregado exitosamente');
  };

  const eventsByDates = getEventsByDates(selectedDates);
  // Crear modificadores dinámicos basados en eventos y colores
  const modifiers: { [key: string]: Date[] } = {
    selected: selectedDates,
    ...events.reduce((acc, event, index) => {
      const key = `event-${index}`;
      acc[key] = event.dates;
      return acc;
    }, {} as { [key: string]: Date[] })
  };

  const modifiersStyles: { [key: string]: React.CSSProperties } = {
    selected: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
      borderRadius: '4px',
      border: '2px solid #6b7280'
    },
    ...events.reduce((acc, event, index) => {
      const key = `event-${index}`;
      acc[key] = {
        backgroundColor: event.color || '#3b82f6',
        color: 'white',
        borderRadius: '4px'
      };
      return acc;
    }, {} as { [key: string]: React.CSSProperties })
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendario
                </CardTitle>
                <CardDescription>
                  Fechas importantes y días inhábiles
                </CardDescription>
              </div>
              {canManage && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Evento</DialogTitle>
                      <DialogDescription>
                        Agrega un evento para las fechas seleccionadas en el calendario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="Ej: Reunión importante"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Select value={newEvent.type} onValueChange={(value: 'important' | 'inactive') => setNewEvent({ ...newEvent, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="important">Fecha Importante</SelectItem>
                            <SelectItem value="inactive">Día Inhábil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Selector de Color */}
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Color del Evento
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                              className={`w-full h-10 rounded-md border-2 transition-all ${
                                newEvent.color === color.value 
                                  ? 'border-gray-800 ring-2 ring-gray-300' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {newEvent.color === color.value && (
                                <div className="flex items-center justify-center h-full">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Descripción (opcional)</Label>
                        <Textarea
                          id="description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Descripción adicional..."
                          rows={3}
                        />
                      </div>
                      
                      <Separator />
                      
                      {selectedDates.length > 0 ? (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="font-medium">
                            Fechas seleccionadas ({selectedDates.length}):
                          </p>
                          <div className="max-h-20 overflow-y-auto text-xs">
                            {selectedDates.map((date, index) => (
                              <p key={index}>
                                {date.toLocaleDateString('es-ES', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          Por favor selecciona al menos una fecha en el calendario antes de crear el evento.
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        onClick={handleAddEvent}
                        disabled={selectedDates.length === 0}
                      >
                        Agregar Evento
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Haz clic en múltiples fechas para seleccionarlas. Las fechas seleccionadas aparecerán con borde gris.
              </p>
              {selectedDates.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    Fechas seleccionadas: {selectedDates.length}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedDates([])}
                    className="mt-2"
                  >
                    Limpiar selección
                  </Button>
                </div>
              )}
            </div>
            <Calendar
              mode="single"
              onDayClick={handleDateClick}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border w-full"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Leyenda:</p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 border-2 border-gray-600 rounded"></div>
                  <span className="text-sm">Fechas seleccionadas</span>
                </div>
                {events.map((event, index) => (
                  <div key={event.id} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    ></div>
                    <span className="text-sm">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos del día seleccionado */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Eventos del Día
            </CardTitle>
            <CardDescription>
              {selectedDates.length > 0
                ? `${selectedDates.length} fecha${selectedDates.length > 1 ? 's' : ''} seleccionada${selectedDates.length > 1 ? 's' : ''}`
                : 'Selecciona fechas en el calendario'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Selecciona fechas en el calendario para ver eventos</p>
              </div>
            ) : eventsByDates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay eventos para las fechas seleccionadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsByDates.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: event.color || '#3b82f6' }}
                          ></div>
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant={event.type === 'important' ? 'default' : 'destructive'}>
                            {event.type === 'important' ? 'Importante' : 'Inhábil'}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Fechas: {event.dates.map(d => d.toLocaleDateString('es-ES')).join(', ')}</p>
                          <p>Creado por: {event.createdBy}</p>
                        </div>
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onRemoveEvent(event.id);
                            toast.success('Evento eliminado');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}