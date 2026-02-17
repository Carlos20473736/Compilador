import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle, Loader2, Terminal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompilationLogsProps {
  buildId: number;
  onComplete: (success: boolean, apkUrl?: string) => void;
}

export default function CompilationLogs({ buildId, onComplete }: CompilationLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"connecting" | "compiling" | "success" | "failed">("connecting");
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/build/${buildId}/logs`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          setStatus("compiling");
        } else if (data.type === "log") {
          setLogs((prev) => [...prev, data.message]);
        } else if (data.type === "complete") {
          if (data.success) {
            setStatus("success");
            setApkUrl(data.apkUrl);
            onComplete(true, data.apkUrl);
          } else {
            setStatus("failed");
            onComplete(false);
          }
          eventSource.close();
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = () => {
      setStatus("failed");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [buildId, onComplete]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status === "connecting" && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <CardTitle className="text-lg">Conectando...</CardTitle>
                </>
              )}
              {status === "compiling" && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <CardTitle className="text-lg">Compilando...</CardTitle>
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <CardTitle className="text-lg text-green-600">Compilação Concluída!</CardTitle>
                </>
              )}
              {status === "failed" && (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-lg text-red-600">Compilação Falhou</CardTitle>
                </>
              )}
            </div>

            {status === "success" && apkUrl && (
              <Button asChild>
                <a href={apkUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar APK
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Logs Terminal */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-mono">Logs de Compilação</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]" ref={scrollRef}>
            <div className="p-4 font-mono text-sm space-y-1 bg-slate-950 text-slate-100">
              {logs.length === 0 ? (
                <div className="text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aguardando logs...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`leading-relaxed ${
                      log.includes("❌") || log.includes("ERROR") || log.includes("FAILED")
                        ? "text-red-400"
                        : log.includes("✅") || log.includes("SUCCESS")
                        ? "text-green-400"
                        : log.includes("⚠️") || log.includes("WARNING")
                        ? "text-yellow-400"
                        : log.includes("🚀") || log.includes("📦") || log.includes("🔨")
                        ? "text-blue-400"
                        : "text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {status === "failed" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            A compilação falhou. Verifique os logs acima para mais detalhes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
