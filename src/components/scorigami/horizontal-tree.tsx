import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  name: string;
  children?: TreeNode[];
  occurred?: boolean;
}

interface HorizontalTreeProps {
  data: TreeNode;
  onNodeClick: (node: any) => void;
}

const HorizontalTree: React.FC<HorizontalTreeProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data) return;

    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;

    // Clear previous content
    d3.select(svgElement).selectAll('*').remove();

    const svg = d3
      .select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
          svgGroup.attr('transform', event.transform);
        })
      );

    const svgGroup = svg.append('g').attr('transform', `translate(40,0)`);

    const root = d3.hierarchy<TreeNode>(data);
    const treeLayout = d3.tree<TreeNode>().size([height, width - 160]);

    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    /*** Links ***/
    svgGroup
      .selectAll('path.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkHorizontal<d3.HierarchyLink<TreeNode>, d3.HierarchyNode<TreeNode>>()
          .x((d) => d.y as number)
          .y((d) => d.x as number)
      )
      .attr('fill', 'none')
      .attr('stroke', '#ccc');

    /*** Nodes ***/
    const node = svgGroup
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      });

    node
      .append('circle')
      .attr('r', (d: any) => Math.max(5, 10 - d.depth * 1.5)) // Decrease node size with depth
      .attr('fill', (d: any) => (d.data.occurred ? 'green' : 'black'));

    node
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => (d.children || d._children ? -13 : 13))
      .attr('text-anchor', (d: any) => (d.children || d._children ? 'end' : 'start'))
      .text((d: any) => d.data.name)
      .attr('fill', '#fff'); // Set text color to white
  }, [data, onNodeClick]);

  return <svg ref={svgRef} className='w-full h-full' />;
};

export default HorizontalTree;
