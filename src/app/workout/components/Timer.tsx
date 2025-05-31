"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  onClose: () => void;
}

export default function Timer({ onClose }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 600) {
            setIsActive(false);
            onClose();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onClose]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSeconds(0);
  };

  const handlePlayPause = () => {
    setIsActive(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Rest Timer</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          X
        </button>
      </div>
      
      <div className="text-4xl font-bold text-center mb-4 font-mono">
        {formatTime(seconds)}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePlayPause}
          className={`px-4 py-2 rounded-md ${
            isActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white transition-colors`}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
} 