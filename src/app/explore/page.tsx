import { ForceGraphControls } from "@/components/force-graph/controls";
import { ForceGraph } from "@/components/force-graph/graph";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Explore Tennis Scorigami Data
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto text-center mb-12">
            Visualize the relationships between tennis scores and match outcomes
            in an interactive 3D force graph. Use the controls below to filter
            the data and customize the visualization.
          </p>

          {/* Force Graph Controls */}
          <ForceGraphControls />

          {/* Force Graph Visualization */}
          <div
            className="mt-8 bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            style={{ height: "70vh", minHeight: "500px" }}
          >
            <ForceGraph />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
