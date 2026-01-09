import React, { useState } from 'react';
import { SelectionParams, Chapter, HandoutContent, HomeworkContent, HomeworkConfig } from './types.ts';
import { fetchChapters, generateHandoutFromText, generateHomework } from './services/geminiService.ts';
import HandoutViewer from './components/HandoutViewer.tsx';
import HomeworkViewer from './components/HomeworkViewer.tsx';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'setup' | 'units' | 'display'>('welcome');
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<SelectionParams>({
    year: '113',
    publisher: '康軒',
    semester: '上',
    grade: '一年級',
    difficulty: '易'
  });
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeContent, setActiveContent] = useState<{ type: 'handout' | 'homework', data: any } | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{ chapter: string, sub: string } | null>(null);

  const startMagic = async () => {
    setLoading(true);
    try {
      const data = await fetchChapters(params);
      setChapters(data);
      setStep('units');
    } catch (err) {
      alert("載入失敗：" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createHandout = async (chapter: string, sub: string) => {
    setSelectedUnit({ chapter, sub });
    setLoading(true);
    try {
      const content = await generateHandoutFromText(params, chapter, sub);
      setActiveContent({ type: 'handout', data: content });
      setStep('display');
    } catch (err) {
      alert("魔法失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  };

  const createHomework = async () => {
    if (!selectedUnit) return;
    setLoading(true);
    try {
      const content = await generateHomework(params, selectedUnit.chapter, selectedUnit.sub, {
        calculationCount: 3,
        wordProblemCount: 2,
        difficulty: '易'
      });
      setActiveContent({ type: 'homework', data: content });
    } catch (err) {
      alert("隨堂卷製作失敗");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-10">
        <div className="w-24 h-24 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-10 shadow-2xl"></div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">🔮 正在施法中...</h2>
        <p className="text-slate-400 font-bold text-xl animate-pulse">正在為孩子客製化專屬教材</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 導航欄 */}
      <nav className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('welcome')}>
          <span className="text-3xl">🧙‍♂️</span>
          <span className="text-xl font-black text-slate-900">魔法數學助手</span>
        </div>
        <button 
          onClick={() => (window as any).aistudio?.openSelectKey?.()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          🔑 金鑰設定
        </button>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        {step === 'welcome' && (
          <div className="text-center py-20 bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12">
            <div className="text-[10rem] mb-12 animate-bounce">✨</div>
            <h1 className="text-6xl font-black text-slate-900 mb-6 leading-tight">數學變簡單的<br/><span className="text-blue-600 underline decoration-8 underline-offset-8">魔法開始了</span></h1>
            <p className="text-2xl text-slate-400 font-bold mb-16 max-w-2xl mx-auto">專為資源班與特教需求設計，一鍵生成符合出版社進度的精美教材。</p>
            <button 
              onClick={() => setStep('setup')}
              className="bg-blue-600 text-white px-16 py-8 rounded-[3rem] text-3xl font-black shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
            >
              進入魔法屋 ➔
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
              <h2 className="text-3xl font-black text-slate-800 mb-10">第一步：設定教材來源</h2>
              
              <div className="space-y-8">
                <section>
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">1. 選擇出版社</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['康軒', '南一', '翰林'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setParams({...params, publisher: p as any})}
                        className={`py-6 rounded-3xl font-black text-xl border-4 transition-all ${params.publisher === p ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest block mb-4">2. 選擇年級</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'].map(g => (
                      <button 
                        key={g}
                        onClick={() => setParams({...params, grade: g as any})}
                        className={`py-4 rounded-2xl font-black border-2 transition-all ${params.grade === g ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </section>

                <button 
                  onClick={startMagic}
                  className="w-full bg-blue-600 text-white py-8 rounded-[2.5rem] text-2xl font-black shadow-xl hover:shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  尋找對應單元 ➔
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center p-10 opacity-50">
              <div className="text-8xl mb-8">📚</div>
              <p className="text-2xl font-bold text-slate-400 italic">「好的教材是通往成功的階梯」</p>
            </div>
          </div>
        )}

        {step === 'units' && (
          <div className="animate-in fade-in duration-500">
             <div className="flex justify-between items-end mb-12">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-2">{params.publisher} {params.grade} 目錄</h2>
                  <p className="text-slate-400 font-bold text-lg">請點選您要製作的單元小節：</p>
               </div>
               <button onClick={() => setStep('setup')} className="text-blue-600 font-black hover:underline underline-offset-4">重新設定教材參數</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {chapters.map(c => (
                  <div key={c.id} className="bg-white rounded-[3rem] p-10 shadow-lg border border-slate-100 hover:border-blue-200 transition-all group">
                    <h3 className="text-2xl font-black text-slate-800 mb-8 border-b-4 border-blue-50 pb-4 flex items-center gap-3">
                      <span className="text-blue-500 text-3xl">#</span> {c.title}
                    </h3>
                    <div className="space-y-3">
                      {c.subChapters.map((sub, i) => (
                        <button 
                          key={i}
                          onClick={() => createHandout(c.title, sub)}
                          className="w-full text-left p-5 rounded-2xl font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-all flex justify-between items-center group/btn shadow-sm hover:shadow-md"
                        >
                          <span className="text-xl">{sub}</span>
                          <span className="opacity-0 group-hover/btn:opacity-100 text-2xl">🪄</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
             
             {/* 來源顯示 (Google Search Grounding 規範) */}
             {chapters[0]?.sourceUrls && (
                <div className="mt-20 p-8 border-t-2 border-slate-100">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">搜尋來源：</p>
                  <div className="flex flex-wrap gap-4">
                    {Array.from(new Set(chapters.flatMap(c => c.sourceUrls || []))).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 opacity-60 hover:opacity-100">
                        🔗 {new URL(url).hostname}
                      </a>
                    ))}
                  </div>
                </div>
             )}
          </div>
        )}

        {step === 'display' && activeContent && (
          <div className="space-y-12">
            <div className="no-print bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-wrap gap-4 justify-between items-center sticky top-24 z-30">
              <div className="flex gap-4">
                <button onClick={() => setStep('units')} className="bg-slate-100 px-6 py-3 rounded-2xl font-black text-slate-600">← 返回目錄</button>
                {activeContent.type === 'handout' && (
                  <button onClick={createHomework} className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-orange-600">生成隨堂練習 ➔</button>
                )}
              </div>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black shadow-2xl">🖨️ 直接列印</button>
            </div>

            {activeContent.type === 'handout' ? (
              <HandoutViewer content={activeContent.data} params={params} />
            ) : (
              <HomeworkViewer content={activeContent.data} params={params} />
            )}
          </div>
        )}
      </main>

      <footer className="no-print py-20 text-center opacity-30 text-xs font-black tracking-[0.5em] uppercase pointer-events-none">
        Special Education Magic Helper • 2024
      </footer>
    </div>
  );
}