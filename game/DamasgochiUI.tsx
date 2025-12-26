'use client';

import React from 'react';
import Image from 'next/image';
import { useDamasgochi } from './useDamasgochi';

const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="w-full mb-3">
    <div className="flex justify-between text-xs mb-1 text-green-900 font-bold">
      <span>{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-green-200 rounded-full h-2 border border-green-800">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${color}`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

export default function DamasgochiUI() {
  const { pet, feed, play, sleep, reset, revive, rename, refillFeed, refillPlay, deliver, addBonusXp, cleanPoop, toggleAutoDeliver, drawAnimal, buyItem, isInitialized, lastAction, deliverEffectKey, showLevelUp, isAutoDelivering } = useDamasgochi();
  
  // ANIMAL_EFFECTS를 useDamasgochi에서 가져오거나 직접 정의
  const ANIMAL_EFFECTS: Record<string, { label: string }> = {
    '🐶': { label: '배달 경험치 +1 XP' },
    '🐱': { label: '배달 경험치 +1 XP' },
    '🐭': { label: '배달 경험치 +1 XP' },
    '🐹': { label: '배달 경험치 +1 XP' },
    '🐰': { label: '1분마다 놀이세트 증정' },
    '🦊': { label: '배달 경험치 +2 XP' },
    '🐻': { label: '1분마다 10코인 증정' },
    '🐼': { label: '배달 경험치 +2 XP' },
    '🐨': { label: '배달 경험치 +2 XP' },
    '🐯': { label: '1분마다 10코인 증정' },
    '🦁': { label: '1분마다 10코인 증정' },
    '🐮': { label: '1분마다 사과세트 증정' },
    '🐷': { label: '1분마다 사과세트 증정' },
    '🐸': { label: '배달 경험치 +3 XP' },
    '🐵': { label: '1분마다 사과세트 증정' },
    '🐣': { label: '배달 경험치 +1 XP' },
    '🐧': { label: '배달 경험치 +3 XP' },
    '🦆': { label: '배달 경험치 +1 XP' },
    '🦋': { label: '배달 경험치 +3 XP' },
  };

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState(pet.name);
  const [showPayModal, setShowPayModal] = React.useState(false);
  const [showSpecialMission, setShowSpecialMission] = React.useState(false);
  const [showGiftBox, setShowGiftBox] = React.useState(false);
  const [showStore, setShowStore] = React.useState(false);
  const [newAnimal, setNewAnimal] = React.useState<string | null>(null);
  const [missionInput, setMissionInput] = React.useState('');
  const [paymentType, setPaymentType] = React.useState<'revive' | 'feed' | 'play'>('revive');
  const [inputCode, setInputCode] = React.useState('');
  const [error, setError] = React.useState('');

  // Spacebar delivery listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!isEditingName && !showPayModal && !showSpecialMission && !showGiftBox && !showStore && pet.status === 'alive') {
          e.preventDefault();
          
          if (isAutoDelivering) {
            toggleAutoDeliver();
          } else {
            const { special, gift } = deliver();
            if (special) setShowSpecialMission(true);
            else if (gift) setShowGiftBox(true);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deliver, toggleAutoDeliver, isAutoDelivering, isEditingName, showPayModal, showSpecialMission, showGiftBox, showStore, pet.status]);

  if (!isInitialized) return <div className="p-12 text-center font-mono text-green-800 text-xl">LOADING...</div>;

  const handleOpenGift = () => {
    const animal = drawAnimal();
    setNewAnimal(animal);
    setTimeout(() => {
      setShowGiftBox(false);
      setNewAnimal(null);
    }, 3000);
  };

  const handleSpecialMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (missionInput.trim() === '해시는 최고다') {
      addBonusXp(20);
      setMissionInput('');
      setShowSpecialMission(false);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === '1004') {
      if (paymentType === 'revive') revive();
      else if (paymentType === 'feed') refillFeed();
      else if (paymentType === 'play') refillPlay();
      
      setShowPayModal(false);
      setInputCode('');
      setError('');
    } else {
      setError('올바르지 않은 코드입니다.');
    }
  };

  const openPayment = (type: 'revive' | 'feed' | 'play') => {
    setPaymentType(type);
    setShowPayModal(true);
    setError('');
    setInputCode('');
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      rename(newName.trim());
      setIsEditingName(false);
    }
  };

  const getPetEmoji = () => {
    if (pet.status === 'dead') return '💀';
    if (pet.status === 'sleeping') return '💤';
    if (pet.health < 30) return '🤒';
    if (pet.hunger < 30) return '🤤';
    if (pet.happiness < 30) return '😢';
    if (pet.happiness > 80) return '😊';
    return '🐥';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-[450px] bg-blue-400 rounded-[4rem] p-10 shadow-2xl border-[16px] border-blue-500 relative">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-2 bg-blue-600 rounded-full opacity-30"></div>
        
        {/* Screen Container */}
        <div className="bg-gray-800 rounded-2xl p-3 border-8 border-blue-700 shadow-inner">
          {/* LCD Screen */}
          <div className={`bg-[#9ca38f] rounded-xl p-6 h-[400px] flex flex-col items-center justify-between relative overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)] transition-colors duration-300 ${
            lastAction === 'feed' ? 'bg-[#acb39f]' : 
            lastAction === 'play' ? 'bg-[#8c937f]' : ''
          }`}>
            {/* Screen Flash Effect */}
            {lastAction && (
              <div className="absolute inset-0 bg-white/10 pointer-events-none animate-pulse"></div>
            )}

            <div className="absolute bottom-2 right-4 flex items-center gap-1 bg-yellow-400/30 px-3 py-1 rounded-full border-2 border-yellow-600/40 shadow-sm z-20 animate-in fade-in slide-in-from-right-2 duration-500">
              <span className="text-xs font-black text-yellow-950">💰</span>
              <span className="text-xs font-black text-yellow-950">{pet.coins || 0}</span>
            </div>

            <div className="absolute top-4 right-4 text-xs font-bold text-green-900 opacity-60">
              {pet.status.toUpperCase()}
            </div>
            
            <div className="w-full px-2">
              <div className="flex justify-between items-end mb-1">
                <div className="text-[10px] font-black text-green-900">LV.{pet.level}</div>
                <div className="text-[8px] font-bold text-green-800 opacity-60">XP {pet.xp}/{pet.level * 100}</div>
              </div>
              <div className="w-full bg-green-200 h-1.5 rounded-full mb-4 border border-green-800/30 overflow-hidden relative">
                <div 
                  className={`h-full bg-green-600 transition-all duration-300 ${lastAction === 'deliver' ? 'brightness-150 shadow-[0_0_10px_#fff]' : ''}`} 
                  style={{ width: `${(pet.xp / (pet.level * 100)) * 100}%` }}
                ></div>
                {lastAction === 'deliver' && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse pointer-events-none"></div>
                )}
              </div>
              
              <ProgressBar label="HUNGER" value={pet.hunger} color={lastAction === 'feed' ? 'bg-yellow-400' : 'bg-green-800'} />
              <ProgressBar label="HAPPY" value={pet.happiness} color={lastAction === 'play' ? 'bg-pink-400' : 'bg-green-800'} />
              <ProgressBar label="ENERGY" value={pet.energy} color="bg-green-800" />
              <ProgressBar label="HEALTH" value={pet.health} color="bg-green-800" />
            </div>

            <div className="flex-1 flex items-center justify-center w-full my-6 select-none relative">
              {/* Collected Animals */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
                {pet.collectedAnimals.slice(-5).map((animal, i) => (
                  <div key={`animal-${i}`} className="group relative">
                    <div className="text-2xl animate-in fade-in slide-in-from-left-2 duration-500 shadow-sm filter drop-shadow-sm cursor-help">
                      {animal}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                      <div className="bg-black/80 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap backdrop-blur-sm border border-white/20">
                        {ANIMAL_EFFECTS[animal]?.label || '특수 효과 없음'}
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/20"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purchased Items */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
                {pet.hasDiaper && (
                  <div className="group relative">
                    <div className="text-2xl animate-in fade-in slide-in-from-right-2 duration-500 shadow-sm filter drop-shadow-sm cursor-help">
                      🚼
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                      <div className="bg-black/80 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap backdrop-blur-sm border border-white/20">
                        기저귀: 응아 확률 50% 감소
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black/80 rotate-45 border-r border-t border-white/20"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Poops */}
              {Array.from({ length: pet.poopCount }).map((_, i) => (
                <div 
                  key={`poop-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    cleanPoop();
                  }}
                  className="absolute bottom-4 cursor-pointer text-4xl transition-all hover:scale-125 active:scale-90 z-40 animate-bounce"
                  style={{ 
                    left: `${20 + i * 25}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  💩
                </div>
              ))}

              {/* Action Animations */}
              {lastAction === 'feed' && (
                <div className="absolute top-0 text-5xl animate-bounce z-20">🍎</div>
              )}
              {lastAction === 'play' && (
                <div className="absolute top-0 right-10 text-5xl animate-bounce z-20">🎾</div>
              )}
              {lastAction === 'play' && (
                <div className="absolute bottom-10 left-10 text-4xl animate-ping z-20">❤️</div>
              )}
              {lastAction === 'deliver' && (
                <div key={deliverEffectKey} className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
                  <div className="text-5xl animate-[deliver_0.3s_ease-in-out]">👕 </div>
                  <div className="text-xl font-black text-gray-800 animate-bounce left-0 absolute top-0 whitespace-nowrap">
                    +{1 + pet.collectedAnimals.length} XP
                  </div>
                  <div className="absolute right-0 text-4xl animate-pulse opacity-60">💨</div>
                </div>
              )}

              <div className={`relative transition-all duration-300 ${
                lastAction === 'feed' ? 'scale-110 -rotate-6' :
                lastAction === 'play' ? 'scale-110 rotate-6 translate-y-[-10px]' :
                lastAction === 'deliver' ? 'scale-95 translate-x-12 rotate-3' :
                pet.status === 'sleeping' ? 'animate-pulse opacity-70' : 
                pet.status === 'dead' ? 'grayscale brightness-50 rotate-180' : 
                'animate-bounce'
              }`}
              style={{ 
                width: `${12 + pet.level * 0.5}rem`, 
                height: `${8 + pet.level * 0.3}rem` 
              }}>
                <Image 
                  src="/damas.png" 
                  alt="Damasgochi" 
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                {pet.status === 'sleeping' && (
                  <div className="absolute -top-6 -right-4 text-4xl animate-bounce">💤</div>
                )}
                {pet.status === 'dead' && (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">👻</div>
                )}
              </div>
            </div>

            <div className="text-lg font-black text-green-950 tracking-[0.2em] border-t-2 border-green-800/20 w-full text-center pt-3 cursor-pointer hover:bg-green-800/10 transition-colors"
                 onClick={() => setIsEditingName(true)}>
              {pet.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Name Edit Overlay */}
        {isEditingName && (
          <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center p-10 rounded-[3.5rem]">
            <form onSubmit={handleRename} className="bg-white p-6 rounded-2xl shadow-2xl w-full">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border-4 border-blue-500 rounded-xl px-4 py-2 mb-4 text-lg font-bold text-gray-800 focus:outline-none"
                maxLength={10}
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-500 text-white text-xs font-bold py-3 rounded-xl">SAVE</button>
                <button type="button" onClick={() => setIsEditingName(false)} className="flex-1 bg-gray-200 text-gray-600 text-xs font-bold py-3 rounded-xl">CANCEL</button>
              </div>
            </form>
          </div>
        )}

        {/* Buttons Grid */}
        <div className="mt-10 grid grid-cols-3 gap-6 px-4">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => pet.feedCount > 0 ? feed() : openPayment('feed')}
              disabled={pet.status === 'dead' || pet.status === 'sleeping'}
              className="w-20 h-20 bg-yellow-400 rounded-full border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 shadow-xl flex items-center justify-center text-4xl disabled:opacity-40 disabled:grayscale transition-all relative overflow-visible"
              title="FEED"
            >
              🍎
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {pet.feedCount}/3
              </div>
            </button>
            <span className="text-xs font-bold text-blue-900">FEED</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => pet.playCount > 0 ? play() : openPayment('play')}
              disabled={pet.status === 'dead' || pet.status === 'sleeping'}
              className="w-20 h-20 bg-blue-400 rounded-full border-b-8 border-blue-600 active:border-b-0 active:translate-y-2 shadow-xl flex items-center justify-center text-4xl disabled:opacity-40 disabled:grayscale transition-all relative overflow-visible"
              title="PLAY"
            >
              🎾
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {pet.playCount}/3
              </div>
            </button>
            <span className="text-xs font-bold text-blue-900">PLAY</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={sleep}
              disabled={pet.status === 'dead'}
              className="w-20 h-20 bg-purple-400 rounded-full border-b-8 border-purple-600 active:border-b-0 active:translate-y-2 shadow-xl flex items-center justify-center text-4xl disabled:opacity-40 disabled:grayscale transition-all"
              title="SLEEP"
            >
              🌙
            </button>
            <span className="text-xs font-bold text-blue-900">SLEEP</span>
          </div>
        </div>

        {pet.status === 'dead' && (
          <div className="mt-10 flex flex-col gap-3">
            <button 
              onClick={() => openPayment('revive')}
              className="w-full bg-gray-900 text-white py-4 rounded-3xl font-black text-lg hover:bg-black transition-colors shadow-2xl animate-bounce"
            >
              부활시키기! (₩1,000)
            </button>
            <button 
              onClick={reset}
              className="w-full bg-gray-400 text-white py-3 rounded-2xl font-bold text-sm hover:bg-gray-500 transition-colors shadow-lg opacity-80"
            >
              방치하고 새로 키우기
            </button>
          </div>
        )}

        {/* Payment Modal */}
        {showPayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPayModal(false)}
            ></div>
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center border-[12px] border-blue-500 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-300">
              <div className="text-blue-600 font-black text-xl mb-6">
                {paymentType === 'revive' ? '부활 코드를 입력하세요' : 
                 paymentType === 'feed' ? '식사 횟수 충전' : '놀이 횟수 충전'}
              </div>
              <div className="relative w-64 h-64 mb-6 border-4 border-gray-100 p-2 rounded-2xl bg-white">
                <Image 
                  src="/pay.JPG" 
                  alt="Pay QR" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-sm text-gray-500 mb-6 text-center font-bold px-2">
                {paymentType === 'revive' && (
                  <span className="text-red-500 block mb-2 animate-pulse">"다마스가 무지개 다리를 건넜어요...<br/>다시 살려주실거죠?"</span>
                )}
                {paymentType === 'feed' && (
                  <span className="text-orange-500 block mb-2 animate-bounce">"다마스가 배고파서 죽어가고 있어요!<br/>얼른 밥을 주세요!"</span>
                )}
                {paymentType === 'play' && (
                  <span className="text-blue-500 block mb-2 animate-bounce">"다마스가 너무 심심해서 우울해하고 있어요...<br/>같이 놀아주세요!"</span>
                )}
                위 QR로 1,000원 입금 후<br/>확인 코드를 입력하세요
              </div>
              <form onSubmit={handlePayment} className="w-full space-y-4">
                <input
                  autoFocus
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="코드를 입력하세요"
                  className="w-full border-4 border-blue-100 rounded-2xl px-6 py-4 text-center text-xl font-bold focus:border-blue-500 focus:outline-none transition-colors text-blue-500"
                />
                {error && <div className="text-red-500 text-sm mb-2 text-center font-bold animate-shake">{error}</div>}
                <div className="flex gap-3">
                  <button type="submit" className="flex-[2] bg-blue-500 text-white font-black py-4 rounded-2xl text-lg hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
                    {paymentType === 'revive' ? '부활시키기' : '충전하기'}
                  </button>
                  <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors">취소</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Level Up Effect */}
        {showLevelUp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>
            <div className="relative flex flex-col items-center animate-in zoom-in duration-500 slide-in-from-bottom-20">
              <div className="absolute -top-40 flex gap-4">
                <span className="text-6xl animate-bounce [animation-delay:-0.1s]">🎉</span>
                <span className="text-6xl animate-bounce [animation-delay:-0.3s]">✨</span>
                <span className="text-6xl animate-bounce [animation-delay:-0.2s]">🎊</span>
              </div>
              
              <h2 className="text-8xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tighter italic animate-bounce">
                LEVEL UP!
              </h2>
              <div className="mt-4 bg-white/90 backdrop-blur-md px-10 py-4 rounded-full border-4 border-yellow-400 shadow-2xl scale-125">
                <span className="text-4xl font-black text-blue-600">
                  LV.{pet.level - 1} ➔ LV.{pet.level}
                </span>
              </div>
              
              <div className="mt-8 text-white font-bold text-2xl drop-shadow-md animate-pulse">
                "다마스가 더 크게 성장했어요!"
              </div>

              <div className="absolute -bottom-40 flex gap-8">
                <span className="text-7xl animate-ping opacity-50">⭐</span>
                <span className="text-7xl animate-ping opacity-50 [animation-delay:0.5s]">⭐</span>
              </div>
            </div>
          </div>
        )}

        {/* Special Mission Modal */}
        {showSpecialMission && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-md animate-pulse"></div>
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center border-[12px] border-yellow-400 w-full max-w-md relative z-10 animate-in zoom-in duration-300">
              <div className="text-yellow-500 font-black text-2xl mb-2 animate-bounce">✨ 특별 보너스 미션! ✨</div>
              <div className="text-gray-600 font-bold text-center mb-6">
                아래 문구를 정확하게 입력하면<br/>
                <span className="text-blue-600 text-xl font-black">+20 XP</span>를 획득합니다!
              </div>
              
              <div className="bg-gray-100 px-6 py-3 rounded-2xl mb-6 border-2 border-dashed border-gray-300 select-none">
                <span className="text-xl font-black text-gray-800">해시는 최고다</span>
              </div>

              <form onSubmit={handleSpecialMission} className="w-full space-y-4">
                <input
                  autoFocus
                  type="text"
                  value={missionInput}
                  onChange={(e) => setMissionInput(e.target.value)}
                  placeholder="문구를 입력하세요"
                  className="w-full border-4 border-yellow-100 rounded-2xl px-6 py-4 text-center text-xl font-bold focus:border-yellow-400 focus:outline-none transition-colors text-yellow-600"
                />
                <div className="flex gap-3">
                  <button type="submit" className="flex-[2] bg-yellow-400 text-white font-black py-4 rounded-2xl text-lg hover:bg-yellow-500 transition-colors shadow-lg active:scale-95">확인</button>
                  <button type="button" onClick={() => setShowSpecialMission(false)} className="flex-1 bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors">닫기</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Gift Box Modal */}
        {showGiftBox && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-pink-600/40 backdrop-blur-md animate-pulse"></div>
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center border-[12px] border-pink-400 w-full max-w-md relative z-10 animate-in zoom-in duration-300">
              {!newAnimal ? (
                <>
                  <div className="text-pink-500 font-black text-3xl mb-8 animate-bounce text-center">🎁 선물이 도착했어요! 🎁</div>
                  <div className="text-gray-600 font-bold text-center mb-10 text-lg">
                    배달 중에 신기한 상자를 발견했습니다!<br/>
                    과연 어떤 동물이 들어있을까요?
                  </div>
                  <button 
                    onClick={handleOpenGift}
                    className="w-full bg-pink-500 text-white font-black py-6 rounded-3xl text-2xl hover:bg-pink-600 transition-all shadow-xl active:scale-95 animate-pulse"
                  >
                    상자 열기
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center py-10 animate-in zoom-in duration-500">
                  <div className="text-pink-500 font-black text-2xl mb-8">축하합니다! ✨</div>
                  <div className="text-9xl mb-8 drop-shadow-2xl animate-bounce">
                    {newAnimal}
                  </div>
                  <div className="text-gray-800 font-black text-2xl mb-2 italic">
                    새로운 동물을 구출했습니다!
                  </div>
                  <div className="text-blue-600 font-bold text-lg">
                    +100 XP 획득!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Store Modal */}
        {showStore && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-md"></div>
            <div className="bg-white p-6 rounded-[3rem] shadow-2xl flex flex-col w-full max-w-md relative z-10 animate-in zoom-in duration-300 border-[12px] border-indigo-400">
              <div className="flex justify-between items-center mb-6">
                <div className="text-indigo-600 font-black text-2xl">🏪 다마스 상점</div>
                <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-400">
                  <span className="text-sm">💰</span>
                  <span className="text-sm font-black text-yellow-700">{pet.coins || 0}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {/* Diaper Item */}
                <div className={`p-4 rounded-3xl border-4 transition-all flex items-center justify-between ${pet.hasDiaper ? 'border-gray-100 bg-gray-50' : 'border-indigo-100 bg-indigo-50/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm">🚼</div>
                    <div>
                      <div className="font-black text-lg text-gray-800">기저귀</div>
                      <div className="text-xs font-bold text-indigo-500">응아 확률 50% 감소</div>
                    </div>
                  </div>
                  {pet.hasDiaper ? (
                    <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-xl font-black text-sm">보유 중</div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (buyItem('diaper', 300)) {
                          alert('기저귀를 구매했습니다! 이제 응아를 덜 싸요!');
                        } else {
                          alert('코인이 부족합니다! 열심히 배달해서 모아보세요!');
                        }
                      }}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-indigo-600 shadow-md active:scale-95 transition-all"
                    >
                      300 코인
                    </button>
                  )}
                </div>

                {/* Food Item */}
                <div className="p-4 rounded-3xl border-4 border-indigo-100 bg-indigo-50/50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm">🍎</div>
                    <div>
                      <div className="font-black text-lg text-gray-800">사과 세트</div>
                      <div className="text-xs font-bold text-indigo-500">배고픔 회복 횟수 +3</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (buyItem('food', 30)) {
                        alert('사과 세트를 구매했습니다!');
                      } else {
                        alert('코인이 부족합니다!');
                      }
                    }}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-indigo-600 shadow-md active:scale-95 transition-all"
                  >
                    30 코인
                  </button>
                </div>

                {/* Play Item */}
                <div className="p-4 rounded-3xl border-4 border-indigo-100 bg-indigo-50/50 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm">🎾</div>
                    <div>
                      <div className="font-black text-lg text-gray-800">놀이 세트</div>
                      <div className="text-xs font-bold text-indigo-500">행복 회복 횟수 +3</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (buyItem('play', 30)) {
                        alert('놀이 세트를 구매했습니다!');
                      } else {
                        alert('코인이 부족합니다!');
                      }
                    }}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-indigo-600 shadow-md active:scale-95 transition-all"
                  >
                    30 코인
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowStore(false)}
                className="w-full bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-lg hover:bg-gray-200 transition-all shadow-inner"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 max-w-sm text-center">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setShowStore(true)}
              className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl font-black shadow-lg border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              🏪 상점
            </button>
            <button 
              onClick={toggleAutoDeliver}
              disabled={pet.status !== 'alive'}
              className={`flex-[2] py-4 rounded-2xl text-sm font-black transition-all border-2 shadow-md ${
                isAutoDelivering 
                  ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                  : 'bg-green-500 text-white border-green-600 hover:bg-green-600'
              } disabled:opacity-50 disabled:grayscale`}
            >
              {isAutoDelivering ? '🛑 자동 배달 중지' : '🤖 자동 배달 시작'}
            </button>
          </div>
          {pet.poopCount > 0 && (
            <div className="bg-orange-100/80 backdrop-blur-md text-orange-600 px-6 py-4 rounded-2xl text-sm font-black animate-bounce border-2 border-orange-200 shadow-md mb-2 cursor-pointer text-center"
                 onClick={cleanPoop}>
              💩 응가가 있어요! 클릭해서 치워주세요! (+50 XP)
            </div>
          )}
          <div className="bg-blue-100/80 backdrop-blur-md text-blue-600 px-6 py-4 rounded-2xl text-sm font-black animate-pulse border-2 border-blue-200 shadow-md whitespace-nowrap">
            SPACEBAR 연타로 세탁물 배달! (+{1 + pet.collectedAnimals.length} XP)
          </div>
        </div>
        <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500 border border-gray-200">
          SYSTEM: v0.1.0-ALFA
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-400 font-medium">
        [유료 결제 및 청약철회 안내]<br/>
        모든 유료 상품은 구매 후 7일 이내에 청약철회가 불가합니다.<br/>
        미성년자 결제 시 법정대리인의 동의가 없으면 취소될 수 있으나,<br/>본인의 기망(도용 등)에 의한 결제는 취소가 제한됩니다.        </p>
      </div>
    </div>
  );
}

