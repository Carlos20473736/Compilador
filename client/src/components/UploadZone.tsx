import { useState, useCallback } from "react";
import { Upload, FileArchive, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UploadZoneProps {
  onUploadStart: (file: File, buildType: "debug" | "release") => void;
  isUploading: boolean;
}

export default function UploadZone({ onUploadStart, isUploading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [buildType, setBuildType] = useState<"debug" | "release">("debug");
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith(".zip")) {
      return "Apenas arquivos ZIP são permitidos";
    }
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return "Arquivo muito grande. Tamanho máximo: 100MB";
    }

    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]!;
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]!;
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    onUploadStart(selectedFile, buildType);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-6">
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className={`p-6 rounded-full transition-all duration-300 ${
              isDragging ? "bg-primary/20 scale-110" : "bg-muted"
            }`}>
              {selectedFile ? (
                <FileArchive className="w-12 h-12 text-primary" />
              ) : (
                <Upload className={`w-12 h-12 transition-colors ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`} />
              )}
            </div>
          </div>

          {selectedFile ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <div className="flex justify-center">
                <RadioGroup
                  value={buildType}
                  onValueChange={(value) => setBuildType(value as "debug" | "release")}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debug" id="debug" />
                    <Label htmlFor="debug" className="cursor-pointer">
                      Debug (Teste)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="release" id="release" />
                    <Label htmlFor="release" className="cursor-pointer">
                      Release (Produção)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isUploading ? "Enviando..." : "Compilar APK"}
                </Button>
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                  size="lg"
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                {isDragging ? "Solte o arquivo aqui" : "Arraste seu projeto Android"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Faça upload do arquivo ZIP do seu projeto Android para compilar automaticamente
              </p>
              
              <div className="pt-4">
                <input
                  type="file"
                  id="file-input"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  onClick={() => document.getElementById("file-input")?.click()}
                  variant="outline"
                  size="lg"
                  disabled={isUploading}
                >
                  Selecionar Arquivo
                </Button>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Tamanho máximo: 100MB • Formato: ZIP
              </p>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
