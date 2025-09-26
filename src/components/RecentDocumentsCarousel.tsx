import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, FileText, User, Calendar } from 'lucide-react';
import { Document } from './types';

interface RecentDocumentsCarouselProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
}

export function RecentDocumentsCarousel({ documents, onDocumentSelect }: RecentDocumentsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Obtener los 6 documentos más recientes basados en la fecha de modificación
  const recentDocuments = documents
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, 6);

  const documentsPerPage = 3;
  const maxIndex = Math.max(0, recentDocuments.length - documentsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (recentDocuments.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Documentos Recientes</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / documentsPerPage)}%)`,
            width: `${(recentDocuments.length / documentsPerPage) * 100}%`
          }}
        >
          {recentDocuments.map((document) => (
            <Card 
              key={document.id} 
              className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] flex-shrink-0"
              style={{ width: `${100 / recentDocuments.length}%` }}
              onClick={() => onDocumentSelect(document)}
            >
              <CardContent className="p-4 h-40">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {document.category}
                  </Badge>
                  {document.status === 'review' && (
                    <Badge variant="default" className="text-xs">
                      Revisión
                    </Badge>
                  )}
                </div>
                
                <div className="mb-3">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <h4 className="text-sm font-medium line-clamp-1 mb-1">
                    {document.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {document.content.substring(0, 100)}...
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{document.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{document.lastModified.toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Indicadores de posición */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}