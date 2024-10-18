import EnhancedSetScoreVisualization from '../archived/EnhancedSetScoreVisualization';
import ScorigamiTreeVisualization from '../components/scorigami-tree-viz';
import TennisScorigamiVisualization from '../archived/ScorigamiTreeVisualizationCore';

export default function Home() {
  return (
    <div>
      {false && <EnhancedSetScoreVisualization />}
      {true && <ScorigamiTreeVisualization />}
      {false && <TennisScorigamiVisualization />}
    </div>
  );
}
