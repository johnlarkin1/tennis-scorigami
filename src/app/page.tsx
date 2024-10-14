import EnhancedSetScoreVisualization from '../components/EnhancedSetScoreVisualization';
import ScorigamiTreeVisualization from '../components/ScorigamiTreeVisualization';

export default function Home() {
  return (
    <div>
      {false && <EnhancedSetScoreVisualization />}
      <ScorigamiTreeVisualization />
    </div>
  );
}
