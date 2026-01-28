'use client';

import { useState } from 'react';
import { UserIntent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface IntentSelectorProps {
    onSelectIntent: (intent: UserIntent) => void;
    selectedIntent?: UserIntent;
}

const INTENTS: { value: UserIntent; label: string; description: string }[] = [
    {
        value: 'same-role-better-company',
        label: 'Same role, better company',
        description: 'Find similar positions at top companies',
    },
    {
        value: 'same-role-higher-pay',
        label: 'Same role, higher pay',
        description: 'Explore better compensation packages',
    },
    {
        value: 'career-switch',
        label: 'Career switch',
        description: 'Transition to a different role or industry',
    },
    {
        value: 'fresher',
        label: 'Fresher / Early career',
        description: 'Entry-level and junior opportunities',
    },
];

export default function IntentSelector({ onSelectIntent, selectedIntent }: IntentSelectorProps) {
    return (
        <div className="mb-8">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
                What are you looking for?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTENTS.map((intent) => (
                    <button
                        key={intent.value}
                        onClick={() => onSelectIntent(intent.value)}
                        className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            selectedIntent === intent.value
                                ? "border-primary bg-primary/5"
                                : "border-neutral-200 hover:border-neutral-300 bg-white"
                        )}
                    >
                        <div className="font-medium text-neutral-900 mb-1">
                            {intent.label}
                        </div>
                        <div className="text-sm text-neutral-600">
                            {intent.description}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
