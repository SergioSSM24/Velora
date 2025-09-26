import { User, Calendar, FileText, Download, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import type { Document } from './DocumentCatalog';

interface DocumentViewProps {
  document: Document;
  userRole?: 'editor' | 'reader';
  onEdit?: () => void;
}

export function DocumentView({ document, userRole, onEdit }: DocumentViewProps) {
  const handleDownload = () => {
    // In a real application, this would download the actual file
    const element = document.createElement('a');
    const file = new Blob([document.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{document.title}</h2>
            <p className="text-muted-foreground">{document.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{document.fileType}</Badge>
            <Badge variant="outline">{document.category}</Badge>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Autor: {document.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Última modificación: {formatDate(document.lastModified)}</span>
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

        <Separator />
      </div>

      {/* Document Content */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3>Contenido del Documento</h3>
        </div>
        
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4">
            {document.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph || '\u00A0'} {/* Non-breaking space for empty lines */}
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Document Information */}
      <div className="space-y-4">
        <h4>Información del Documento</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Categoría:</span>
            <p className="text-muted-foreground">{document.category}</p>
          </div>
          <div>
            <span className="font-medium">Tipo de archivo:</span>
            <p className="text-muted-foreground">{document.fileType}</p>
          </div>
          <div>
            <span className="font-medium">Autor:</span>
            <p className="text-muted-foreground">{document.author}</p>
          </div>
          <div>
            <span className="font-medium">Última actualización:</span>
            <p className="text-muted-foreground">{formatDate(document.lastModified)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}