import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';
import { Document, User, hasEditPermission, canUploadEvidence } from './types';
import { 
  CalendarDays, 
  User as UserIcon, 
  Edit, 
  Heart, 
  HeartOff, 
  Upload, 
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

interface DocumentPreviewModalProps {
  document: Document | null;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (doc: Document) => void;
  onToggleFavorite: (documentId: string) => void;
  onOpenEvidenceUploader: (doc: Document) => void;
}

export function DocumentPreviewModal({ 
  document, 
  user, 
  isOpen, 
  onClose, 
  onEdit, 
  onToggleFavorite,
  onOpenEvidenceUploader
}: DocumentPreviewModalProps) {
  if (!document) return null;

  const canEdit = hasEditPermission(user.role);
  const canUpload = canUploadEvidence(user.role) && document.requiresEvidence;
  const isFavorite = document.isFavorite?.[user.username] || false;
  const userEvidence = document.evidenceFiles[user.username] || [];
  const hasEvidence = userEvidence.length > 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary' as const, label: 'Borrador', icon: FileText },
      'review': { variant: 'default' as const, label: 'En Revisión', icon: Clock },
      'published': { variant: 'default' as const, label: 'Publicado', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Alta Prioridad
        </Badge>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogDescription className="sr-only">
            Vista previa del documento {document.title}
          </DialogDescription>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{document.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(document.status)}
                {getPriorityBadge(document.priority)}
                {document.requiresEvidence && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Requiere Evidencia
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(document.id)}
              >
                {isFavorite ? (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                ) : (
                  <HeartOff className="h-4 w-4" />
                )}
              </Button>
              
              {canEdit && document.status !== 'published' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(document);
                    onClose();
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
              
              {canUpload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenEvidenceUploader(document);
                    onClose();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Evidencia</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Información del documento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span>Autor: {document.author}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                Modificado: {document.lastModified.toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Categoría: {document.category}</span>
            </div>
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </DialogHeader>

        {/* Estado de evidencia */}
        {document.requiresEvidence && canUpload && (
          <Card className={`mb-4 ${hasEvidence ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {hasEvidence ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
                <span className={`font-medium ${hasEvidence ? 'text-green-800' : 'text-amber-800'}`}>
                  {hasEvidence 
                    ? `Evidencia subida (${userEvidence.length} archivo${userEvidence.length > 1 ? 's' : ''})`
                    : 'Evidencia pendiente'
                  }
                </span>
              </div>
              <p className={`text-sm ${hasEvidence ? 'text-green-700' : 'text-amber-700'}`}>
                {hasEvidence 
                  ? 'Has subido la evidencia requerida para este documento.'
                  : 'Este documento requiere que subas evidencia de haber sido leído y firmado.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contenido del documento */}
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap break-words">
              {document.content}
            </div>
          </div>

          {/* Archivos adjuntos */}
          {document.attachedFiles && document.attachedFiles.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Archivos Adjuntos</h4>
              <div className="space-y-2">
                {document.attachedFiles.map((fileName, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{fileName}</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}