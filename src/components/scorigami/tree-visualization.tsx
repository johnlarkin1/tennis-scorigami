import Tree from 'react-d3-tree';
import { TreeNode } from '@/types/tree-node';

export type TreeVisualizationProps = {
  treeData: TreeNode;
  viewType: 'horizontal' | 'vertical';
  resolvedTheme: string;
  showGradient: boolean;
  showCount: boolean;
  onNodeClick: (path: string[]) => void;
};

export const TreeVisualization = ({
  treeData,
  viewType,
  resolvedTheme,
  showGradient,
  showCount,
  onNodeClick,
}: TreeVisualizationProps) => {
  const renderCustomNode = ({ nodeDatum, toggleNode, hierarchyPointNode }: any) => {
    const handleNodeClick = () => {
      const sequence = nodeDatum.attributes?.sequence;

      if (nodeDatum.attributes?.isClickable && sequence) {
        const path = sequence.split(' ');
        onNodeClick(path); // Trigger the click handler to update selectedNodePath
        toggleNode(); // Toggle the node expansion
      }
    };

    const count = nodeDatum.attributes?.count || 0;
    const occurred = nodeDatum.attributes?.occurred;
    const isClickable = nodeDatum.attributes?.isClickable;
    const isDarkMode = resolvedTheme === 'dark';

    const fillColor = occurred
      ? isDarkMode
        ? 'rgb(0, 200, 0)'
        : 'rgb(0, 128, 0)' // Green for occurred scores
      : isDarkMode
      ? '#444'
      : '#ddd'; // Grey for non-occurred scores

    const fontColor = isDarkMode ? '#fff' : '#000';
    const nodeSize = Math.max(20 - hierarchyPointNode.depth * 2, 5);

    return (
      <g onClick={handleNodeClick} className={isClickable ? 'cursor-pointer' : ''}>
        <circle r={nodeSize} fill={fillColor} />
        {isClickable && (
          <circle
            r={nodeSize + 2}
            fill='none'
            stroke={isDarkMode ? 'rgb(0, 255, 0)' : 'rgb(0, 128, 0)'}
            strokeWidth='2'
            opacity='0.5'
            className='animate-pulse'
          />
        )}
        <text
          fill={fontColor}
          stroke='none'
          x={hierarchyPointNode.children ? -20 : 20}
          dy={'.35em'}
          textAnchor={hierarchyPointNode.children ? 'end' : 'start'}
          style={{ fontSize: '16px' }}
        >
          {nodeDatum.name}
        </text>
        {showCount && count > 0 && (
          <text
            fill={fontColor}
            stroke='none'
            x={hierarchyPointNode.children ? -20 : 20}
            dy={'1.5em'}
            textAnchor={hierarchyPointNode.children ? 'end' : 'start'}
            style={{ fontSize: '14px' }}
          >
            {`(${count})`}
          </text>
        )}
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tree
        data={treeData}
        orientation={viewType === 'horizontal' ? 'horizontal' : 'vertical'}
        pathFunc='diagonal'
        translate={{ x: 300, y: 300 }}
        collapsible={true}
        zoomable={true}
        nodeSize={{ x: 100, y: 100 }}
        separation={{ siblings: 1, nonSiblings: 2 }}
        renderCustomNodeElement={renderCustomNode}
      />
    </div>
  );
};
