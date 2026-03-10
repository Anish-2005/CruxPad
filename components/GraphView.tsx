"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import type { KnowledgeGraphData } from "@/lib/types";

interface GraphViewProps {
  graph: KnowledgeGraphData;
}

function nodeColor(group: string) {
  if (group === "concept") return "#1d4ed8";
  if (group === "formula") return "#166534";
  if (group === "example") return "#7c2d12";
  return "#334155";
}

function buildPositionedNodes(graph: KnowledgeGraphData): Node[] {
  return graph.nodes.map((node, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;

    return {
      id: node.id,
      position: { x: col * 230, y: row * 130 },
      data: { label: node.label },
      style: {
        borderRadius: 12,
        border: `1px solid ${nodeColor(node.group)}`,
        color: "#0f172a",
        fontWeight: 600,
        minWidth: 170,
        background: "#ffffff",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
      },
    };
  });
}

function buildEdges(graph: KnowledgeGraphData): Edge[] {
  return graph.edges.map((edge, index) => ({
    id: `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label || "",
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
    style: {
      strokeWidth: 1.8,
      stroke: "#334155",
    },
    labelStyle: {
      fill: "#334155",
      fontSize: 11,
      fontWeight: 600,
    },
    type: "smoothstep",
  }));
}

export default function GraphView({ graph }: GraphViewProps) {
  const nodes = useMemo(() => buildPositionedNodes(graph), [graph]);
  const edges = useMemo(() => buildEdges(graph), [graph]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Knowledge Graph</h3>
        <p className="text-xs text-slate-500">
          Dependency map of concepts extracted from the source material.
        </p>
      </header>

      {nodes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
          No graph nodes available.
        </p>
      ) : (
        <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-200">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={18} />
            <MiniMap zoomable pannable nodeColor={(node) => (node.style?.borderColor as string) || "#1e293b"} />
            <Controls position="bottom-right" />
          </ReactFlow>
        </div>
      )}
    </section>
  );
}

