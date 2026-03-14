import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Type,
  Download,
  Trash2,
  Undo,
  Redo,
} from "lucide-react";
import { toast } from "sonner";

type Tool = "pen" | "eraser" | "rectangle" | "circle" | "text";

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#8B5CF6");
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial canvas background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === "eraser" ? "#1a1a2e" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Canvas cleared");
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "exceliboard-drawing.png";
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Canvas downloaded");
  };

  const tools = [
    { name: "pen", icon: <Pen className="w-5 h-5" />, label: "Pen" },
    { name: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Eraser" },
    { name: "rectangle", icon: <Square className="w-5 h-5" />, label: "Rectangle" },
    { name: "circle", icon: <Circle className="w-5 h-5" />, label: "Circle" },
    { name: "text", icon: <Type className="w-5 h-5" />, label: "Text" },
  ];

  const colors = [
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#EC4899", // Pink
    "#FFFFFF", // White
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
        <div className="container mx-auto flex-1 flex flex-col py-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">Interactive Whiteboard</h1>
            <p className="text-muted-foreground">
              Draw, sketch, and collaborate in real-time
            </p>
          </div>

          {/* Toolbar */}
          <Card className="mb-4 p-4 bg-card/50 backdrop-blur border-primary/10">
            <div className="flex flex-wrap items-center gap-4">
              {/* Drawing Tools */}
              <div className="flex gap-2">
                {tools.map((t) => (
                  <Button
                    key={t.name}
                    variant={tool === t.name ? "default" : "outline"}
                    size="icon"
                    onClick={() => setTool(t.name as Tool)}
                    className={tool === t.name ? "bg-primary" : ""}
                    title={t.label}
                  >
                    {t.icon}
                  </Button>
                ))}
              </div>

              <div className="w-px h-8 bg-border" />

              {/* Colors */}
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>

              <div className="w-px h-8 bg-border" />

              {/* Line Width */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm w-8">{lineWidth}px</span>
              </div>

              <div className="flex-1" />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Undo">
                  <Undo className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" title="Redo">
                  <Redo className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={clearCanvas} title="Clear">
                  <Trash2 className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={downloadCanvas} title="Download">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Canvas */}
          <Card className="flex-1 p-0 overflow-hidden border-primary/20 shadow-glow">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full cursor-crosshair"
              style={{ touchAction: "none" }}
            />
          </Card>

          {/* Info Banner */}
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-center">
              <span className="font-semibold">Canvas Mode:</span> Draw freely on the canvas.
              <Link to="/dashboard" className="text-primary font-semibold hover:underline ml-1">Go to Dashboard</Link>{" "}
              for full collaborative boards with video and AI features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
