import VslPlayer from '@/components/vsl-player';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background text-foreground">
      {/* Adicionado para forçar nova implantação no GitHub Pages */}
      <div className="w-full bg-red-600 text-white p-2 md:p-3 text-center font-bold text-base md:text-lg">
        ATENÇÃO: SEU ACESSO SERÁ LIBERADO NO FINAL DO VÍDEO!
      </div>
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 w-full">
        <div className="container mx-auto flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl lg:text-5xl font-headline max-w-4xl uppercase">
            Descubra como uma estratégia chinesa está transformando a vida de pessoas comuns usando <span className="text-primary">apenas o celular.</span>
          </h1>
          <VslPlayer videoId="ewlGNXdH7oM" />
        </div>
      </div>
    </main>
  );
}