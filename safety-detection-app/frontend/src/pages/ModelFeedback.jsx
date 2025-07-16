import React, { useState } from "react";
import { motion } from "framer-motion";

const mockFeedback = [
  { id: 1, img: "", label: "Fire Extinguisher", conf: 0.52, flagged: false },
  { id: 2, img: "", label: "ToolBox", conf: 0.48, flagged: true },
];

export default function ModelFeedback({ theme }) {
  const [feedback, setFeedback] = useState(mockFeedback);
  const [hasError, setHasError] = useState(false);
  const toggleFlag = id => {
    setFeedback(fb => fb.map(item => item.id === id ? { ...item, flagged: !item.flagged } : item));
  };
  try {
    if (hasError) throw new Error();
    return (
      <motion.div
        className="pt-32 px-8 min-h-screen bg-black"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-left font-orbitron drop-shadow-lg font-['Press_Start_2P',monospace]">Model Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          {feedback.map(item => (
            <motion.div
              key={item.id}
              className="flex items-center gap-8 rounded-2xl p-12 bg-black border-2 border-white shadow-2xl text-white z-[100]"
              whileHover={{ scale: 1.03 }}
            >
              <div className="h-28 w-28 bg-black rounded-lg flex items-center justify-center text-white/40 text-lg font-poppins">Image</div>
              <div className="flex-1">
                <div className="font-bold text-2xl font-orbitron mb-2">{item.label}</div>
                <div className="text-lg mb-4 font-mono">Confidence: {(item.conf * 100).toFixed(1)}%</div>
                <button
                  className={`px-6 py-2 rounded-lg font-semibold text-lg border-2 border-white shadow-lg transition-all duration-300 font-['Press_Start_2P',monospace] ${item.flagged ? "bg-white text-black" : "bg-black text-white"}`}
                  onClick={() => toggleFlag(item.id)}
                >
                  {item.flagged ? "Unflag" : "Flag"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Falcon Info Panel */}
        <div className="max-w-2xl mx-auto bg-black border-2 border-white rounded-2xl p-12 shadow-2xl text-white mb-16 z-[100]">
          <h3 className="font-bold text-2xl mb-4 font-orbitron">What happens to flagged detections?</h3>
          <p className="text-white/80 text-lg font-mono">Flagged low-confidence detections are logged for review and can be used to retrain the YOLOv8 models, improving accuracy and reducing false positives/negatives in future runs.</p>
        </div>
        {/* Download flagged logs */}
        <div className="flex justify-center">
          <button className="px-8 py-3 rounded-lg font-semibold bg-white text-black border-2 border-white shadow-lg hover:bg-gray-200 hover:text-black transition text-xl font-orbitron">Download Flagged Logs (CSV)</button>
        </div>
      </motion.div>
    );
  } catch (e) {
    return <div className="text-center text-red-400 mt-32">An error occurred in Model Feedback. Please reload the page or contact support.</div>;
  }
} 