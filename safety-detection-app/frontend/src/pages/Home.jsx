import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
// import FloatingShapesBackground from "../FloatingShapesBackground";
import screenshotMap from "../assets/Screenshot 2025-07-15 221436.png";

// 8-bit font (make sure to add to your Tailwind config or import in index.css)
const eightBitFont = "font-['Press_Start_2P',monospace]";

const sections = [
  {
    title: "About",
    content:
      "This project uses a single YOLOv8l model to automate safety equipment detection (fire extinguishers, toolboxes, oxygen tanks) in real-world environments. No ensemble or multiple models—just one highly-optimized model for all classes.",
  },
  {
    title: "Dataset",
    content:
      "Curated and annotated dataset with images of fire extinguishers, toolboxes, and oxygen tanks. Single-model approach for robust detection. Data augmentation and synthetic generation for edge-case coverage.",
  },
  {
    title: "Model Accuracy",
    content:
      "Achieves 0.983 mAP@50 for all classes. The single-model approach ensures reliability and minimizes false negatives in safety-critical scenarios. Optimized for real-time inference on edge devices.",
  },
  {
    title: "Deployment",
    content:
      "Runs in real-time on edge devices and cloud. Designed for seamless integration with space station monitoring systems and industrial safety dashboards.",
  },
  {
    title: "Future Work",
    content:
      "Expanding to more object classes, adding anomaly detection, and integrating with AR HUDs for astronauts and safety officers.",
  },
];

// Broken/irregular animated static grid overlay (right-aligned, over the whole tab)
function AnimatedBrokenGridOverlay() {
  // Example of broken lines: some are short, some are offset, some missing
  const verticals = [50, 130, 210, 370, 450, 530, 590, 620, 670, 710, 750, 790, 830, 870, 910, 950, 990, 1030, 1070, 1110, 1150, 1190];
  const horizontals = [60, 180, 320, 390, 510, 670, 800, 950, 1100];
  // Some lines are broken into segments
  const brokenSegments = [
    { x: 210, y1: 0, y2: 300 },
    { x: 210, y1: 400, y2: 1200 },
    { x: 370, y1: 0, y2: 600 },
    { x: 370, y1: 700, y2: 1200 },
    { x: 530, y1: 200, y2: 1200 },
  ];
  // More right-side lines, animated in opposite direction
  const rightVerticals = [950, 990, 1030, 1070, 1110, 1150, 1190];
  return (
    <>
      {/* Main grid, animates down */}
      <div
        className="pointer-events-none fixed top-0 right-0 h-full w-1/2 z-10"
        aria-hidden="true"
        style={{ mixBlendMode: 'lighten' }}
      >
        <div className="absolute inset-0 animate-hudgrid-down opacity-60">
          <svg width="100%" height="100%" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Irregular vertical lines */}
            {verticals.map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="0"
                x2={x}
                y2="1200"
                stroke="#fff"
                strokeWidth="1.5"
                opacity="0.32"
              />
            ))}
            {/* Broken vertical segments */}
            {brokenSegments.map((seg, i) => (
              <line
                key={1000 + i}
                x1={seg.x}
                y1={seg.y1}
                x2={seg.x}
                y2={seg.y2}
                stroke="#fff"
                strokeWidth="2.5"
                opacity="0.45"
                strokeDasharray="12 10"
              />
            ))}
            {/* Irregular horizontal lines */}
            {horizontals.map((y, i) => (
              <line
                key={100 + i}
                x1="0"
                y1={y}
                x2="1200"
                y2={y}
                stroke="#fff"
                strokeWidth="1.2"
                opacity="0.18"
              />
            ))}
            {/* Some short horizontal broken lines */}
            <line x1="300" y1="320" x2="1200" y2="320" stroke="#fff" strokeWidth="2.5" opacity="0.35" strokeDasharray="18 12" />
            <line x1="0" y1="800" x2="200" y2="800" stroke="#fff" strokeWidth="2.5" opacity="0.35" strokeDasharray="18 12" />
          </svg>
        </div>
      </div>
      {/* Right-most lines, animates up */}
      <div
        className="pointer-events-none fixed top-0 right-0 h-full w-1/2 z-10"
        aria-hidden="true"
        style={{ mixBlendMode: 'lighten' }}
      >
        <div className="absolute inset-0 animate-hudgrid-up opacity-80">
          <svg width="100%" height="100%" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {rightVerticals.map((x, i) => (
              <line
                key={2000 + i}
                x1={x}
                y1="0"
                x2={x}
                y2="1200"
                stroke="#fff"
                strokeWidth="2.5"
                opacity="0.55"
              />
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

export default function Home({ theme }) {
  // Refs for scroll snap and in-view detection
  const sectionRefs = sections.map(() => useRef(null));
  const inViews = sectionRefs.map((ref) => useInView(ref, { amount: 0.5, once: false }));

  // Add a ref for the new subtitle/description section
  const descRef = useRef(null);
  const descInView = useInView(descRef, { amount: 0.5, once: false });

  return (
    <motion.div
      className="pt-32 px-8 min-h-screen bg-black text-white relative overflow-x-hidden overflow-y-auto"
      style={{ }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <AnimatedBrokenGridOverlay />
      {/* Title Section (first snap section) */}
      <section
        className={`max-w-4xl text-left relative z-10 pl-2 md:pl-8 lg:pl-16 flex flex-col justify-center min-h-[90vh] scroll-snap-align-start`}
        style={{ scrollSnapAlign: "start" }}
      >
        <motion.h1
          className={`text-[4.5rem] md:text-[7rem] font-orbitron font-extrabold mb-4 text-white tracking-tight leading-tight select-none ${eightBitFont}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          whileHover={{ scale: 1.04, textShadow: "0 0 8px #fff" }}
        >
          <span className="block">Space Station</span>
          <span className="block text-5xl md:text-7xl font-light text-gray-300 mt-2 tracking-wider font-sans">Inventory Detection</span>
        </motion.h1>
        <motion.button
          className={`mt-8 px-12 py-5 rounded-lg font-bold text-2xl bg-white text-black border-2 border-white hover:bg-gray-200 hover:text-black transition shadow-lg tracking-widest ${eightBitFont}`}
          whileHover={{ scale: 1.12, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = "/detect"}
          style={{ boxShadow: "0 2px 16px 0 #fff2, 0 0 0 2px #fff" }}
        >
          Try Detection
        </motion.button>
      </section>
      {/* Subtitle/Description Section (new snap section) */}
      <section
        ref={descRef}
        className={`flex flex-col justify-center min-h-[90vh] max-w-6xl mx-auto scroll-snap-align-start transition-all duration-700 px-2 md:px-12 lg:px-24 ${descInView ? "opacity-100 blur-0 scale-100" : "opacity-40 blur-sm scale-95"}`}
        style={{ scrollSnapAlign: "start" }}
      >
        <motion.p
          className="text-3xl md:text-5xl font-poppins text-gray-100 font-bold mt-6 max-w-6xl leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Real-time detection of <span className={`font-extrabold text-white ${eightBitFont}`}>fire extinguishers</span>, <span className={`font-extrabold text-white ${eightBitFont}`}>toolboxes</span>, and <span className={`font-extrabold text-white ${eightBitFont}`}>oxygen tanks</span> using a <span className={`font-extrabold text-white ${eightBitFont}`}>single YOLOv8l model</span>.<br /><br />
          <span className="text-2xl md:text-4xl text-gray-400 block mt-8 font-mono font-light">Our single-model approach achieves a <span className="text-white font-bold">0.983 mAP</span> score on the validation set, providing robust and accurate detection for space station safety and inventory management. <br/> <br/> <span className="text-white font-bold">No ensemble or multiple models</span>—just one highly-optimized YOLOv8l model for all three classes.</span>
        </motion.p>
      </section>
      {/* Snap sections for each info card */}
      {sections.map((card, idx) => (
        <section
          key={card.title}
          ref={sectionRefs[idx]}
          className={`flex flex-col justify-center min-h-[90vh] max-w-4xl mx-auto scroll-snap-align-start transition-all duration-700 px-2 md:px-8 lg:px-16 ${inViews[idx] ? "opacity-100 blur-0 scale-100" : "opacity-40 blur-sm scale-95"}`}
          style={{ scrollSnapAlign: "start" }}
        >
        <motion.div
            className={`rounded-2xl p-12 bg-[#18182a] border border-gray-700 shadow-2xl text-white relative overflow-hidden group transition-transform duration-500 cursor-pointer z-[100]`}
            whileHover={{ scale: 1.07, rotate: idx % 2 === 0 ? 2 : -2 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.1, duration: 0.7, type: "spring" }}
        >
            <h2 className={`font-bold text-4xl mb-6 tracking-wider ${eightBitFont}`}>{card.title}</h2>
            <p className="text-2xl text-gray-300 leading-relaxed font-mono" style={{ fontSize: idx === 2 ? '2.1rem' : '1.7rem' }}>
              {card.title === "About"
                ? "This project uses a single YOLOv8l model to automate safety equipment detection (fire extinguishers, toolboxes, oxygen tanks) in real-world environments. No ensemble or multiple models—just one highly-optimized model for all classes."
                : card.title === "Model Accuracy"
                ? "Achieves 0.983 mAP@50 for all classes. The single-model approach ensures reliability and minimizes false negatives in safety-critical scenarios. Optimized for real-time inference on edge devices."
                : card.content}
            </p>
            {/* Flicker/scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-300" style={{background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff1 3px, transparent 4px)"}} />
        </motion.div>
        </section>
      ))}
      {/* Screenshot proof of mAP@50 */}
      <div className="flex flex-col items-center justify-center mt-40 mb-32 px-4">
        <div className="bg-[#18182a] border border-gray-700 rounded-2xl shadow-2xl p-6 max-w-4xl w-full flex flex-col items-center">
          <img
            src={screenshotMap}
            alt="mAP@50 Proof Screenshot"
            className="w-full max-w-2xl rounded-lg border-2 border-white shadow-lg mb-4"
            style={{ objectFit: 'contain' }}
          />
          <span className="text-lg text-gray-300 font-mono">Validation mAP@50 proof: YOLOv8l model achieves 0.983 mAP</span>
        </div>
      </div>
    </motion.div>
  );
} 