import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, ArrowLeft, Download, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function History() {
  const { data: builds, isLoading } = trpc.build.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sucesso
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Falhou
          </Badge>
        );
      case "compiling":
        return (
          <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Compilando
          </Badge>
        );
      case "validating":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Validando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <a href="/">
                  <ArrowLeft className="w-5 h-5" />
                </a>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Histórico de Compilações</h1>
                  <p className="text-xs text-muted-foreground">Visualize todas as suas compilações anteriores</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {!builds || builds.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <Clock className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Nenhuma compilação ainda</h2>
              <p className="text-muted-foreground mb-6">
                Faça upload do seu primeiro projeto Android para começar
              </p>
              <Button asChild>
                <a href="/">Compilar Projeto</a>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {builds.map((build) => (
                <Card key={build.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {build.projectName || "Projeto Android"}
                          {getStatusBadge(build.status)}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">Modo: {build.buildType}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(build.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                      {build.status === "success" && build.apkUrl && (
                        <Button asChild size="sm">
                          <a href={build.apkUrl} download>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar APK
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  {build.errorMessage && (
                    <CardContent className="pt-0">
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          <strong>Erro:</strong> {build.errorMessage}
                        </p>
                      </div>
                    </CardContent>
                  )}

                  {build.logs && build.status !== "success" && (
                    <CardContent className="pt-0">
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Ver logs completos
                        </summary>
                        <div className="mt-2 p-3 bg-slate-950 rounded-md overflow-auto max-h-[300px]">
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                            {build.logs}
                          </pre>
                        </div>
                      </details>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
