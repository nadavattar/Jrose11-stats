import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Zap, TrendingUp, BookOpen, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';


const iconMap = {
    'shield': Shield,
    'zap': Zap,
    'trending-up': TrendingUp,
    'book-open': BookOpen
};

export default function RulesAndQuirks() {
    const { data: rulesContent = [], isLoading } = useQuery({
        queryKey: ['rulesContent'],
        queryFn: () => base44.entities.RulesContent.list('order', 50)
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Link to={createPageUrl('Home')}>
                    <Button variant="outline" className="mb-6 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-yellow-500 rounded-xl shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 border-b-4 border-yellow-500 p-6">
                        <h1 className="text-white text-2xl md:text-4xl uppercase text-center"
                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                            RULES & GEN 1 QUIRKS
                        </h1>
                        <p className="text-yellow-300 text-xs md:text-sm text-center mt-3"
                            style={{ fontFamily: "'Press Start 2P', monospace" }}>
                            JROSE11 GLOSSARY
                        </p>
                    </div>

                    <div className="p-6 space-y-8">
                        {rulesContent.length === 0 ? (
                            <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-12 text-center">
                                <p className="text-slate-400 text-sm">No rules content yet. Add content via the Admin panel.</p>
                            </div>
                        ) : (
                            rulesContent.map((section) => {
                                const IconComponent = iconMap[section.icon] || BookOpen;
                                return (
                                    <section key={section.id} className="bg-slate-800 border-2 border-slate-600 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <IconComponent className="w-6 h-6 text-yellow-400" />
                                            <h2 className="text-yellow-400 text-lg"
                                                style={{ fontFamily: "'Press Start 2P', monospace" }}>
                                                {section.title}
                                            </h2>
                                        </div>
                                        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                                            {section.subsections?.map((sub, i) => (
                                                <div key={i}>
                                                    {sub.subtitle && (
                                                        <h3 className="text-white font-bold mb-2">{sub.subtitle}</h3>
                                                    )}
                                                    {sub.content && (
                                                        <p className="ml-4 whitespace-pre-wrap">{sub.content}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}