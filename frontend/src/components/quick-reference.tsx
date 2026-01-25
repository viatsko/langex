"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PhraseItem {
  turkish: string;
  pronunciation: string;
  english: string;
  russian: string;
}

interface PhraseGroup {
  title: string;
  items: PhraseItem[];
}

const phraseGroups: PhraseGroup[] = [
  {
    title: "Greetings",
    items: [
      { turkish: "Merhaba", pronunciation: "mer-HA-ba", english: "Hello", russian: "Привет" },
      { turkish: "Günaydın", pronunciation: "gün-ay-DIN", english: "Good morning", russian: "Доброе утро" },
      { turkish: "İyi akşamlar", pronunciation: "i-YI ak-sham-LAR", english: "Good evening", russian: "Добрый вечер" },
      { turkish: "Hoşça kal", pronunciation: "hosh-CHA kal", english: "Goodbye", russian: "Пока" },
      { turkish: "Görüşürüz", pronunciation: "gö-rü-shü-RÜZ", english: "See you", russian: "Увидимся" },
    ],
  },
  {
    title: "Yes / No / Maybe",
    items: [
      { turkish: "Evet", pronunciation: "e-VET", english: "Yes", russian: "Да" },
      { turkish: "Hayır", pronunciation: "ha-YIR", english: "No", russian: "Нет" },
      { turkish: "Belki", pronunciation: "bel-KI", english: "Maybe", russian: "Может быть" },
      { turkish: "Tabii", pronunciation: "ta-BI", english: "Of course", russian: "Конечно" },
      { turkish: "Tamam", pronunciation: "ta-MAM", english: "Okay", russian: "Хорошо" },
    ],
  },
  {
    title: "Common Phrases",
    items: [
      { turkish: "Bilmiyorum", pronunciation: "bil-mi-YO-rum", english: "I don't know", russian: "Я не знаю" },
      { turkish: "Anlamıyorum", pronunciation: "an-la-mi-YO-rum", english: "I don't understand", russian: "Я не понимаю" },
      { turkish: "Teşekkür ederim", pronunciation: "te-shek-KÜR e-de-RIM", english: "Thank you", russian: "Спасибо" },
      { turkish: "Rica ederim", pronunciation: "ri-JA e-de-RIM", english: "You're welcome", russian: "Пожалуйста" },
      { turkish: "Affedersiniz", pronunciation: "af-fe-der-si-NIZ", english: "Excuse me", russian: "Извините" },
    ],
  },
  {
    title: "True / False",
    items: [
      { turkish: "Doğru", pronunciation: "do-RU", english: "True / Correct", russian: "Правда / Верно" },
      { turkish: "Yanlış", pronunciation: "yan-LISH", english: "False / Wrong", russian: "Неправда / Неверно" },
      { turkish: "Haklısın", pronunciation: "hak-li-SIN", english: "You're right", russian: "Ты прав" },
      { turkish: "Emin misin?", pronunciation: "e-MIN mi-SIN?", english: "Are you sure?", russian: "Ты уверен?" },
    ],
  },
  {
    title: "Where is...?",
    items: [
      { turkish: "... nerede?", pronunciation: "... ne-RE-de?", english: "Where is ...?", russian: "Где ...?" },
      { turkish: "Tuvalet nerede?", pronunciation: "tu-va-LET ne-RE-de?", english: "Where is the toilet?", russian: "Где туалет?" },
      { turkish: "İstasyon nerede?", pronunciation: "is-tas-YON ne-RE-de?", english: "Where is the station?", russian: "Где станция?" },
      { turkish: "Restoran nerede?", pronunciation: "res-to-RAN ne-RE-de?", english: "Where is the restaurant?", russian: "Где ресторан?" },
    ],
  },
  {
    title: "What is...?",
    items: [
      { turkish: "... ne?", pronunciation: "... ne?", english: "What is ...?", russian: "Что такое ...?" },
      { turkish: "Bu ne?", pronunciation: "bu ne?", english: "What is this?", russian: "Что это?" },
      { turkish: "Adın ne?", pronunciation: "a-DIN ne?", english: "What is your name?", russian: "Как тебя зовут?" },
      { turkish: "Fiyatı ne?", pronunciation: "fi-ya-TI ne?", english: "What is the price?", russian: "Какая цена?" },
    ],
  },
  {
    title: "How to...?",
    items: [
      { turkish: "... nasıl?", pronunciation: "... na-SIL?", english: "How is ...? / How to ...?", russian: "Как ...?" },
      { turkish: "Nasılsın?", pronunciation: "na-SIL-sin?", english: "How are you?", russian: "Как дела?" },
      { turkish: "Buraya nasıl gidilir?", pronunciation: "bu-ra-YA na-SIL gi-di-LIR?", english: "How do I get here?", russian: "Как сюда добраться?" },
      { turkish: "Bu nasıl söylenir?", pronunciation: "bu na-SIL söy-le-NIR?", english: "How do you say this?", russian: "Как это сказать?" },
    ],
  },
  {
    title: "When is...?",
    items: [
      { turkish: "... ne zaman?", pronunciation: "... ne za-MAN?", english: "When is ...?", russian: "Когда ...?" },
      { turkish: "Saat kaç?", pronunciation: "sa-AT kach?", english: "What time is it?", russian: "Который час?" },
      { turkish: "Ne zaman açık?", pronunciation: "ne za-MAN a-CHIK?", english: "When is it open?", russian: "Когда открыто?" },
      { turkish: "Otobüs ne zaman?", pronunciation: "o-to-BÜS ne za-MAN?", english: "When is the bus?", russian: "Когда автобус?" },
    ],
  },
];

function PhraseColumn({ group }: { group: PhraseGroup }) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-primary mb-2">{group.title}</h3>
      <div className="space-y-1.5">
        {group.items.map((item, idx) => (
          <div key={idx} className="text-sm">
            <div className="font-medium">{item.turkish}</div>
            <div className="text-xs text-muted-foreground">
              /{item.pronunciation}/ — {item.english} · {item.russian}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickReference() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {phraseGroups.map((group) => (
            <PhraseColumn key={group.title} group={group} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
