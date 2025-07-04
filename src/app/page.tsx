import VslPlayer from '@/components/vsl-player';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
      <div className="w-full bg-red-600 text-white p-3 text-center font-bold text-lg">
        ATENÇÃO: SEU ACESSO SERÁ LIBERADO NO FINAL DO VÍDEO!
      </div>
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 w-full">
        <div className="container mx-auto flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl font-headline max-w-4xl">
            O Indicador da Estratégia Chinesa que Está Transformando Iniciantes em Traders Lucrativos
          </h1>
          <VslPlayer videoId="Rrx_PoE8hKQ" />
        </div>
      </div>
    </main>
  );
}
