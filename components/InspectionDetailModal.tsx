import React, { useState, useEffect } from 'react';
import { InspectionEvent } from '../types';
import { MotionModalShell } from './MotionModalShell';

interface InspectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionEvent | null;
  flightNo: string;
  codeshare?: string;
  onComplete: (inspectionId: string) => void;
  onUpdate?: (inspectionId: string, timeActual: string) => void;
}

export const InspectionDetailModal: React.FC<InspectionDetailModalProps> = ({
  isOpen,
  onClose,
  inspection,
  flightNo,
  codeshare,
  onComplete,
  onUpdate,
}) => {
  const [editTime, setEditTime] = useState('');

  const isYunDeng = inspection ? (inspection.type === '允登' || inspection.type === '允许登机') : false;

  useEffect(() => {
    if (inspection) {
      if (inspection.timeActual && inspection.timeActual !== '--:--') {
        setEditTime(inspection.timeActual);
      } else if (isYunDeng) {
        // 允登未操作时，默认显示当前系统时间
        const now = new Date();
        const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setEditTime(currentStr);
      } else {
        setEditTime('');
      }
    }
  }, [inspection, isYunDeng]);

  // Safety checks
  if (!inspection) return null;

  const isCompleted = 
    inspection.status === 'completed' || 
    inspection.status === 'overtime-completed';

  const handleComplete = () => {
    onComplete(inspection.id);
    onClose();
  };

  const handleSubmitEdit = () => {
    onUpdate?.(inspection.id, editTime);
    onClose();
  };

  return (
    <MotionModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`${flightNo} ${inspection.type}详情`}
      keyboardDismissSurface="capsule-detail"
      panelClassName="relative w-[440px] max-h-[70vh] z-[90] rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white"
    >
      {/* Header (top section) */}
      <div data-motion-modal-content className="relative px-6 py-6 bg-white z-20 border-b border-gray-100 shadow-sm flex-none">
        <div className="flex flex-col items-center gap-2">
          {/* Flight numbers */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight tabular-nums">
              {flightNo}
            </span>
            {codeshare && (
              <>
                <span className="text-gray-300 text-2xl font-light">/</span>
                <span className="text-3xl font-black text-blue-600 font-mono tracking-tight tabular-nums">
                  {codeshare}
                </span>
              </>
            )}
          </div>
          
          {/* Inspection type | actual time | operator (统一字号 text-base、字重 font-bold 与设计风格) */}
          <div className="flex items-center gap-3 mt-1 text-base font-bold">
            <span className="text-gray-800">{inspection.type}</span>
            <span className="w-px h-4 bg-gray-300"></span>
            {inspection.timeActual && inspection.timeActual !== '--:--' ? (
              <span className="font-mono text-emerald-600 tabular-nums">
                {inspection.timeActual}
              </span>
            ) : (
              <span className="font-mono text-gray-400 tabular-nums">
                --:--
              </span>
            )}
            {inspection.operator && (
              <>
                <span className="w-px h-4 bg-gray-300"></span>
                <span className="text-gray-800">{inspection.operator}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body (middle section) */}
      <div data-motion-modal-content className="flex-1 overflow-y-auto relative bg-slate-50 p-6 flex flex-col gap-4">
        {/* 允登胶囊：极简单框时间选择器 */}
        {isYunDeng && (
          <div className="w-full max-w-[240px] mx-auto py-2 relative flex items-center">
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full pl-6 pr-10 py-3 border border-gray-300 bg-white rounded-xl text-2xl font-mono font-bold text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm transition-all [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            {editTime ? (
              <button
                type="button"
                onClick={() => setEditTime('')}
                className="absolute right-3.5 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                title="清空时间"
              >
                <span className="material-symbols-outlined text-xl leading-none">close</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  const inputElem = e.currentTarget.previousElementSibling as HTMLInputElement;
                  inputElem?.showPicker?.();
                }}
                className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                title="选择时间"
              >
                <span className="material-symbols-outlined text-xl leading-none">schedule</span>
              </button>
            )}
          </div>
        )}

        {/* 参考时间列表（无标题） */}
        {inspection.referenceTimes && Object.keys(inspection.referenceTimes).length > 0 && (
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {Object.entries(inspection.referenceTimes).map(([label, time], index, arr) => (
              <div 
                key={label}
                className={`flex justify-between items-center px-4 py-3 ${
                  index < arr.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <span className="text-sm text-gray-700 font-medium">{label}</span>
                <span className="text-sm font-mono tabular-nums text-gray-900">{time || '--:--'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer (bottom section: 允登显示提交，待检查显示完成检查，已完成的其他检查隐藏 footer 2处) */}
      {(isYunDeng || !isCompleted) && (
        <div data-motion-modal-content className="p-4 bg-white border-t border-gray-100 flex-none z-20">
          {isYunDeng ? (
            <button
              onClick={handleSubmitEdit}
              className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <span>提交</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center justify-center transition-all shadow-md active:scale-[0.98]"
            >
              <span>完成检查</span>
            </button>
          )}
        </div>
      )}
    </MotionModalShell>
  );
};
