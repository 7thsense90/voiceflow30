import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Campaign, Question, UserAnswer, ChatMessage } from '../types';
import { SEOHead } from './SEOHead';
import {
  Coins,
  Send,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  HelpCircle,
  Award,
  Check,
  ChevronRight,
  Gift,
  Flame,
  Clock,
} from 'lucide-react';
import { SurveyCooldownTimer } from './SurveyCooldownTimer';

interface ChatViewProps {
  campaign: Campaign;
}

export const ChatView: React.FC<ChatViewProps> = ({ campaign }) => {
  const {
    currentUser,
    cancelChat,
    submitFeedbackResponse,
    setCurrentView,
    settings,
    isSurveyLimitReached,
    surveyCooldownUntil,
  } = useApp();

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1); // -1 = intro phase
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState<number>(0);
  const [quizBonusCoins, setQuizBonusCoins] = useState<number>(0);

  // Active input states for current question
  const [textInput, setTextInput] = useState('');
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<string[]>([]);
  const [hoverStar, setHoverStar] = useState<number>(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Play synthesized audio blip for chat and coin celebration
  const playSound = (type: 'message' | 'coin') => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'message') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'coin') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Clean up any running timers or lingering social bar elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const existingScript = document.getElementById('adsterra-survey-social-bar-script');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
        const bannerElements = document.querySelectorAll(
          'script[src*="3c54f34a0d6bae61bb4146aad95fda67"], script[src*="pl31235133"], [id*="3c54f34a0d6bae61bb4146aad95fda67"], [class*="social-bar"], [id*="socialbar"]'
        );
        bannerElements.forEach((el) => {
          try {
            el.remove();
          } catch (_) {}
        });
      } catch (_) {}
    }

    return () => {};
  }, []);

  const handleCancelChat = () => {
    cancelChat();
  };

  // Initialize introductory greeting
  useEffect(() => {

    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          id: `msg_${Date.now()}`,
          sender: 'bot',
          text: `Hello ${
            currentUser?.name ? currentUser.name.split(' ')[0] : 'there'
          }! We would love to gather your honest feedback on "${campaign.title}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `msg_${Date.now() + 1}`,
          sender: 'bot',
          text: `This conversation contains ${campaign.questions.length} quick questions and takes ~${campaign.estimatedMinutes} minutes. You will earn ${campaign.rewardCoins} coins upon completion. Ready to begin?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      playSound('message');
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Post next question helper
  const postQuestion = (index: number) => {
    if (index >= campaign.questions.length) {
      // All questions completed! Finish up!
      handleCompleteConversation();
      return;
    }

    const q = campaign.questions[index];
    setCurrentQuestionIndex(index);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_q_${q.id}`,
          sender: 'bot',
          text: q.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          questionId: q.id,
          questionType: q.type,
          options: q.options,
          scaleMin: q.scaleMin,
          scaleMax: q.scaleMax,
          scaleMinLabel: q.scaleMinLabel,
          scaleMaxLabel: q.scaleMaxLabel,
        },
      ]);
      playSound('message');
    }, 700);
  };

  // Start conversation from intro
  const handleStartQuestions = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_user_start_${Date.now()}`,
        sender: 'user',
        text: "Yes, I'm ready! Let's begin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    postQuestion(0);
  };

  // Process user answer
  const handleAnswer = (answerValue: string | string[] | number) => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= campaign.questions.length) return;

    const currentQ = campaign.questions[currentQuestionIndex];
    let displayAnswer = '';
    let isCorrect: boolean | undefined = undefined;

    if (Array.isArray(answerValue)) {
      displayAnswer = answerValue.join(', ');
    } else {
      displayAnswer = String(answerValue);
    }

    // Check quiz correctness
    if (currentQ.type === 'quiz') {
      isCorrect =
        currentQ.correctAnswer?.toLowerCase().trim() ===
        String(answerValue).toLowerCase().trim();
      if (isCorrect) {
        setQuizBonusCoins((prev) => prev + (currentQ.reward || settings.bonusForQuizCorrectAnswer));
      }
    }

    const newAnswer: UserAnswer = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      answer: answerValue,
      isCorrect,
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    // Append user message
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_ans_${Date.now()}`,
        sender: 'user',
        text: displayAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Reset input temporary states
    setTextInput('');
    setSelectedMultiOptions([]);
    playSound('message');

    // Capture the question index just answered (0 for 1st question, 1 for 2nd, etc.)
    const questionJustAnswered = currentQuestionIndex;

    // If quiz, show immediate feedback from bot then proceed to next question
    if (currentQ.type === 'quiz') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const quizFeedbackMsg: ChatMessage = {
          id: `msg_quiz_res_${Date.now()}`,
          sender: 'bot',
          text: isCorrect
            ? `🎯 Correct! ${currentQ.explanation || ''}`
            : `❌ The correct answer was: "${currentQ.correctAnswer}". ${currentQ.explanation || ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isQuizResult: true,
          isCorrect,
        };

        setMessages((prev) => [...prev, quizFeedbackMsg]);
        playSound(isCorrect ? 'coin' : 'message');

        // Smooth natural transition to next question
        setTimeout(() => {
          postQuestion(questionJustAnswered + 1);
        }, 500);
      }, 600);
    } else {
      // Normal survey question: smooth natural progression to next question
      setTimeout(() => {
        postQuestion(questionJustAnswered + 1);
      }, 500);
    }
  };

  // Complete conversation celebration
  const handleCompleteConversation = () => {
    const totalEarned = campaign.rewardCoins + quizBonusCoins;
    setTotalCoinsEarned(totalEarned);
    setIsCompleted(true);
    playSound('coin');

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#fbbf24'],
      });
    } catch {
      // ignore
    }

    // Submit response to global state & update coin balance
    submitFeedbackResponse(campaign.id, userAnswers, totalEarned);
  };

  const currentQ: Question | undefined =
    currentQuestionIndex >= 0 && currentQuestionIndex < campaign.questions.length
      ? campaign.questions[currentQuestionIndex]
      : undefined;

  const currentProgress =
    currentQuestionIndex < 0
      ? 0
      : Math.round(((currentQuestionIndex + 1) / campaign.questions.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-2.5 sm:px-6 py-2 sm:py-6 flex-1 flex flex-col min-h-0 overflow-hidden">
      <SEOHead
        title={`${campaign.title} - Chat Feedback Survey`}
        description={`Share your feedback on ${campaign.title} and earn ${campaign.rewardCoins} coins instantly in Voice Flow 360.`}
        keywords={[
          campaign.title,
          `${campaign.category} feedback`,
          'paid survey chat',
          'earn coins survey',
        ]}
        canonicalPath={`/chat/${campaign.id}`}
      />
      {/* Top Navigation & Info Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-2.5 sm:mb-4 shadow-xs flex flex-col gap-2.5 sm:gap-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              id="chat-back-btn"
              onClick={handleCancelChat}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Exit to Dashboard"
              aria-label="Exit survey"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                  {campaign.category.replace('_', ' ')}
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {campaign.title}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                {campaign.questions.length} questions • Conversational Feedback
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-[11px] sm:text-xs whitespace-nowrap">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span>+{campaign.rewardCoins} Coins</span>
            </div>
          </div>
        </div>

        {/* Question Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500">
            <span>
              {currentQuestionIndex < 0
                ? 'Ready to Start'
                : isCompleted
                ? 'Completed! 🎉'
                : `Question ${currentQuestionIndex + 1} of ${campaign.questions.length}`}
            </span>
            <span>{currentProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* In-Survey Sponsored Header Ad Strip - Active While Customer Fills Survey */}
        <div className="mt-0.5 bg-gradient-to-r from-purple-50 via-slate-50 to-amber-50 border border-purple-200/80 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center justify-between gap-2 text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-purple-900 shrink-0">
              Survey Sponsor
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-600 truncate font-medium">
              High-yielding sponsored campaigns active
            </span>
          </div>
          <div className="shrink-0">
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
              Sponsored
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
        {/* Messages Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {messages.map((msg) => {
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 sm:gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in duration-200`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-extrabold text-[11px] sm:text-xs flex items-center justify-center shrink-0 shadow-xs">
                    Aria
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed break-words ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                      : msg.isQuizResult
                      ? msg.isCorrect
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-tl-xs'
                        : 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0">
                Aria
              </div>
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl rounded-tl-xs px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Interactive Response Controls */}
        <div className="p-3 sm:p-4 bg-slate-50/90 border-t border-slate-200 shrink-0">
          {isCompleted ? (
            /* Completed Screen Overlay in Chat */
            <div className="text-center py-2 sm:py-4 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 max-h-[60vh] overflow-y-auto">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-800 shadow-md">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 break-words">
                  Feedback Chat Completed! 🎉
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Thank you for sharing your valuable thoughts.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 font-black text-sm sm:text-lg shadow-md max-w-full">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] shrink-0" />
                <span className="truncate">+{totalCoinsEarned} Coins Added to Balance!</span>
              </div>

              {quizBonusCoins > 0 && (
                <div className="text-xs text-emerald-700 font-bold">
                  Includes +{quizBonusCoins} Bonus Coins for correct quiz answers! 🎯
                </div>
              )}

              {/* 12-Hour Survey Quality Cooldown Notification (Shown ONLY when 5 surveys are completed!) */}
              {isSurveyLimitReached && surveyCooldownUntil && (
                <div className="max-w-md mx-auto bg-amber-500/10 border-2 border-amber-400/80 rounded-2xl p-3 sm:p-5 text-center space-y-2.5 sm:space-y-3 animate-in fade-in">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>5 Surveys Completed • Quality Rest</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium break-words">
                    Surveys are limited to <strong>5 every 12 hours</strong>. You will be able to fill new surveys in:
                  </p>

                  <div className="flex justify-center py-1">
                    <SurveyCooldownTimer targetDate={surveyCooldownUntil} size="md" />
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    Unlocks at {new Date(surveyCooldownUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {/* Policy-compliant survey completion review note */}
              <div className="max-w-xl mx-auto my-2 text-left bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Verified Submission:</span> Your feedback has been corroborated and indexed in the Voice Flow 360 Consumer Sentiment dataset. Research credits will be reviewed and disbursed to your account balance.
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-1 w-full">
                <button
                  id="chat-return-dash-btn"
                  onClick={handleCancelChat}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  id="chat-goto-rewards-btn"
                  onClick={() => setCurrentView('rewards')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>Rewards &amp; Cashout</span>
                </button>
              </div>
            </div>
          ) : currentQuestionIndex < 0 ? (
            /* Intro: Start Button */
            <div className="flex items-center justify-center">
              <button
                id="chat-start-flow-btn"
                onClick={handleStartQuestions}
                disabled={isTyping}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Yes, I&apos;m ready! Let&apos;s Start</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : currentQ && !isTyping ? (
            /* Active Question Response Controls */
            <div className="space-y-2.5 sm:space-y-3">
              {/* Type 1: Text Response */}
              {currentQ.type === 'text' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!textInput.trim() && currentQ.required) return;
                    handleAnswer(textInput.trim() || 'No additional comments');
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    id="chat-text-response-input"
                    type="text"
                    autoFocus
                    placeholder={currentQ.placeholder || 'Type your honest response here...'}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="flex-1 min-w-0 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
                  />
                  <button
                    id="chat-submit-text-btn"
                    type="submit"
                    disabled={!textInput.trim() && currentQ.required}
                    className="p-2.5 sm:p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Type 2: Single Choice */}
              {currentQ.type === 'single_choice' && currentQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="p-2.5 sm:p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-800 font-medium text-xs rounded-xl shadow-xs text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="break-words pr-2">{opt}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Type 3: Multiple Choice */}
              {currentQ.type === 'multiple_choice' && currentQ.options && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select all that apply:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
                    {currentQ.options.map((opt) => {
                      const isSelected = selectedMultiOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMultiOptions((prev) => prev.filter((o) => o !== opt));
                            } else {
                              setSelectedMultiOptions((prev) => [...prev, opt]);
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="break-words pr-2">{opt}</span>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                              isSelected
                                ? 'bg-white text-amber-600 border-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      if (selectedMultiOptions.length === 0 && currentQ.required) return;
                      handleAnswer(
                        selectedMultiOptions.length > 0
                          ? selectedMultiOptions
                          : ['None specified']
                      );
                    }}
                    disabled={selectedMultiOptions.length === 0 && currentQ.required}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Submit Selections ({selectedMultiOptions.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Type 4: Yes / No */}
              {currentQ.type === 'yes_no' && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleAnswer('Yes')}
                    className="py-2.5 sm:py-3 px-3 sm:px-4 bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-500 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Yes</span>
                  </button>
                  <button
                    onClick={() => handleAnswer('No')}
                    className="py-2.5 sm:py-3 px-3 sm:px-4 bg-white hover:bg-rose-50 border-2 border-rose-200 hover:border-rose-500 text-rose-800 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>No</span>
                  </button>
                </div>
              )}

              {/* Type 5: 1 to 5 Star Rating */}
              {currentQ.type === 'rating' && (
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 text-center space-y-2.5 sm:space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Tap a star rating (1 to 5):
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => handleAnswer(`${star} Stars`)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            (hoverStar || 0) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {hoverStar === 1 && '1 Star - Poor / Disappointed'}
                    {hoverStar === 2 && '2 Stars - Fair / Needs Work'}
                    {hoverStar === 3 && '3 Stars - Good / Average'}
                    {hoverStar === 4 && '4 Stars - Very Good'}
                    {hoverStar === 5 && '5 Stars - Excellent / Outstanding!'}
                  </div>
                </div>
              )}

              {/* Type 6: 1 to 10 Scale */}
              {currentQ.type === 'scale' && (
                <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{currentQ.scaleMinLabel || '1 = Lowest'}</span>
                    <span>{currentQ.scaleMaxLabel || '10 = Highest'}</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
                    {Array.from(
                      { length: (currentQ.scaleMax || 10) - (currentQ.scaleMin || 1) + 1 },
                      (_, i) => (currentQ.scaleMin || 1) + i
                    ).map((val) => (
                      <button
                        key={val}
                        onClick={() => handleAnswer(val)}
                        className="py-2 sm:py-2.5 bg-slate-50 hover:bg-amber-500 hover:text-white border border-slate-200 hover:border-amber-600 rounded-lg text-xs font-bold text-slate-800 transition-all cursor-pointer"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type 7: Interactive Quiz */}
              {currentQ.type === 'quiz' && currentQ.options && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/80 px-2 py-0.5 rounded break-words">
                      Quiz Question (+{currentQ.reward || settings.bonusForQuizCorrectAnswer} Bonus Coins)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className="p-2.5 sm:p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-800 font-medium text-xs rounded-xl shadow-xs text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <span className="break-words pr-2">{opt}</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
