// src/types/3d-force-graph.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "3d-force-graph" {
  interface ForceGraph3DInstance {
    graphData(data: { nodes: any[]; links: any[] }): ForceGraph3DInstance;
    nodeId(accessor: string | ((node: any) => any)): ForceGraph3DInstance;
    nodeLabel(accessor: string | ((node: any) => string)): ForceGraph3DInstance;
    nodeVal(accessor: string | ((node: any) => number)): ForceGraph3DInstance;
    nodeResolution(resolution: number): ForceGraph3DInstance;
    nodeColor(accessor: string | ((node: any) => string)): ForceGraph3DInstance;
    linkSource(accessor: string | ((link: any) => any)): ForceGraph3DInstance;
    linkTarget(accessor: string | ((link: any) => any)): ForceGraph3DInstance;
    linkColor(accessor: string | ((link: any) => string)): ForceGraph3DInstance;
    linkWidth(accessor: string | ((link: any) => number)): ForceGraph3DInstance;
    linkDirectionalArrowLength(
      length: number | string | ((link: any) => number)
    ): ForceGraph3DInstance;
    linkDirectionalArrowRelPos(
      ratio: number | string | ((link: any) => number)
    ): ForceGraph3DInstance;
    backgroundColor(color: string): ForceGraph3DInstance;
    onNodeClick(
      callback: (node: any, event: MouseEvent) => void
    ): ForceGraph3DInstance;
    onNodeHover(
      callback: (node: any | null, previousNode: any | null) => void
    ): ForceGraph3DInstance;
    onLinkClick(
      callback: (link: any, event: MouseEvent) => void
    ): ForceGraph3DInstance;
    onLinkHover(
      callback: (link: any | null, previousLink: any | null) => void
    ): ForceGraph3DInstance;
    d3Force(forceName: string): any;
    d3Force<T>(forceName: string, force: T): ForceGraph3DInstance;
    width(width: number): ForceGraph3DInstance;
    height(height: number): ForceGraph3DInstance;
    cameraPosition(
      position: { x?: number; y?: number; z?: number },
      lookAt?: { x?: number; y?: number; z?: number } | any,
      transitionDuration?: number
    ): ForceGraph3DInstance;
    _destructor(): void;
  }

  const ForceGraph3D: () => (element: HTMLElement) => ForceGraph3DInstance;
  export default ForceGraph3D;
}
