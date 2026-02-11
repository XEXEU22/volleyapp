
import React from 'react';

interface SkillStarsProps {
    value: number;
    onChange?: (value: number) => void;
    size?: 'sm' | 'md';
}

const SkillStars: React.FC<SkillStarsProps> = ({ value, onChange, size = 'md' }) => {
    const starSize = size === 'sm' ? 'text-[14px]' : 'text-[22px]';
    const gap = size === 'sm' ? 'gap-0' : 'gap-0.5';

    return (
        <div className={`flex items-center ${gap}`}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange?.(star)}
                    disabled={!onChange}
                    className={`${starSize} transition-all duration-150 disabled:cursor-default ${onChange ? 'hover:scale-125 active:scale-95 cursor-pointer' : ''
                        }`}
                >
                    <span
                        className={`material-symbols-outlined ${starSize} ${star <= value ? 'text-primary' : 'text-slate-300 dark:text-slate-600'
                            }`}
                        style={{ fontVariationSettings: star <= value ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        star
                    </span>
                </button>
            ))}
        </div>
    );
};

export default SkillStars;
