import { useState, useMemo } from 'react';
import { Search, Filter, Upload, LogOut, FileText, Calendar as CalendarIcon, Settings, LayoutGrid, Heart, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DocumentUpload } from './DocumentUpload';
import { DocumentEdit } from './DocumentEdit';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { RecentDocumentsCarousel } from './RecentDocumentsCarousel';
import { CalendarManager } from './CalendarManager';
import { EvidenceUploader } from './EvidenceUploader';
import { ViewModeSelector } from './ViewModeSelector';
import { ReviewManager } from './ReviewManager';
import { textIncludes } from './utils/textUtils';
import { Document, CalendarEvent, User, ViewMode, hasEditPermission, hasSuperEditPermission, canDeleteDocuments, getRoleName, canViewDocument, getSupervisors } from './types';
import { toast } from 'sonner@2.0.3';
import { Logo } from './Logo';

interface DocumentCatalogProps {
  user: User;
  onLogout: () => void;
}

// Mock data - En un caso real esto vendría del backend
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Manual de Usuario',
    content: `# Manual de Usuario - Sistema de Gestión de Documentos

## Introducción
Este manual proporciona una guía completa para el uso del sistema de gestión de documentos. El sistema permite a los usuarios cargar, organizar, buscar y gestionar documentos de manera eficiente.

## Características principales
- Subida de documentos en múltiples formatos
- Sistema de categorización
- Búsqueda avanzada con filtros
- Control de acceso basado en roles
- Vista previa de documentos

## Primeros pasos
Para comenzar a usar el sistema, inicia sesión con tus credenciales y selecciona tu rol de usuario. Los editores pueden subir y modificar documentos, mientras que los lectores solo pueden visualizarlos.

## Gestión de documentos
Los documentos se organizan por categorías y pueden incluir metadatos como autor, fecha de modificación y tipo de archivo.`,
    category: 'Manuales',
    author: 'Ana García',
    lastModified: new Date('2025-01-02'),
    tags: ['manual', 'usuario', 'guía'],
    status: 'published',
    priority: 'normal',
    requiresEvidence: false,
    evidenceFiles: {},
    attachedFiles: ['manual_completo.pdf', 'guia_rapida.pdf'],
    targetUserGroups: ['corporativo', 'corporativo-plus', 'personal-tienda', 'supervisor']
  },
  {
    id: '2',
    title: 'Política de Seguridad Corporativa',
    content: `# Política de Seguridad Corporativa

## Objetivo
Establecer las directrices de seguridad para proteger los activos de información de la organización.

## Alcance
Esta política se aplica a todos los empleados, contratistas y terceros que tengan acceso a los sistemas de información.

## Principios de Seguridad
1. Confidencialidad
2. Integridad
3. Disponibilidad

## Responsabilidades
- Los usuarios deben mantener la confidencialidad de sus credenciales
- Reportar inmediatamente cualquier incidente de seguridad
- Cumplir con las políticas de acceso a la información

## Controles de Acceso
- Autenticación multifactor obligatoria
- Revisión periódica de permisos
- Principio de menor privilegio`,
    category: 'Políticas',
    author: 'Carlos López',
    lastModified: new Date('2025-01-01'),
    tags: ['seguridad', 'políticas', 'corporativo'],
    status: 'published',
    priority: 'high',
    requiresEvidence: true,
    evidenceFiles: {},
    targetUserGroups: ['corporativo-plus', 'supervisor']
  },
  {
    id: '3',
    title: 'Procedimiento de Control de Calidad',
    content: `# Procedimiento de Control de Calidad

## Propósito
Definir los pasos necesarios para asegurar la calidad de productos y servicios.

## Proceso de Control
1. Inspección inicial
2. Pruebas de funcionamiento
3. Verificación de estándares
4. Documentación de resultados
5. Aprobación o rechazo

## Criterios de Aceptación
- Cumplimiento de especificaciones técnicas
- Ausencia de defectos críticos
- Conformidad con normativas aplicables

## Registro y Seguimiento
Todos los controles de calidad deben ser registrados en el sistema de gestión para trazabilidad y mejora continua.`,
    category: 'Procedimientos',
    author: 'María Rodríguez',
    lastModified: new Date('2024-12-30'),
    tags: ['calidad', 'procedimientos', 'control'],
    status: 'published',
    priority: 'normal',
    requiresEvidence: true,
    evidenceFiles: {},
    targetUserGroups: ['personal-tienda', 'supervisor']
  },
  {
    id: '4',
    title: 'Plan Estratégico 2025',
    content: `# Plan Estratégico 2025

## Visión
Ser líderes en innovación y excelencia operacional en nuestro sector.

## Objetivos Estratégicos
1. Aumentar participación de mercado en un 15%
2. Mejorar satisfacción del cliente al 95%
3. Implementar tecnologías emergentes
4. Fortalecer cultura organizacional

## Iniciativas Clave
- Transformación digital
- Programa de capacitación continua
- Expansión a nuevos mercados
- Optimización de procesos

## Métricas de Seguimiento
- ROI de proyectos
- Indicadores de satisfacción
- Tiempo de implementación
- Adopción de nuevas tecnologías

## Cronograma
Q1: Análisis y planificación detallada
Q2: Implementación fase 1
Q3: Evaluación y ajustes
Q4: Consolidación y preparación 2026`,
    category: 'Planificación',
    author: 'Luis Martínez',
    lastModified: new Date('2024-12-29'),
    tags: ['estrategia', 'planificación', '2025'],
    status: 'review',
    priority: 'high',
    requiresEvidence: false,
    evidenceFiles: {},
    assignedSupervisor: 'supervisor1',
    targetUserGroups: ['corporativo', 'corporativo-plus', 'personal-tienda', 'supervisor'],
    reviewedBy: 'luis.martinez'
  }
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    dates: [new Date('2025-01-15')],
    title: 'Revisión de Políticas',
    type: 'important',
    description: 'Revisión anual de políticas corporativas',
    createdBy: 'admin',
    color: '#3b82f6'
  },
  {
    id: '2',
    dates: [new Date('2025-01-25'), new Date('2025-01-26')],
    title: 'Días Festivos',
    type: 'inactive',
    description: 'Días no laborables',
    createdBy: 'admin',
    color: '#ef4444'
  }
];

export function DocumentCatalog({ user, onLogout }: DocumentCatalogProps) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [evidenceDocument, setEvidenceDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState('documents');

  const canEdit = hasEditPermission(user.role);
  const canSuperEdit = hasSuperEditPermission(user.role);
  const canDelete = canDeleteDocuments(user.role);
  const showCarousel = canEdit || canSuperEdit; // Carrusel para editores y super editores también

  const categories = useMemo(() => {
    const cats = [...new Set(documents.map(doc => doc.category))];
    return cats;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Verificar permisos de visualización
      if (!canViewDocument(user.role, doc, user.username)) {
        return false;
      }

      const matchesSearch = textIncludes(doc.title, searchTerm) ||
                           textIncludes(doc.content, searchTerm) ||
                           textIncludes(doc.author, searchTerm) ||
                           doc.tags.some(tag => textIncludes(tag, searchTerm));
      
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || doc.priority === selectedPriority;
      const matchesFavorites = !showFavoritesOnly || doc.isFavorite?.[user.username];
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesFavorites;
    });
  }, [documents, searchTerm, selectedCategory, selectedStatus, selectedPriority, showFavoritesOnly, user.username, user.role]);

  const handleDocumentUpload = (newDocument: Omit<Document, 'id' | 'lastModified' | 'author' | 'evidenceFiles' | 'isFavorite'>) => {
    const document: Document = {
      ...newDocument,
      id: Date.now().toString(),
      lastModified: new Date(),
      author: user.username,
      evidenceFiles: {},
      isFavorite: {}
    };
    setDocuments(prev => [document, ...prev]);
    setShowUpload(false);
    toast.success(
      document.status === 'review' 
        ? 'Documento enviado a revisión exitosamente' 
        : 'Documento subido exitosamente'
    );
  };

  const handleDocumentUpdate = (updatedDocument: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === updatedDocument.id 
        ? { ...updatedDocument, lastModified: new Date() }
        : doc
    ));
    setEditingDocument(null);
    setSelectedDocument(updatedDocument);
    toast.success('Documento actualizado exitosamente');
  };

  const handleDeleteDocument = (documentId: string) => {
    if (!canDelete) return;
    
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setSelectedDocument(null);
    toast.success('Documento eliminado exitosamente');
  };

  const handleToggleFavorite = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? {
            ...doc,
            isFavorite: {
              ...doc.isFavorite,
              [user.username]: !doc.isFavorite?.[user.username]
            }
          }
        : doc
    ));
    
    const doc = documents.find(d => d.id === documentId);
    const isFavorite = doc?.isFavorite?.[user.username];
    toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  const handleTogglePriority = (documentId: string) => {
    if (!canEdit) return;
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            priority: doc.priority === 'high' ? 'normal' : 'high',
            lastModified: new Date()
          }
        : doc
    ));
    
    const doc = documents.find(d => d.id === documentId);
    const newPriority = doc?.priority === 'high' ? 'normal' : 'high';
    toast.success(`Prioridad cambiada a ${newPriority === 'high' ? 'alta' : 'normal'}`);
  };

  const handleToggleEvidenceRequirement = (documentId: string) => {
    if (!canEdit) return;
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            requiresEvidence: !doc.requiresEvidence,
            lastModified: new Date()
          }
        : doc
    ));
    
    const doc = documents.find(d => d.id === documentId);
    const requiresEvidence = !doc?.requiresEvidence;
    toast.success(`Evidencia ${requiresEvidence ? 'habilitada' : 'deshabilitada'} para este documento`);
  };

  const handleSendToReview = (documentId: string) => {
    if (!canEdit) return;
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            status: 'review',
            lastModified: new Date()
          }
        : doc
    ));
    
    toast.success('Documento enviado a revisión');
  };

  const handleApproveDocument = (documentId: string) => {
    if (!canSuperEdit) return;
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            status: 'published',
            lastModified: new Date(),
            assignedSupervisor: undefined, // Limpiar supervisor asignado
            reviewedBy: undefined // Limpiar revisor
          }
        : doc
    ));
    
    toast.success('Documento aprobado y publicado');
  };

  // Nueva función para obtener documentos en revisión visible para supervisores
  const getReviewDocuments = () => {
    if (!canSuperEdit) return [];
    return documents.filter(doc => doc.status === 'review');
  };

  const handleRejectDocument = (documentId: string) => {
    if (!canSuperEdit) return;
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            status: 'draft',
            lastModified: new Date(),
            assignedSupervisor: undefined, // Limpiar supervisor asignado
            reviewedBy: undefined // Limpiar revisor
          }
        : doc
    ));
    
    toast.success('Documento rechazado y devuelto a borrador');
  };

  const handleUploadEvidence = (documentId: string, fileName: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            evidenceFiles: {
              ...doc.evidenceFiles,
              [user.username]: [
                ...(doc.evidenceFiles[user.username] || []),
                fileName
              ]
            }
          }
        : doc
    ));
  };

  const handleRemoveEvidence = (documentId: string, fileName: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            evidenceFiles: {
              ...doc.evidenceFiles,
              [user.username]: (doc.evidenceFiles[user.username] || []).filter(f => f !== fileName)
            }
          }
        : doc
    ));
  };

  const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const handleRemoveCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const getDocumentCardContent = (document: Document) => (
    <Card 
      key={document.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedDocument?.id === document.id ? 'ring-2 ring-primary bg-accent/50' : ''
      }`}
      onClick={() => setSelectedDocument(document)}
    >
      <CardContent className={viewMode === 'list' ? 'p-4' : 'p-3'}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {document.category}
            </Badge>
            {document.status === 'review' && (
              <Badge variant="default" className="text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                En Revisión
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {document.priority === 'high' && (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            )}
            {document.isFavorite?.[user.username] && (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            )}
          </div>
        </div>
        
        <h4 className={`mb-2 ${viewMode === 'compact' ? 'text-sm' : ''} line-clamp-1`}>
          {document.title}
        </h4>
        
        {viewMode !== 'compact' && (
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
            {document.content.substring(0, 150)}...
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{document.author}</span>
          <span>{document.lastModified.toLocaleDateString('es-ES')}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Logo size="sm" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Bienvenido, {user.username} ({getRoleName(user.role)})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              {canEdit && (
                <Dialog open={showUpload} onOpenChange={setShowUpload}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Subir Documento</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Subir Nuevo Documento</DialogTitle>
                      <DialogDescription>
                        Completa la información del documento
                      </DialogDescription>
                    </DialogHeader>
                    <DocumentUpload user={user} onUpload={handleDocumentUpload} />
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className={`grid w-full ${canSuperEdit ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            {canSuperEdit && (
              <TabsTrigger value="review" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Revisiones ({getReviewDocuments().length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Carrusel de Documentos Recientes */}
            {showCarousel && (
              <RecentDocumentsCarousel
                documents={documents}
                onDocumentSelect={setSelectedDocument}
              />
            )}

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="review">En Revisión</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="favorites"
                    checked={showFavoritesOnly}
                    onCheckedChange={setShowFavoritesOnly}
                  />
                  <Label htmlFor="favorites" className="text-sm">Solo favoritos</Label>
                </div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3>Documentos ({filteredDocuments.length})</h3>
              </div>
              
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="mb-2">No se encontraron documentos</h4>
                  <p className="text-muted-foreground text-sm">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No hay documentos disponibles'
                    }
                  </p>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === 'list' ? 'grid-cols-1' :
                  viewMode === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {filteredDocuments.map(getDocumentCardContent)}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarManager
              user={user}
              events={calendarEvents}
              onAddEvent={handleAddCalendarEvent}
              onRemoveEvent={handleRemoveCalendarEvent}
            />
          </TabsContent>

          {canSuperEdit && (
            <TabsContent value="review">
              <ReviewManager
                user={user}
                documents={documents}
                onApproveDocument={handleApproveDocument}
                onRejectDocument={handleRejectDocument}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocument}
        user={user}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onEdit={setEditingDocument}
        onToggleFavorite={handleToggleFavorite}
        onOpenEvidenceUploader={setEvidenceDocument}
      />

      {/* Evidence Uploader */}
      {evidenceDocument && (
        <EvidenceUploader
          document={evidenceDocument}
          user={user}
          isOpen={!!evidenceDocument}
          onClose={() => setEvidenceDocument(null)}
          onUploadEvidence={handleUploadEvidence}
          onRemoveEvidence={handleRemoveEvidence}
        />
      )}

      {/* Document Edit Dialog */}
      {editingDocument && (
        <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Documento</DialogTitle>
              <DialogDescription>
                Realiza cambios al documento
              </DialogDescription>
            </DialogHeader>
            <DocumentEdit
              document={editingDocument}
              onSave={handleDocumentUpdate}
              onCancel={() => setEditingDocument(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}