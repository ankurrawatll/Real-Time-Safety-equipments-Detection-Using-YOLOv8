import React, { useState, useRef, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { DetectionHistoryContext } from "../DetectionHistoryContext";
// import FloatingShapesBackground from "../FloatingShapesBackground";

const COLORS = ["#3C0753", "#1B1A55", "#2E236C", "#00FFB3", "#FFB347", "#FF6961"];
const eightBitFont = "font-['Press_Start_2P',monospace]";

// Broken/irregular animated static grid overlay (right-aligned, over the whole tab)
function AnimatedBrokenGridOverlay() {
  const verticals = [50, 130, 210, 370, 450, 530, 590, 620, 670, 710, 750, 790, 830, 870, 910, 950, 990, 1030, 1070, 1110, 1150, 1190];
  const horizontals = [60, 180, 320, 390, 510, 670, 800, 950, 1100];
  const brokenSegments = [
    { x: 210, y1: 0, y2: 300 },
    { x: 210, y1: 400, y2: 1200 },
    { x: 370, y1: 0, y2: 600 },
    { x: 370, y1: 700, y2: 1200 },
    { x: 530, y1: 200, y2: 1200 },
  ];
  const rightVerticals = [950, 990, 1030, 1070, 1110, 1150, 1190];
  return (
    <>
      <div
        className="pointer-events-none fixed top-0 right-0 h-full w-1/2 z-10"
        aria-hidden="true"
        style={{ mixBlendMode: 'lighten' }}
      >
        <div className="absolute inset-0 animate-hudgrid-down opacity-60">
          <svg width="100%" height="100%" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {verticals.map((x, i) => (
              <line key={i} x1={x} y1="0" x2={x} y2="1200" stroke="#fff" strokeWidth="1.5" opacity="0.32" />
            ))}
            {brokenSegments.map((seg, i) => (
              <line key={1000 + i} x1={seg.x} y1={seg.y1} x2={seg.x} y2={seg.y2} stroke="#fff" strokeWidth="2.5" opacity="0.45" strokeDasharray="12 10" />
            ))}
            {horizontals.map((y, i) => (
              <line key={100 + i} x1="0" y1={y} x2="1200" y2={y} stroke="#fff" strokeWidth="1.2" opacity="0.18" />
            ))}
            <line x1="300" y1="320" x2="1200" y2="320" stroke="#fff" strokeWidth="2.5" opacity="0.35" strokeDasharray="18 12" />
            <line x1="0" y1="800" x2="200" y2="800" stroke="#fff" strokeWidth="2.5" opacity="0.35" strokeDasharray="18 12" />
          </svg>
        </div>
      </div>
      <div
        className="pointer-events-none fixed top-0 right-0 h-full w-1/2 z-10"
        aria-hidden="true"
        style={{ mixBlendMode: 'lighten' }}
      >
        <div className="absolute inset-0 animate-hudgrid-up opacity-80">
          <svg width="100%" height="100%" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {rightVerticals.map((x, i) => (
              <line key={2000 + i} x1={x} y1="0" x2={x} y2="1200" stroke="#fff" strokeWidth="2.5" opacity="0.55" />
            ))}
          </svg>
        </div>
        <style>{`
          @keyframes hudgrid-down {
            0% { transform: translateY(0); }
            100% { transform: translateY(-40px); }
          }
          .animate-hudgrid-down {
            animation: hudgrid-down 3.5s linear infinite alternate;
          }
          @keyframes hudgrid-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
          }
          .animate-hudgrid-up {
            animation: hudgrid-up 3.5s linear infinite alternate;
          }
        `}</style>
      </div>
    </>
  );
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function getNowString() {
  const now = new Date();
  return now.toLocaleString();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Detect({ theme }) {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const { addDetection } = useContext(DetectionHistoryContext);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setResult(null);
    setError("");
    if (f) {
      setFileUrl(URL.createObjectURL(f));
    } else {
      setFileUrl("");
    }
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/detect", formData, { responseType: "json" });
      setResult(res.data);
      setError("");
      // Only add metadata to history (no images), but pass previews for session cache
      addDetection({
        id: Date.now(),
        detections: res.data.detections,
        class_counts: res.data.class_counts,
        confidences: res.data.confidences,
        date: getNowString(),
        filename: file.name
      }, fileUrl, `data:image/png;base64,${res.data.image}`);
    } catch (err) {
      if (!result) setError("Detection failed. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!result?.image) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.image}`;
    link.download = "detection_result.png";
    link.click();
  };

  const handleDownloadJSON = () => {
    if (!result?.detections) return;
    downloadFile("detections.json", JSON.stringify(result.detections, null, 2));
  };

  const handleDownloadCSV = () => {
    if (!result?.detections) return;
    const csv = [
      "class,confidence,box",
      ...result.detections.map(d => `${d.class},${d.conf},[${d.box.join(" ")}]`)
    ].join("\n");
    downloadFile("detections.csv", csv);
  };

  const classCountsData = result && result.class_counts
    ? Object.entries(result.class_counts).map(([name, value]) => ({ name, value }))
    : [];
  const confidencesData = result && result.confidences
    ? result.confidences.map((conf, idx) => ({ name: `Det ${idx + 1}`, value: conf }))
    : [];

  return (
    <motion.div
      className="pt-32 px-8 min-h-screen relative overflow-hidden bg-black"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <AnimatedBrokenGridOverlay />
      <div className="relative z-10">
        <h2 className={`text-4xl md:text-5xl font-bold text-white mb-16 text-left font-orbitron drop-shadow-lg ${eightBitFont}`}>Detect Safety Equipment</h2>
        <div className="mx-auto max-w-2xl bg-[#000000] border-2 border-white rounded-2xl p-16 shadow-2xl mb-24 z-[100]">
          <div className="bg-black border-2 border-white rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-6">
            <div className="text-white mb-8 text-2xl font-mono">Drag & drop images here or click to upload</div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="block text-white mb-4 text-lg" />
            {file && <div className="text-base text-white/60 mt-2 font-poppins">{file.name}</div>}
            <button
              className="mt-4 px-14 py-6 rounded-xl font-extrabold text-2xl bg-black text-white border-2 border-white shadow-lg hover:bg-gray-800 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-['Press_Start_2P',monospace]"
              onClick={handleDetect}
              disabled={!file || loading}
            >
              {loading ? "Detecting..." : "Detect"}
            </button>
          </div>
          {error && <div className="text-red-400 mt-8 text-center text-xl font-mono">{error}</div>}
        </div>
        {/* Input/Output Preview */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <div className="bg-[#000000] border-2 border-white rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center w-full min-h-[400px] z-[100]">
            <div className="text-white/70 mb-4 text-2xl font-orbitron">Input Preview</div>
            {fileUrl ? (
              <img src={fileUrl} alt="Input Preview" className="rounded-xl border-2 border-[#2E236C] shadow-xl max-w-full mb-4" style={{ background: "#18181b", maxHeight: 320 }} />
            ) : (
              <div className="w-full h-64 bg-black/30 rounded-lg flex items-center justify-center text-white/40 text-xl font-poppins">No input image</div>
            )}
            {file && <div className="text-base text-white/60 mt-2 font-poppins">{file.name}</div>}
          </div>
          <div className="bg-[#000000] border-2 border-white rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center w-full min-h-[400px] z-[100]">
            <div className="text-white/70 mb-4 text-2xl font-orbitron">Output Preview</div>
            {result?.image ? (
              <img src={`data:image/png;base64,${result.image}`} alt="Detection Result" className="rounded-xl border-2 border-[#2E236C] shadow-xl max-w-full mb-4" style={{ background: "#18181b", maxHeight: 320 }} />
            ) : (
              <div className="w-full h-64 bg-black/30 rounded-lg flex items-center justify-center text-white/40 text-xl font-poppins">No output image</div>
            )}
          </div>
        </div>
        {/* Detection Table and Download Buttons */}
        {result && (
          <>
            <div className="bg-[#000000] border-2 border-white rounded-2xl p-12 shadow-2xl max-w-3xl mx-auto mb-16 z-[100]">
              <div className="text-white/70 mb-4 text-2xl font-orbitron">Detection Results</div>
              {result.detections && result.detections.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full bg-black/30 rounded-lg text-white border border-[#2E236C]/40 shadow-lg text-lg font-mono">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b border-[#2E236C]/40">Class</th>
                        <th className="px-4 py-2 border-b border-[#2E236C]/40">Confidence</th>
                        <th className="px-4 py-2 border-b border-[#2E236C]/40">Box [x1, y1, x2, y2]</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.detections.map((det, idx) => (
                        <tr key={idx} className="hover:bg-[#2E236C]/30 transition-all">
                          <td className="px-4 py-2 border-b border-[#2E236C]/20 font-semibold font-['Press_Start_2P',monospace] text-xl">{det.class}</td>
                          <td className="px-4 py-2 border-b border-[#2E236C]/20 text-lg">{(det.conf * 100).toFixed(1)}%</td>
                          <td className="px-4 py-2 border-b border-[#2E236C]/20 text-lg">{det.box.map((v) => v.toFixed(0)).join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-white/40 mt-4 text-lg font-poppins">No detections</div>
              )}
              {/* Stats */}
              <div className="mt-8 text-white/80 text-lg font-mono">
                <div>Class Counts: {result.class_counts && Object.entries(result.class_counts).map(([cls, cnt]) => `${cls}: ${cnt}`).join(", ")}</div>
                <div>Confidences: {result.confidences && result.confidences.map(c => (c * 100).toFixed(1) + "%").join(", ")}</div>
              </div>
            </div>
            <div className="flex gap-8 justify-center mt-8 z-[100]">
              <button onClick={handleDownloadImage} className="px-8 py-3 rounded-lg font-semibold bg-white text-black border-2 border-white shadow-lg hover:bg-gray-200 hover:text-black transition text-xl font-orbitron">Download Labeled Image</button>
              <button onClick={handleDownloadJSON} className="px-8 py-3 rounded-lg font-semibold bg-white text-black border-2 border-white shadow-lg hover:bg-gray-200 hover:text-black transition text-xl font-orbitron">Download JSON</button>
              <button onClick={handleDownloadCSV} className="px-8 py-3 rounded-lg font-semibold bg-white text-black border-2 border-white shadow-lg hover:bg-gray-200 hover:text-black transition text-xl font-orbitron">Download CSV</button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
} 