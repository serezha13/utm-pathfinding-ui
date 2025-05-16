import PathfindingVisualizer from "@/components/pathfinding-visualizer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">
        Vizualizator de algoritm de căutare a traseelor
      </h1>
      <p className="text-gray-600 mb-8 max-w-2xl text-center">
        Vizualizați cum funcționează diferiți algoritmi de găsire a căilor.
        Selectați un algoritm, creați pereți, setați puncte de început și de
        sfârșit și urmăriți cum algoritmul găsește o cale!
      </p>
      <PathfindingVisualizer />
    </main>
  );
}
