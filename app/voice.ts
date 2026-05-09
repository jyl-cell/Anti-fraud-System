// utils/voice.ts
export function speak(text:string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const s = new SpeechSynthesisUtterance(text);
  s.lang = "zh-CN";
  window.speechSynthesis.speak(s);
}