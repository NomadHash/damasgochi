import { useState, useEffect, useCallback, useRef } from 'react';

// 간단한 데이터 암호화/복호화 유틸리티
const SECRET_KEY = 'damas_secret_key';
const encryptData = (data: string): string => {
  return btoa(encodeURIComponent(data).split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
  ).join(''));
};

const decryptData = (encoded: string): string => {
  try {
    const decoded = atob(encoded).split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length))
    ).join('');
    return decodeURIComponent(decoded);
  } catch (e) {
    return '';
  }
};

export type PetStatus = 'alive' | 'dead' | 'sleeping';

export type AnimalEffectType = 'xp1' | 'xp2' | 'xp3' | 'coins' | 'food' | 'play';

export const ANIMAL_EFFECTS: Record<string, { type: AnimalEffectType; label: string }> = {
  '🐶': { type: 'xp1', label: '배달 경험치 +1 XP' },
  '🐱': { type: 'xp1', label: '배달 경험치 +1 XP' },
  '🐭': { type: 'xp1', label: '배달 경험치 +1 XP' },
  '🐹': { type: 'xp1', label: '배달 경험치 +1 XP' },
  '🐰': { type: 'play', label: '1분마다 놀이세트 증정' },
  '🦊': { type: 'xp2', label: '배달 경험치 +2 XP' },
  '🐻': { type: 'coins', label: '1분마다 10코인 증정' },
  '🐼': { type: 'xp2', label: '배달 경험치 +2 XP' },
  '🐨': { type: 'xp2', label: '배달 경험치 +2 XP' },
  '🐯': { type: 'coins', label: '1분마다 10코인 증정' },
  '🦁': { type: 'coins', label: '1분마다 10코인 증정' },
  '🐮': { type: 'food', label: '1분마다 사과세트 증정' },
  '🐷': { type: 'food', label: '1분마다 사과세트 증정' },
  '🐸': { type: 'xp3', label: '배달 경험치 +3 XP' },
  '🐵': { type: 'food', label: '1분마다 사과세트 증정' },
  '🐣': { type: 'xp1', label: '배달 경험치 +1 XP' },
  '🐧': { type: 'xp3', label: '배달 경험치 +3 XP' },
  '🦆': { type: 'xp1', label: '배달 경험치 +1 XP' },
  '🦋': { type: 'xp3', label: '배달 경험치 +3 XP' },
};

export interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  age: number;
  status: PetStatus;
  lastUpdate: number;
  feedCount: number;
  playCount: number;
  lastCountReset: string;
  level: number;
  xp: number;
  poopCount: number;
  collectedAnimals: string[];
  coins: number;
  hasDiaper: boolean;
}

const INITIAL_STATE: PetState = {
  name: '다마고치',
  hunger: 100,
  happiness: 100,
  energy: 100,
  health: 100,
  age: 0,
  status: 'alive',
  lastUpdate: Date.now(),
  feedCount: 3,
  playCount: 3,
  lastCountReset: new Date().toISOString().split('T')[0],
  level: 1,
  xp: 0,
  poopCount: 0,
  collectedAnimals: [],
  coins: 0,
  hasDiaper: false,
};

export function useDamasgochi() {
  const [pet, setPet] = useState<PetState>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastAction, setLastAction] = useState<'feed' | 'play' | 'sleep' | 'deliver' | null>(null);
  const [deliverEffectKey, setDeliverEffectKey] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isAutoDelivering, setIsAutoDelivering] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoDelivering && pet.status === 'alive') {
      interval = setInterval(() => {
        deliver();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoDelivering, pet.status]);

  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);

  useEffect(() => {
    if (lastAction) {
      const duration = lastAction === 'deliver' ? 300 : 1500;
      const timer = setTimeout(() => {
        setLastAction(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [lastAction, deliverEffectKey]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('damasgochi_pet');
    if (saved) {
      try {
        const decrypted = decryptData(saved);
        if (!decrypted) throw new Error('Decryption failed');
        const parsed = JSON.parse(decrypted);
        const now = Date.now();
        const diff = now - parsed.lastUpdate;
        const minutesPassed = Math.floor(diff / 60000);
        
        const hungerLoss = Math.floor(minutesPassed / 2);
        const energyLoss = Math.floor(minutesPassed / 5);
        
        const today = new Date().toISOString().split('T')[0];
        const countsReset = parsed.lastCountReset !== today;

        setPet({
          ...parsed,
          hunger: Math.max(0, (parsed.hunger || 0) - hungerLoss),
          energy: Math.max(0, (parsed.energy || 0) - energyLoss),
          feedCount: countsReset ? 3 : (parsed.feedCount ?? 3),
          playCount: countsReset ? 3 : (parsed.playCount ?? 3),
          level: parsed.level ?? 1,
          xp: parsed.xp ?? 0,
          poopCount: parsed.poopCount ?? 0,
          collectedAnimals: parsed.collectedAnimals ?? [],
          coins: parsed.coins ?? 0,
          hasDiaper: parsed.hasDiaper ?? false,
          lastCountReset: today,
          lastUpdate: now,
        });
      } catch (e) {
        console.error('Failed to parse pet state', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      const encrypted = encryptData(JSON.stringify(pet));
      localStorage.setItem('damasgochi_pet', encrypted);
    }
  }, [pet, isInitialized]);

  useEffect(() => {
    if (!isInitialized || pet.status === 'dead') return;

    // 1분(60초)마다 보상 지급을 위한 카운터 (3초 간격이므로 20번)
    let minuteCounter = 0;

    const interval = setInterval(() => {
      setPet((prev) => {
        if (prev.status === 'dead') return prev;

        minuteCounter++;
        let coinsBonus = 0;
        let foodBonus = 0;
        let playBonus = 0;

        // 1분(20틱)마다 보상 계산
        if (minuteCounter >= 20) {
          minuteCounter = 0;
          prev.collectedAnimals.forEach(animal => {
            const effect = ANIMAL_EFFECTS[animal];
            if (!effect) return;
            if (effect.type === 'coins') coinsBonus += 10;
            if (effect.type === 'food') foodBonus += 3;
            if (effect.type === 'play') playBonus += 3;
          });
        }

        const hunger = Math.max(0, prev.hunger - 2);
        const energy = prev.status === 'sleeping' 
          ? Math.min(100, prev.energy + 10) 
          : Math.max(0, prev.energy - 1);
        const happiness = Math.max(0, prev.happiness - 1);
        
        let health = prev.health;
        if (hunger === 0 || energy === 0 || prev.poopCount > 0) {
          // 응가가 있으면 건강이 더 빨리 깎임
          health = Math.max(0, prev.health - (prev.poopCount > 0 ? 8 : 5));
        } else if (hunger > 80 && energy > 80) {
          health = Math.min(100, prev.health + 1);
        }

        const status = health === 0 ? 'dead' : (prev.status === 'sleeping' && energy === 100 ? 'alive' : prev.status);

        // 응가 생성 로직 (배가 부를수록 응가 확률 증가)
        let poopCount = prev.poopCount;
        const poopProb = prev.hasDiaper ? 0.025 : 0.05; // 기저귀 착용 시 확률 절반
        if (status === 'alive' && prev.hunger > 50 && Math.random() < poopProb) {
          poopCount = Math.min(3, poopCount + 1);
        }

        return {
          ...prev,
          hunger,
          energy,
          happiness,
          health,
          status,
          poopCount,
          coins: (prev.coins || 0) + coinsBonus,
          feedCount: (prev.feedCount || 0) + foodBonus,
          playCount: (prev.playCount || 0) + playBonus,
          lastUpdate: Date.now(),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isInitialized, pet.status]);

  const feed = useCallback(() => {
    if (pet.status === 'dead' || pet.status === 'sleeping') return;
    if (pet.feedCount <= 0) return;
    setLastAction('feed');
    setPet((prev) => {
      let xp = prev.xp + 15;
      let level = prev.level;
      const xpToNextLevel = level * 100;
      if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        return {
          ...prev,
          hunger: Math.min(100, prev.hunger + 30),
          energy: Math.min(100, prev.energy + 30),
          happiness: Math.min(100, prev.happiness + 30),
          health: Math.min(100, prev.health + 30),
          xp,
          level,
          coins: (prev.coins || 0) + 100
        };
      }
      return {
        ...prev,
        hunger: Math.min(100, prev.hunger + 15),
        happiness: Math.min(100, prev.happiness + 2),
        health: Math.min(100, prev.health + 30), // 밥 먹으면 건강도 대폭 회복
        feedCount: prev.feedCount - 1,
        xp,
        level
      };
    });
  }, [pet.status, pet.feedCount]);

  const play = useCallback(() => {
    if (pet.status === 'dead' || pet.status === 'sleeping') return;
    if (pet.playCount <= 0) return;
    if (pet.energy < 10) return;
    setLastAction('play');
    setPet((prev) => {
      let xp = prev.xp + 30;
      let level = prev.level;
      const xpToNextLevel = level * 100;
      if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        return {
          ...prev,
          hunger: Math.min(100, prev.hunger + 30),
          energy: Math.min(100, prev.energy + 30),
          happiness: Math.min(100, prev.happiness + 30),
          health: Math.min(100, prev.health + 30),
          xp,
          level,
          coins: (prev.coins || 0) + 100
        };
      }
      return {
        ...prev,
        happiness: Math.min(100, prev.happiness + 20),
        energy: Math.max(0, prev.energy - 15),
        playCount: prev.playCount - 1,
        xp,
        level
      };
    });
  }, [pet.status, pet.playCount, pet.energy]);

  const deliver = useCallback(() => {
    if (pet.status === 'dead' || pet.status === 'sleeping') return { special: false, gift: false };
    setLastAction('deliver');
    setDeliverEffectKey(prev => prev + 1);
    
    // 1% 확률로 특별 미션 발생, 0.5% 확률로 선물 상자 발견
    const triggerSpecial = Math.random() < 0.01;
    const triggerGift = Math.random() < 0.005;

    setPet((prev) => {
      const animalBonus = prev.collectedAnimals.reduce((acc, animal) => {
        const effect = ANIMAL_EFFECTS[animal];
        if (!effect) return acc;
        if (effect.type === 'xp1') return acc + 1;
        if (effect.type === 'xp2') return acc + 2;
        if (effect.type === 'xp3') return acc + 3;
        return acc;
      }, 0);
      let xp = prev.xp + 1 + animalBonus;
      let level = prev.level;
      const xpToNextLevel = level * 100;
      if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        return {
          ...prev,
          hunger: Math.min(100, prev.hunger + 30),
          energy: Math.min(100, prev.energy + 30),
          happiness: Math.min(100, prev.happiness + 30),
          health: Math.min(100, prev.health + 30),
          xp,
          level,
          coins: (prev.coins || 0) + 100
        };
      }
      return {
        ...prev,
        xp,
        level,
        // 10번 누를 때마다 1%가 깎이도록 1회당 0.1% 소모 설정
        energy: Math.max(0, prev.energy - 0.1),
      };
    });

    return { special: triggerSpecial, gift: triggerGift };
  }, [pet.status, pet.level]);

  const drawAnimal = useCallback(() => {
    const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐣', '🐧', '🦆', '🦋'];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    
    setPet(prev => ({
      ...prev,
      collectedAnimals: [...prev.collectedAnimals, randomAnimal],
      xp: prev.xp + 100, // 동물 뽑으면 보너스 경험치
    }));
    
    return randomAnimal;
  }, []);

  const addBonusXp = useCallback((amount: number) => {
    setPet((prev) => {
      let xp = prev.xp + amount;
      let level = prev.level;
      const xpToNextLevel = level * 100;
      
      if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        return {
          ...prev,
          hunger: Math.min(100, prev.hunger + 30),
          energy: Math.min(100, prev.energy + 30),
          happiness: Math.min(100, prev.happiness + 30),
          health: Math.min(100, prev.health + 30),
          xp,
          level,
          coins: (prev.coins || 0) + 100
        };
      }
      return { ...prev, xp, level };
    });
  }, []);

  const refillFeed = useCallback(() => {
    setPet((prev) => ({ ...prev, feedCount: 3 }));
  }, []);

  const refillPlay = useCallback(() => {
    setPet((prev) => ({ ...prev, playCount: 3 }));
  }, []);

  const cleanPoop = useCallback(() => {
    if (pet.poopCount <= 0) return;
    setLastAction('play'); // 애니메이션 재활용 또는 다른 액션 설정 가능
    setPet((prev) => {
      let xp = prev.xp + 50;
      let level = prev.level;
      const xpToNextLevel = level * 100;
      if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        return {
          ...prev,
          hunger: Math.min(100, prev.hunger + 30),
          energy: Math.min(100, prev.energy + 30),
          happiness: Math.min(100, prev.happiness + 30),
          health: Math.min(100, prev.health + 30),
          xp,
          level,
          coins: (prev.coins || 0) + 100,
          poopCount: Math.max(0, prev.poopCount - 1),
        };
      }
      return {
        ...prev,
        poopCount: Math.max(0, prev.poopCount - 1),
        xp,
        level,
        happiness: Math.min(100, prev.happiness + 5),
      };
    });
  }, [pet.poopCount, pet.level]);

  const sleep = useCallback(() => {
    if (pet.status === 'dead') return;
    setLastAction('sleep');
    setPet((prev) => ({
      ...prev,
      status: prev.status === 'sleeping' ? 'alive' : 'sleeping',
    }));
  }, [pet.status]);

  const reset = useCallback(() => {
    setPet(INITIAL_STATE);
  }, []);

  const revive = useCallback(() => {
    setPet((prev) => ({
      ...prev,
      hunger: 100,
      happiness: 100,
      energy: 100,
      health: 100,
      status: 'alive',
      poopCount: 0,
      lastUpdate: Date.now(),
    }));
  }, []);

  const rename = useCallback((newName: string) => {
    setPet((prev) => ({ ...prev, name: newName }));
  }, []);

  const toggleAutoDeliver = useCallback(() => {
    setIsAutoDelivering(prev => !prev);
  }, []);

  const buyItem = useCallback((item: 'diaper' | 'food' | 'play', price: number) => {
    if ((pet.coins || 0) < price) return false;
    
    setPet(prev => ({
      ...prev,
      coins: prev.coins - price,
      hasDiaper: item === 'diaper' ? true : prev.hasDiaper,
      feedCount: item === 'food' ? prev.feedCount + 3 : prev.feedCount,
      playCount: item === 'play' ? prev.playCount + 3 : prev.playCount,
    }));
    return true;
  }, [pet.coins]);

  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (isInitialized) {
      if (prevLevelRef.current !== null && pet.level > prevLevelRef.current) {
        setShowLevelUp(true);
      }
      prevLevelRef.current = pet.level;
    }
  }, [pet.level, isInitialized]);

  return { pet, feed, play, sleep, reset, revive, rename, refillFeed, refillPlay, deliver, addBonusXp, cleanPoop, toggleAutoDeliver, drawAnimal, buyItem, isInitialized, lastAction, deliverEffectKey, showLevelUp, isAutoDelivering };
}

