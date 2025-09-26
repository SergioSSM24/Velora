import { useState } from 'react';
import { FileText, CheckCircle, X, Eye, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Document, User, getRoleName } from './types';
import { toast } from 'sonner@2.0.3';

interface ReviewManagerProps {
  user: User;
  documents: Document[];
  onApproveDocument: (documentId: string) => void;
  onRejectDocument: (documentId: string) => void;
}

export function ReviewManager({ user, documents, onApproveDocument, onRejectDocument }: ReviewManagerProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Filtrar documentos en revisión que pueden ser gestionados por el supervisor actual
  const reviewDocuments = documents.filter(doc => 
    doc.status === 'review' && 
    (doc.assignedSupervisor === user.username || user.role === 'supervisor')
  );

  const handleApprove = (documentId: string) => {
    onApproveDocument(documentId);
    setSelectedDocument(null);
    toast.success('Documento aprobado y publicado');
  };

  const handleReject = (documentId: string) => {
    onRejectDocument(documentId);
    setSelectedDocument(null);
    toast.success('Documento rechazado y devuelto a borrador');
  };

  if (reviewDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos en Revisión
          </CardTitle>
          <CardDescription>
            Gestiona los documentos que requieren aprobación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay documentos pendientes de revisión</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos en Revisión ({reviewDocuments.length})
          </CardTitle>
          <CardDescription>
            Documentos que requieren tu aprobación como supervisor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reviewDocuments.map((document) => (
              <div key={document.id} className="flex items-start justify-between p-4 border rounded-lg bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium truncate">{document.title}</h4>
                    {document.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        Alta Prioridad
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {document.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {document.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Autor: {document.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Enviado: {document.lastModified.toLocaleDateString('es-ES')}</span>
                    </div>
                    {document.reviewedBy && (
                      <div>
                        <span>Enviado por: {document.reviewedBy}</span>
                      </div>
                    )}
                  </div>

                  {document.targetUserGroups && document.targetUserGroups.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Grupos objetivo:</p>
                      <div className="flex flex-wrap gap-1">
                        {document.targetUserGroups.map(group => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {getRoleName(group)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>{document.title}</DialogTitle>
                        <DialogDescription>
                          Documento enviado para revisión por {document.reviewedBy || document.author}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] w-full">
                        <div className="space-y-4 p-4">
                          <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap">{document.content}</div>
                          </div>
                          
                          {document.attachedFiles && document.attachedFiles.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Archivos adjuntos:</h4>
                              <div className="space-y-1">
                                {document.attachedFiles.map((file, index) => (
                                  <div key={index} className="text-sm text-muted-foreground">
                                    📄 {file}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Separator />
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><strong>Categoría:</strong> {document.category}</p>
                              <p><strong>Prioridad:</strong> {document.priority === 'high' ? 'Alta' : 'Normal'}</p>
                              <p><strong>Requiere evidencia:</strong> {document.requiresEvidence ? 'Sí' : 'No'}</p>
                            </div>
                            <div>
                              <p><strong>Autor:</strong> {document.author}</p>
                              <p><strong>Última modificación:</strong> {document.lastModified.toLocaleString('es-ES')}</p>
                            </div>
                          </div>

                          {document.tags.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Etiquetas:</p>
                              <div className="flex flex-wrap gap-1">
                                {document.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(document.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button
                          onClick={() => handleApprove(document.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar y Publicar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    onClick={() => handleApprove(document.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(document.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}