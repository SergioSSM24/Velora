import { User, Calendar, FileText, Download, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import type { Document } from './DocumentCatalog';

interface DocumentPreviewProps {
  document: Document;
  userRole?: 'editor' | 'reader';
  onEdit?: () => void;
}

export function DocumentPreview({ document, userRole, onEdit }: DocumentPreviewProps) {
  const handleDownload = () => {
    // Simulamos la descarga del documento
    const content = `Documento: ${document.title}\n\nDescripción: ${document.description}\n\nContenido:\n${document.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title}.${document.fileType.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2">{document.title}</h1>
            <p className="text-muted-foreground mb-4">{document.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="secondary">{document.category}</Badge>
              <Badge variant="outline">{document.fileType}</Badge>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{document.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Actualizado: {document.lastModified}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            {userRole === 'editor' && onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5" />
          <h3>Contenido del documento</h3>
        </div>
        
        <ScrollArea className="h-full">
          <div className="prose max-w-none">
            {document.content ? (
              <div className="whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
                {document.content}
              </div>
            ) : (
              <div className="text-muted-foreground italic p-4 bg-muted/30 rounded-lg">
                Este documento no tiene contenido de vista previa disponible.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}