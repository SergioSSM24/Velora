import { useState, useEffect } from 'react';
import { Save, X, Info, Upload, File, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { detectFileType, isValidFileType, getFileTypeDescription } from './utils/fileUtils';
import type { Document } from './types';

interface DocumentEditProps {
  document: Document;
  onSave: (updatedDocument: Document) => void;
  onCancel: () => void;
}

const categories = [
  'Manuales',
  'Políticas',
  'Procedimientos',
  'Planificación',
  'Reportes',
  'Contratos',
  'Otros'
];

export function DocumentEdit({ document, onSave, onCancel }: DocumentEditProps) {
  const [title, setTitle] = useState(document.title);
  const [category, setCategory] = useState(document.category);
  const [content, setContent] = useState(document.content);
  const [tags, setTags] = useState(document.tags.join(', '));
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileType, setNewFileType] = useState<string>('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setNewFile(selectedFile);
      
      // Auto-llenar el título si coincide con el nombre del archivo
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      if (title === document.title || !title.trim()) {
        setTitle(fileNameWithoutExt);
      }
      
      // Detectar automáticamente el tipo de archivo
      const detectedType = detectFileType(selectedFile.name);
      setNewFileType(detectedType);
      
      // Limpiar error si había uno previo
      setError('');
    }
  };

  const handleRemoveNewFile = () => {
    setNewFile(null);
    setNewFileType('');
    // Restaurar título original si se había cambiado por el archivo
    if (newFile && title === newFile.name.replace(/\.[^/.]+$/, '')) {
      setTitle(document.title);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !category || !content) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    // Si hay un nuevo archivo pero el tipo no es válido, mostrar advertencia
    if (newFile && newFileType && !isValidFileType(newFileType)) {
      setError(`El tipo de archivo "${newFileType}" puede no ser compatible con el sistema. Los tipos recomendados son: PDF, DOCX, PPTX, XLSX, TXT.`);
      return;
    }

    // Determinar el tipo de archivo final
    const finalFileType = newFile && newFileType ? newFileType : document.fileType;

    const updatedDocument: Document = {
      ...document,
      title,
      category,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    onSave(updatedDocument);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Editar Documento</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="edit-title">Título *</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del documento"
            required
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="edit-tags">Etiquetas</Label>
          <Input
            id="edit-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Etiquetas separadas por comas (ej: importante, urgente, revisión)"
          />
          <p className="text-xs text-muted-foreground">
            Las etiquetas ayudan a organizar y buscar documentos más fácilmente
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Archivos adjuntos */}
        <div className="space-y-3">
          <Label>Archivos adjuntos (opcional)</Label>
          <div className="space-y-3">
            {/* Archivos adjuntos actuales */}
            {document.attachedFiles && document.attachedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Archivos adjuntos actuales:</p>
                {document.attachedFiles.map((fileName, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <File className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{fileName}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Nuevo archivo */}
            {!newFile ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="replace-file"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <RefreshCcw className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Adjuntar archivo
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Opcional: agregar archivo adjunto
                  </p>
                  <Input
                    id="replace-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Archivo adjunto: {newFile.name}</p>
                      {newFileType && (
                        <div className="flex items-center space-x-2 mt-1">
                          {isValidFileType(newFileType) ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                          )}
                          <Badge 
                            variant={isValidFileType(newFileType) ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {newFileType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getFileTypeDescription(newFileType)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveNewFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {newFileType && !isValidFileType(newFileType) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Este tipo de archivo puede no ser totalmente compatible con el sistema.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>



        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="edit-content">Contenido *</Label>
          <Textarea
            id="edit-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenido del documento"
            rows={8}
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}