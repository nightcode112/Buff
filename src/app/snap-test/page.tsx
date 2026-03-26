export default function SnapTest() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      <section className="h-screen flex items-center justify-center bg-red-500/10 snap-start">
        <h1 className="text-6xl font-bold">Hero</h1>
      </section>
      <section className="h-screen flex items-center justify-center bg-blue-500/10 snap-start">
        <h1 className="text-6xl font-bold">Features</h1>
      </section>
      <section className="h-screen flex items-center justify-center bg-green-500/10 snap-start">
        <h1 className="text-6xl font-bold">Footer</h1>
      </section>
    </div>
  );
}
