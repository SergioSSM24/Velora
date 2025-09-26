import { useState } from 'react';
import { Upload, File, Info, CheckCircle, AlertCircle, Users, Star, Shield, Send, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { detectFileType, isValidFileType, getFileTypeDescription } from './utils/fileUtils';
import type { Document, User, UserRole } from './types';
import { hasEditPermission, hasSuperEditPermission, getSupervisors, sendEmailNotification } from './types';

interface DocumentUploadProps {
  user: User;
  onUpload: (document: Omit<Document, 'id' | 'lastModified' | 'author' | 'status' | 'evidenceFiles' | 'isFavorite'>) => void;
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

export function DocumentUpload({ user, onUpload }: DocumentUploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [detectedFileType, setDetectedFileType] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  // Nuevas opciones
  const [highPriority, setHighPriority] = useState(false);
  const [requiresEvidence, setRequiresEvidence] = useState(false);
  const [goToReview, setGoToReview] = useState(false);
  const [assignedSupervisor, setAssignedSupervisor] = useState('');
  const [targetUserGroups, setTargetUserGroups] = useState<UserRole[]>([]);

  const canEdit = hasEditPermission(user.role);
  const canSuperEdit = hasSuperEditPermission(user.role);
  const supervisors = getSupervisors();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-llenar el título si está vacío
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName);
      }
      
      // Detectar automáticamente el tipo de archivo
      const fileType = detectFileType(selectedFile.name);
      setDetectedFileType(fileType);
      
      // Limpiar error si había uno previo
      setError('');
    }
  };

  const handleUserGroupToggle = (role: UserRole, checked: boolean) => {
    if (checked) {
      setTargetUserGroups(prev => [...prev, role]);
    } else {
      setTargetUserGroups(prev => prev.filter(r => r !== role));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !category || !content) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (targetUserGroups.length === 0) {
      setError('Debes seleccionar al menos un grupo de usuarios');
      return;
    }

    if (goToReview && !assignedSupervisor) {
      setError('Debes seleccionar un supervisor para la revisión');
      return;
    }

    // Si hay un archivo pero el tipo no es válido, mostrar advertencia
    if (file && detectedFileType && !isValidFileType(detectedFileType)) {
      setError(`El tipo de archivo "${detectedFileType}" puede no ser compatible con el sistema. Los tipos recomendados son: PDF, DOCX, PPTX, XLSX, TXT.`);
      return;
    }

    // Determinar el estado del documento
    let status: 'draft' | 'review' | 'published' = 'published';
    if (goToReview && canEdit && !canSuperEdit) {
      status = 'review';
      // Enviar notificación por email al supervisor
      if (assignedSupervisor) {
        sendEmailNotification(
          assignedSupervisor,
          'Nuevo documento para revisión',
          `El usuario ${user.username} ha enviado el documento "${title}" para su revisión.`
        );
      }
    } else if (!canSuperEdit) {
      status = 'draft';
    }

    onUpload({
      title,
      content,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      priority: highPriority ? 'high' : 'normal',
      requiresEvidence,
      assignedSupervisor: goToReview ? assignedSupervisor : undefined,
      targetUserGroups,
      reviewedBy: goToReview ? user.username : undefined
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setTags('');
    setDetectedFileType('');
    setContent('');
    setFile(null);
    setHighPriority(false);
    setRequiresEvidence(false);
    setGoToReview(false);
    setAssignedSupervisor('');
    setTargetUserGroups([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="file">Archivo (opcional)</Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <File className="w-8 h-8 mb-2 text-primary" />
                  <p className="text-sm">{file.name}</p>
                  {detectedFileType && (
                    <div className="flex items-center space-x-2 mt-2">
                      {isValidFileType(detectedFileType) ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <Badge 
                        variant={isValidFileType(detectedFileType) ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {detectedFileType}
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para seleccionar un archivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    El tipo se detectará automáticamente
                  </p>
                </>
              )}
            </div>
            <Input
              id="file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        
        {/* Información del tipo detectado */}
        {detectedFileType && (
          <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Tipo detectado: {detectedFileType}</p>
              <p className="text-muted-foreground">
                {getFileTypeDescription(detectedFileType)}
              </p>
              {!isValidFileType(detectedFileType) && (
                <p className="text-orange-600 mt-1">
                  Advertencia: Este tipo de archivo puede no ser totalmente compatible.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del documento"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del documento"
          rows={3}
          required
        />
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

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Etiquetas (opcional)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Etiquetas separadas por comas (ej: importante, urgente, revisión)"
        />
        <p className="text-xs text-muted-foreground">
          Las etiquetas ayudan a organizar y buscar documentos más fácilmente
        </p>
      </div>

      {/* Content Preview */}
      <div className="space-y-2">
        <Label htmlFor="content">Contenido del documento *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe aquí el contenido principal del documento..."
          rows={8}
          required
        />
      </div>

      {/* Grupos de usuarios objetivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Grupos de Usuario Objetivo *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona qué grupos de usuarios podrán ver este documento
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['corporativo', 'corporativo-plus', 'personal-tienda', 'supervisor'] as UserRole[]).map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${role}`}
                  checked={targetUserGroups.includes(role)}
                  onCheckedChange={(checked) => handleUserGroupToggle(role, !!checked)}
                />
                <Label htmlFor={`group-${role}`} className="text-sm">
                  {role === 'corporativo' && 'Corporativo'}
                  {role === 'corporativo-plus' && 'Corporativo+'}
                  {role === 'personal-tienda' && 'Personal de Tienda'}
                  {role === 'supervisor' && 'Supervisor'}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opciones avanzadas para editores */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Opciones de Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prioridad Alta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-amber-500" />
                <Label htmlFor="high-priority">Prioridad Alta</Label>
              </div>
              <Switch
                id="high-priority"
                checked={highPriority}
                onCheckedChange={setHighPriority}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Los documentos de alta prioridad se destacan para atención inmediata
            </p>

            {/* Requiere Evidencia */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <Label htmlFor="requires-evidence">Requiere Evidencia</Label>
              </div>
              <Switch
                id="requires-evidence"
                checked={requiresEvidence}
                onCheckedChange={setRequiresEvidence}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Los usuarios lectores deberán adjuntar archivos PDF como evidencia
            </p>

            {/* Enviar a Revisión - Solo para Corporativo+ */}
            {user.role === 'corporativo-plus' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4 text-green-500" />
                    <Label htmlFor="go-to-review">Enviar a Revisión</Label>
                  </div>
                  <Switch
                    id="go-to-review"
                    checked={goToReview}
                    onCheckedChange={setGoToReview}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El documento será enviado a revisión antes de ser publicado
                </p>

                {/* Selector de Supervisor */}
                {goToReview && (
                  <div className="space-y-2">
                    <Label>Supervisor Asignado *</Label>
                    <Select value={assignedSupervisor} onValueChange={setAssignedSupervisor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors.map(supervisor => (
                          <SelectItem key={supervisor.username} value={supervisor.username}>
                            {supervisor.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          <Upload className="w-4 h-4 mr-2" />
          {goToReview ? 'Subir y Enviar a Revisión' : 'Subir Documento'}
        </Button>
      </div>
    </form>
  );
}