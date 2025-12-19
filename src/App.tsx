{/* --- ШАГ 3: РЕЗУЛЬТАТ --- */}
      {step === 'ANALYSIS' && (
        <div className="w-full max-w-lg flex flex-col items-center animate-fade-in pb-10">
          
          {isLoading ? (
            <div className="text-center mt-20">
              <div className={`w-16 h-16 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4 
                ${consultant === 'VIP' ? 'border-[#FFD700]' : 'border-[#D4AF37]'}`}></div>
              <p className={`animate-pulse ${consultant === 'VIP' ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
                {consultant === 'VIP' ? 'Мессир размышляет...' : 'Марго считает убытки...'}
              </p>
            </div>
          ) : (
            <div className={`w-full bg-[#0a0a0a] border p-6 rounded-lg shadow-2xl relative transition-colors duration-500
              ${consultant === 'VIP' ? 'border-[#FFD700]/50 shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-[#333] shadow-lg'}`}>
              
              {/* 1. КАРТЫ (Наверху) */}
              <div className="mb-6 border-b border-[#222] pb-6 flex justify-center gap-2">
                {appMode === 'RELATIONSHIPS' ? (
                   <>
                     <div className="w-20 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-20 aspect-[2/3]">{renderCardMedia(card2)}</div>
                   </>
                ) : (
                   <>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card1)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card2)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card3)}</div>
                     <div className="w-16 aspect-[2/3]">{renderCardMedia(card4)}</div>
                   </>
                )}
              </div>

              {/* 2. ПЛЕЕР (ТЕПЕРЬ ТУТ, НАД ТЕКСТОМ) */}
              <div className="mb-6">
                {!audioUrl ? (
                  <button 
                    onClick={handleGenerateAudio} 
                    disabled={isGeneratingVoice} 
                    className={`w-full py-2 rounded border border-dashed text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2
                      ${isGeneratingVoice 
                        ? 'border-gray-700 text-gray-500 cursor-wait' 
                        : (consultant === 'VIP' 
                            ? 'border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/10' 
                            : 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10')
                      }`}
                  >
                     {isGeneratingVoice ? '✨ Магия голоса...' : '🎙️ Озвучить ответ'}
                  </button>
                ) : (
                  <div className={`rounded-lg p-2 border animate-fade-in flex flex-col items-center gap-2
                    ${consultant === 'VIP' ? 'border-[#FFD700]/30 bg-[#FFD700]/5' : 'border-[#D4AF37]/30 bg-[#D4AF37]/5'}`}>
                    
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70">
                      <span>{consultant === 'VIP' ? '🦁 Голос Мессира' : '🦊 Голос Марго'}</span>
                    </div>
                    
                    {/* Стандартный плеер, но аккуратный */}
                    <audio controls src={audioUrl} className="w-full h-8 opacity-80 hover:opacity-100 transition-opacity" autoPlay />
                  </div>
                )}
              </div>

              {/* 3. ТЕКСТ (ТЕПЕРЬ ПОД ПЛЕЕРОМ) */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans mb-8 pl-2 border-l-2 border-[#222]">
                {resultText}
              </div>
              
              {/* КНОПКИ ВНИЗУ */}
              <button 
                onClick={handleSecondOpinion} 
                className={`w-full py-3 mb-4 rounded border text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2
                  ${consultant === 'STANDARD' 
                    ? 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10' 
                    : 'border-gray-500 text-gray-400 hover:bg-white/5' 
                  }`}
              >
                {consultant === 'STANDARD' ? '🎩 Узнать мнение Мессира (VIP)' : '💃 Послушать Марго (Standard)'}
              </button>

              <button onClick={reset} className="w-full py-3 text-xs uppercase tracking-widest text-gray-500 hover:text-white border-t border-transparent hover:border-gray-800 transition-colors">
                Новый Гость
              </button>
            </div>
          )}
        </div>
      )}
