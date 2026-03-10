"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import type { KnowledgeGraphData } from "@/lib/types";

interface GraphViewProps {
  graph: KnowledgeGraphData;
}

function nodeColor(group: string) {
  if (group === "concept") return "#0f5bd8";
  if (group === "formula") return "#0b6f58";
  if (group === "example") return "#946300";
  return "#43536c";
}

function buildPositionedNodes(graph: KnowledgeGraphData): Node[] {
  return graph.nodes.map((node, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const color = nodeColor(node.group);

    return {
      id: node.id,
      position: { x: col * 230, y: row * 130 },
      data: { label: node.label },
      style: {
        borderRadius: 14,
        border: `1px solid ${color}`,
        color: "#101827",
        fontWeight: 700,
        minWidth: 170,
        background: "#ffffff",
        boxShadow: "0 10px 24px rgba(16, 24, 39, 0.08)",
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
      stroke: "#415069",
    },
    labelStyle: {
      fill: "#43536c",
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
    <section className="surface-card-strong rounded-2xl p-5">
      <header className="mb-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Knowledge Graph</h3>
        <p className="text-xs text-[var(--text-muted)]">
          Dependency map of concepts extracted from the source material.
        </p>
      </header>

      {nodes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border-soft)] px-3 py-4 text-sm text-[var(--text-muted)]">
          No graph nodes available.
        </p>
      ) : (
        <div className="h-[420px] w-full overflow-hidden rounded-xl border border-[var(--border-soft)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#d6e0f0" gap={18} />
            <MiniMap
              zoomable
              pannable
              nodeColor={(node) => (node.style?.borderColor as string) || "#43536c"}
            />
            <Controls position="bottom-right" />
          </ReactFlow>
        </div>
      )}
    </section>
  );
}

