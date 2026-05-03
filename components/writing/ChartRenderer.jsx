"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Maximize2, X } from "lucide-react";

/**
 * ChartRenderer — Render IELTS Task 1 Academic chart from JSONB.
 * Supports inline display + full-screen modal expand.
 *
 * Props:
 *   - chartData: Object (see schema in WritingScoreCard docs)
 */
export default function ChartRenderer({ chartData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Color palette for multiple series (dark-mode friendly)
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#f43f5e", "#06b6d4", "#ec4899", "#84cc16"];

  // ESC key to close modal
  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // Validate chartData
  if (!chartData || !chartData.type || !chartData.data || !Array.isArray(chartData.data)) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <p className="text-xs font-bold text-rose-300">Chart Data Invalid</p>
        </div>
        <p className="text-xs text-slate-400">
          Format chart tidak sesuai. Hubungi admin.
        </p>
      </div>
    );
  }

  const { type, title, unit, data, series, x_axis_label, y_axis_label } = chartData;

  // Reusable chart renderer (used in both inline + modal)
  const renderChartContent = (heightClass, fontSizeBoost = false) => {
    const fontSize = fontSizeBoost ? 14 : 11;
    const tickStyle = { fill: "#94a3b8", fontSize };
    const labelStyle = { fill: "#64748b", fontSize: fontSizeBoost ? 12 : 10 };

    return (
      <div className={`w-full ${heightClass}`}>
        {type === "bar_chart" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={tickStyle}
                stroke="#475569"
                label={x_axis_label ? { value: x_axis_label, position: "insideBottom", offset: -10, ...labelStyle } : null}
              />
              <YAxis 
                tick={tickStyle}
                stroke="#475569"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1A1D26", 
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: 12
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Legend 
                wrapperStyle={{ fontSize: fontSizeBoost ? 13 : 11, paddingTop: 10 }}
                iconType="circle"
              />
              {(series || ["value"]).map((seriesName, i) => (
                <Bar 
                  key={seriesName} 
                  dataKey={seriesName} 
                  fill={COLORS[i % COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {type === "line_graph" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={tickStyle}
                stroke="#475569"
                label={x_axis_label ? { value: x_axis_label, position: "insideBottom", offset: -10, ...labelStyle } : null}
              />
              <YAxis 
                tick={tickStyle}
                stroke="#475569"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1A1D26", 
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: 12
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: fontSizeBoost ? 13 : 11, paddingTop: 10 }}
                iconType="circle"
              />
              {(series || ["value"]).map((seriesName, i) => (
                <Line 
                  key={seriesName} 
                  type="monotone" 
                  dataKey={seriesName} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={fontSizeBoost ? 3 : 2.5}
                  dot={{ fill: COLORS[i % COLORS.length], r: fontSizeBoost ? 5 : 4 }}
                  activeDot={{ r: fontSizeBoost ? 7 : 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {type === "pie_chart" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={fontSizeBoost ? 140 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1A1D26", 
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: 12
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: fontSizeBoost ? 13 : 11, paddingTop: 10 }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Unsupported type fallback */}
        {!["bar_chart", "line_graph", "pie_chart"].includes(type) && (
          <div className="h-full flex items-center justify-center bg-slate-800/30 rounded-lg">
            <p className="text-xs text-slate-500 italic">
              Chart type "{type}" tidak dikenali
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* INLINE CHART (compact) */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-3 relative group">
        {/* Title + Expand Button */}
        <div className="flex items-start justify-between mb-1 gap-2">
          {title && (
            <h4 className="text-xs font-bold text-white leading-snug flex-1">
              {title}
            </h4>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-slate-400 transition-all shrink-0"
            title="Expand chart"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Unit subtitle */}
        {unit && (
          <p className="text-[10px] text-slate-400 mb-2 italic">
            {unit}
          </p>
        )}

        {/* Compact chart (smaller height) */}
        {renderChartContent("h-44 md:h-48", false)}
      </div>

      {/* MODAL FULL-SCREEN */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 pt-20 md:pt-12"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1D26] border border-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-5xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all z-10"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6 pr-12">
                {title && (
                  <h3 className="text-lg md:text-2xl font-bold text-white leading-tight mb-2">
                    {title}
                  </h3>
                )}
                {unit && (
                  <p className="text-sm text-slate-400 italic">
                    {unit}
                  </p>
                )}
              </div>

              {/* Large chart */}
              {renderChartContent("h-[55vh] md:h-[60vh]", true)}

              {/* Footer hint */}
              <p className="text-xs text-slate-500 text-center mt-4">
                Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono">ESC</kbd> atau klik di luar untuk menutup
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}