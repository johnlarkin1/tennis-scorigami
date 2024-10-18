import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  name: string;
  children?: TreeNode[];
  occurred?: boolean;
}

interface RadialTreeProps {
  data: TreeNode;
  onNodeClick: (node: any) => void;
}

const RadialTree: React.FC<RadialTreeProps> = ({ data, onNodeClick }) => {
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

    const svgGroup = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const root = d3.hierarchy<TreeNode>(data);

    const treeLayout = d3
      .tree<TreeNode>()
      .size([2 * Math.PI, Math.min(width, height) / 2 - 100])
      .separation(() => 1);

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
          .linkRadial()
          .angle((d: any) => d.x)
          .radius((d: any) => d.y)
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
      .attr('transform', (d: any) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`)
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
      .attr('dy', '.31em')
      .attr('x', (d: any) => (d.x < Math.PI === !d.children ? 10 : -10))
      .attr('text-anchor', (d: any) => (d.x < Math.PI === !d.children ? 'start' : 'end'))
      .attr('transform', (d: any) => (d.x >= Math.PI ? 'rotate(180)' : null))
      .text((d: any) => d.data.name)
      .attr('fill', '#fff'); // Set text color to white
  }, [data, onNodeClick]);

  return <svg ref={svgRef} className='w-full h-full' />;
};

export default RadialTree;
