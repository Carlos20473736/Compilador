import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Zap, Shield, Clock } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import CompilationLogs from "@/components/CompilationLogs";
import { toast } from "sonner";

export default function Compiler() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<number | null>(null);
  const [compilationComplete, setCompilationComplete] = useState(false);
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string | null>(null);

  const handleUploadStart = async (file: File, buildType: "debug" | "release") => {
    setIsUploading(true);
    setCompilationComplete(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("buildType", buildType);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const data = await response.json();
      setCurrentBuildId(data.buildId);
      toast.success(`Upload concluído! Iniciando compilação de ${data.projectName}...`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao fazer upload");
      setIsUploading(false);
    }
  };

  const handleCompilationComplete = (success: boolean, apkUrl?: string) => {
    setIsUploading(false);
    setCompilationComplete(true);

    if (success && apkUrl) {
      setApkDownloadUrl(apkUrl);
      toast.success("APK compilado com sucesso! Clique no botão para baixar.");
    } else {
      toast.error("Falha na compilação. Verifique os logs.");
    }
  };

  const handleNewCompilation = () => {
    setCurrentBuildId(null);
    setCompilationComplete(false);
    setApkDownloadUrl(null);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Android APK Compiler</h1>
                <p className="text-xs text-muted-foreground">Compilação automatizada de projetos Android</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/history">Histórico</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Features Banner */}
        {!currentBuildId && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold text-sm mb-1">Rápido</h3>
              <p className="text-xs text-muted-foreground">Compilação otimizada</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold text-sm mb-1">Seguro</h3>
              <p className="text-xs text-muted-foreground">Ambiente isolado</p>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold text-sm mb-1">Histórico</h3>
              <p className="text-xs text-muted-foreground">Acesse builds anteriores</p>
            </Card>
            <Card className="p-4 text-center">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold text-sm mb-1">Debug & Release</h3>
              <p className="text-xs text-muted-foreground">Ambos os modos</p>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!currentBuildId ? (
            <UploadZone onUploadStart={handleUploadStart} isUploading={isUploading} />
          ) : (
            <div className="space-y-4">
              <CompilationLogs buildId={currentBuildId} onComplete={handleCompilationComplete} />
              
              {compilationComplete && (
                <div className="flex flex-col items-center gap-4 pt-4">
                  {apkDownloadUrl && (
                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                      <a href={apkDownloadUrl} download>
                        📥 Baixar APK
                      </a>
                    </Button>
                  )}
                  <Button onClick={handleNewCompilation} size="lg" variant="outline">
                    Nova Compilação
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
