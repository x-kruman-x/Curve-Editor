import { useState, useEffect } from "react";

export function CurveEditor() {
  const [points, setPoints] = useState([]);
  const [pathAttribut, setPathAttribut] = useState("");
  const [curveType, setCurveType] = useState("quadratic");
  const [draggingPointId, setDraggingPointId] = useState(null);

  const handleAddPoint = (e) => {
    e.preventDefault();

    const { clientX, clientY } = e;
    const newPoint = {
      id: Date.now(),
      x: clientX,
      y: clientY,
    };
    setPoints((prev) => [...prev, newPoint]);
  };

  const handleDeletePoint = (e, id) => {
    e.preventDefault();
    setPoints((prev) => prev.filter((point) => point.id !== id));
  };

  useEffect(() => {
    if (points.length < 2) {
      setPathAttribut("");
      return;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];

      switch (curveType) {
        case "quadratic": {
          const controlPoint = {
            x: (prevPoint.x + currPoint.x) / 2,
            y: (prevPoint.y + currPoint.y) / 2 - 50,
          };
          path += ` Q ${controlPoint.x},${controlPoint.y} ${currPoint.x},${currPoint.y}`;
          break;
        }
        case "cubic": {
          const controlPoint1 = {
            x: prevPoint.x + (currPoint.x - prevPoint.x) / 3,
            y: prevPoint.y,
          };
          const controlPoint2 = {
            x: currPoint.x - (currPoint.x - prevPoint.x) / 3,
            y: currPoint.y,
          };
          path += ` C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${currPoint.x},${currPoint.y}`;
          break;
        }
        default:
          break;
      }
    }

    setPathAttribut(path);
  }, [points, curveType]);

  function startDragging(id) {
    setDraggingPointId(id);
  }

  function handleMouseMove(event) {
    if (!draggingPointId) return;
    setPoints((prev) =>
      prev.map((point) =>
        point.id === draggingPointId
          ? { ...point, x: event.pageX, y: event.pageY }
          : point
      )
    );
  }

  function stopDragging() {
    setDraggingPointId(null);
  }

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopDragging);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
    };
  }, [draggingPointId]);

  return (
    <div className="w-[100vw] h-[100vh] bg-[#e7e6e6] relative">
      <h1 className="text-black text-[20px] absolute top-0 left-1/2 -translate-x-1/2">Кликните правой кнопкой мыши для создания точки</h1>
      <div className="absolute right-0 top-0 p-8 flex flex-col gap-3 border-l border-b rounded-bl-md border-black border-solid">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="quadratic"
            checked={curveType === "quadratic"}
            onChange={() => setCurveType("quadratic")}
            className="cursor-pointer"
          />
          Квадратичная кривая
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="cubic"
            checked={curveType === "cubic"}
            onChange={() => setCurveType("cubic")}
            className="cursor-pointer"
          />
          Кубическая кривая
        </label>
      </div>

      <svg className="w-full h-full" onContextMenu={handleAddPoint}>
        <path d={pathAttribut} fill="none" stroke="red" strokeWidth="1" />
        {points.map((point) => (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="blue"
            onDoubleClick={(e) => handleDeletePoint(e, point.id)}
            onMouseDown={() => startDragging(point.id)}
            className="cursor-pointer"
          />
        ))}
      </svg>
    </div>
  );
}
