import { useRef, useState, useEffect } from "react";
import Tree, { RawNodeDatum } from "react-d3-tree";

// ✅ Tree Data
const myTreeData: RawNodeDatum[] = [
  {
    name: "Gaurang Torvekar",
    attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
    children: [
      {
        name: "Avadhoot",
        attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
        children: [
          { name: "Richard" },
          {
            name: "Constantine",
            children: [{ name: "Mia" }],
          },
          { name: "Daniel" },
        ],
      },
      { name: "Mia" },
      {
        name: "Varun",
        attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
        children: [
          {
            name: "Ivo",
            attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
            children: [
              {
                name: "Level 2: A",
                attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
                children: [
                  {
                    name: "Level 2: A",
                    attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
                  },
                  { name: "Level 2: B" },
                ],
              },
              { name: "Level 2: B" },
            ],
          },
          { name: "Vijay" },
        ],
      },
      {
        name: "Mohit",
        children: [
          {
            name: "Rohit",
            attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
            children: [
              {
                name: "Level 2: A",
                attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
                children: [
                  {
                    name: "Level 2: A",
                    attributes: { keyA: "val A", keyB: "val B", keyC: "val C" },
                  },
                  { name: "Level 2: B" },
                ],
              },
            ],
          },
          { name: "Pranav" },
        ],
      },
    ],
  },
];



export default function MyTree() {
  const treeContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!treeContainer.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });

        // ✅ Center the tree horizontally
        setTranslate({ x: width / 2, y: 80 });

        // ✅ Auto-scale tree to fit (optional, here a simple heuristic)
        const baseWidth = 800; // assume your tree needs ~800px width
        const scale = Math.min(width / baseWidth, 1); // cap zoom at 1
        setZoom(scale);
      }
    });

    resizeObserver.observe(treeContainer.current);
    return () => resizeObserver.disconnect();
  }, []);

  const renderNodeWithCustomHtml = ({
  nodeDatum,
  toggleNode,
}: {
  nodeDatum: RawNodeDatum;
  toggleNode: () => void;
}) => (
  <foreignObject width="150" height="60" x={-75} y={-30}>
    <div
      onClick={toggleNode}
      className="
        bg-violet-800 border-2 border-black 
        rounded-xl px-4 py-2 shadow-md 
         text-sm text-center font-bold text-white 
        hover:bg-violet-900 transition cursor-pointer
      "
    >
      {nodeDatum.name}
    </div>
  </foreignObject>
);

  return (
    <div
      ref={treeContainer}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Tree
          data={myTreeData}
          orientation="vertical"
          renderCustomNodeElement={renderNodeWithCustomHtml}
          translate={{
            x: dimensions.width / 2,
            y: 80,
          }}
          zoom={zoom}
          zoomable={true}
          scaleExtent={{ min: 0.3, max: 2 }}
          dimensions={dimensions}
          separation={{ siblings: 2, nonSiblings: 2 }}
          pathFunc="step" 
        />
      )}
    </div>
  );
}
