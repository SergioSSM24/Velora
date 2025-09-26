import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Document, User, canUploadEvidence } from './types';
import { FileText, Upload, X, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EvidenceUploaderProps {
  document: Document;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUploadEvidence: (documentId: string, fileName: string) => void;
  onRemoveEvidence: (documentId: string, fileName: string) => void;
}

export function EvidenceUploader({ 
  document, 
  user, 
  isOpen, 
  onClose, 
  onUploadEvidence, 
  onRemoveEvidence 
}: EvidenceUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canUpload = canUploadEvidence(user.role) && document.requiresEvidence;
  const userEvidence = document.evidenceFiles[user.username] || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('El archivo no puede ser mayor a 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Simular upload del archivo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onUploadEvidence(document.id, selectedFile.name);
      toast.success('Evidencia subida exitosamente');
      
      setSelectedFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveEvidence = (fileName: string) => {
    onRemoveEvidence(document.id, fileName);
    toast.success('Evidencia eliminada');
  };

  if (!canUpload) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subir Evidencia</DialogTitle>
            <DialogDescription>
              Este documento no requiere evidencia o no tienes permisos para subirla.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Evidencia - {document.title}
          </DialogTitle>
          <DialogDescription>
            Sube un archivo PDF como evidencia de haber leído y firmado este documento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Evidencia existente */}
          {userEvidence.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tu evidencia subida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userEvidence.map((fileName, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{fileName}</span>
                      <Badge variant="outline" className="text-xs">PDF</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // En un sistema real, esto abriría/descargaría el archivo
                          toast.info('Descargando archivo...');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEvidence(fileName)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Subir nueva evidencia */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="evidence-file">Seleccionar archivo PDF</Label>
              <Input
                id="evidence-file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Solo se permiten archivos PDF</p>
              <p>• Tamaño máximo: 10MB</p>
              <p>• Puedes subir múltiples archivos como evidencia</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir Evidencia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}