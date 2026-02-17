import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Zap, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Compiler() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [buildType, setBuildType] = useState<"debug" | "release">("release");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`Arquivo selecionado: ${file.name}`);
    }
  };

  const handleCompile = () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    toast.info("Este é um site estático de demonstração. Para compilar APKs reais, você precisa de um servidor backend.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Android APK Compiler</h1>
          </div>
          <p className="text-slate-400 text-lg">Compilação automatizada de projetos Android</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Features */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <Zap className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-white font-semibold mb-2">Rápido</h3>
            <p className="text-slate-400 text-sm">Compilação otimizada e eficiente</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <Shield className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-white font-semibold mb-2">Seguro</h3>
            <p className="text-slate-400 text-sm">Seus arquivos são processados com segurança</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <Clock className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-white font-semibold mb-2">Histórico</h3>
            <p className="text-slate-400 text-sm">Acesse builds anteriores facilmente</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Selecionar Projeto</h2>

            <div className="space-y-4">
              {/* Build Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Tipo de Build
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="debug"
                      checked={buildType === "debug"}
                      onChange={(e) => setBuildType(e.target.value as "debug" | "release")}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">Debug (Teste)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="release"
                      checked={buildType === "release"}
                      onChange={(e) => setBuildType(e.target.value as "debug" | "release")}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">Release (Produção)</span>
                  </label>
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Arquivo do Projeto
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-slate-300 font-medium">
                      {selectedFile ? selectedFile.name : "Clique para selecionar arquivo"}
                    </p>
                    <p className="text-slate-500 text-sm mt-2">ZIP, RAR ou 7Z</p>
                  </label>
                </div>
              </div>

              {/* Compile Button */}
              <Button
                onClick={handleCompile}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-6 text-lg rounded-lg"
              >
                Compilar APK
              </Button>

              <Button
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700"
                onClick={() => {
                  setSelectedFile(null);
                  toast.info("Arquivo removido");
                }}
              >
                Cancelar
              </Button>
            </div>
          </Card>

          {/* Info Section */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Informações</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-emerald-400 font-semibold mb-2">📋 Como usar:</h3>
                <ol className="text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Selecione o tipo de build (Debug ou Release)</li>
                  <li>Escolha seu arquivo de projeto (ZIP, RAR ou 7Z)</li>
                  <li>Clique em "Compilar APK"</li>
                  <li>Aguarde a compilação ser concluída</li>
                  <li>Baixe seu APK compilado</li>
                </ol>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-emerald-400 font-semibold mb-2">⚠️ Nota:</h3>
                <p className="text-slate-300 text-sm">
                  Este é um site estático de demonstração. Para usar a compilação real de APKs, você precisa de um servidor backend com as ferramentas Android SDK configuradas.
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-emerald-400 font-semibold mb-2">💡 Dica:</h3>
                <p className="text-slate-300 text-sm">
                  Você pode integrar este frontend com um servidor backend (Node.js, Python, etc) para adicionar funcionalidade real de compilação.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
