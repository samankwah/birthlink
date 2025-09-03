import React from 'react';

interface SliderSettingProps {
  title: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
  disabled?: boolean;
  marks?: Array<{ value: number; label: string }>;
}

export const SliderSetting: React.FC<SliderSettingProps> = ({
  title,
  description,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  showValue = true,
  disabled = false,
  marks = []
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {showValue && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {value}{unit}
            </span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Track */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Progress */}
          <div
            className="absolute h-2 bg-blue-600 rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Slider thumb */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div
            className={`
              absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-sm
              transform -translate-y-1.5 transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-700 cursor-pointer'}
            `}
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>

        {/* Marks */}
        {marks.length > 0 && (
          <div className="relative mt-2">
            {marks.map((mark) => {
              const markPercentage = ((mark.value - min) / (max - min)) * 100;
              return (
                <div
                  key={mark.value}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${markPercentage}%` }}
                >
                  <div className="w-1 h-1 bg-gray-400 rounded-full mb-1" />
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {mark.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};