import VslPlayer from '@/components/vsl-player';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background text-foreground">
      <div className="container mx-auto flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl font-headline max-w-4xl">
          O Indicador da Estratégia Chinesa que Está Transformando Iniciantes em Traders Lucrativos
        </h1>
        <VslPlayer videoId="Rrx_PoE8hKQ" />
      </div>
    </main>
  );
}
