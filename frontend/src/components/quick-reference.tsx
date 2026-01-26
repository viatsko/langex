"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Persist collapsed state for each category in localStorage
const quickRefMainOpenAtom = atomWithStorage("quickRefMainOpen", true);
const quickRefGrammarOpenAtom = atomWithStorage("quickRefGrammarOpen", true);
const quickRefCommonOpenAtom = atomWithStorage("quickRefCommonOpen", true);
const quickRefNumbersOpenAtom = atomWithStorage("quickRefNumbersOpen", false);
const quickRefQuestionsOpenAtom = atomWithStorage("quickRefQuestionsOpen", false);

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

interface Category {
  title: string;
  groups: PhraseGroup[];
  atom: ReturnType<typeof atomWithStorage<boolean>>;
}

// Grammar Basics
const grammarGroups: PhraseGroup[] = [
  {
    title: "Vowels (Ünlüler)",
    items: [
      { turkish: "a, ı, o, u", pronunciation: "back vowels", english: "Back (kalın)", russian: "Задние (твёрдые)" },
      { turkish: "e, i, ö, ü", pronunciation: "front vowels", english: "Front (ince)", russian: "Передние (мягкие)" },
      { turkish: "a, e, ı, i", pronunciation: "unrounded", english: "Unrounded (düz)", russian: "Неогублённые" },
      { turkish: "o, ö, u, ü", pronunciation: "rounded", english: "Rounded (yuvarlak)", russian: "Огублённые" },
    ],
  },
  {
    title: "Question (mi?)",
    items: [
      { turkish: "mı?", pronunciation: "mi", english: "after a, ı", russian: "после a, ı" },
      { turkish: "mi?", pronunciation: "mi", english: "after e, i", russian: "после e, i" },
      { turkish: "mu?", pronunciation: "mu", english: "after o, u", russian: "после o, u" },
      { turkish: "mü?", pronunciation: "mü", english: "after ö, ü", russian: "после ö, ü" },
    ],
  },
];

// Common Words & Phrases
const commonGroups: PhraseGroup[] = [
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
      { turkish: "Teşekkür ederim", pronunciation: "te-shek-KÜR e-de-RIM", english: "Thank you (formal)", russian: "Спасибо (форм.)" },
      { turkish: "Teşekkürler", pronunciation: "te-shek-kür-LER", english: "Thanks", russian: "Спасибо" },
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
    title: "Time",
    items: [
      { turkish: "Şimdi", pronunciation: "shim-DI", english: "Now", russian: "Сейчас" },
      { turkish: "Bugün", pronunciation: "bu-GÜN", english: "Today", russian: "Сегодня" },
      { turkish: "Yarın", pronunciation: "ya-RIN", english: "Tomorrow", russian: "Завтра" },
      { turkish: "Dün", pronunciation: "dün", english: "Yesterday", russian: "Вчера" },
      { turkish: "Sonra", pronunciation: "son-RA", english: "Later / After", russian: "Потом / После" },
    ],
  },
];

// Numbers
const numberGroups: PhraseGroup[] = [
  {
    title: "0-10",
    items: [
      { turkish: "Sıfır", pronunciation: "si-FIR", english: "0", russian: "0" },
      { turkish: "Bir", pronunciation: "bir", english: "1", russian: "1" },
      { turkish: "İki", pronunciation: "i-KI", english: "2", russian: "2" },
      { turkish: "Üç", pronunciation: "üch", english: "3", russian: "3" },
      { turkish: "Dört", pronunciation: "dört", english: "4", russian: "4" },
      { turkish: "Beş", pronunciation: "besh", english: "5", russian: "5" },
      { turkish: "Altı", pronunciation: "al-TI", english: "6", russian: "6" },
      { turkish: "Yedi", pronunciation: "ye-DI", english: "7", russian: "7" },
      { turkish: "Sekiz", pronunciation: "se-KIZ", english: "8", russian: "8" },
      { turkish: "Dokuz", pronunciation: "do-KUZ", english: "9", russian: "9" },
      { turkish: "On", pronunciation: "on", english: "10", russian: "10" },
    ],
  },
  {
    title: "11-19 (on + digit)",
    items: [
      { turkish: "On bir", pronunciation: "on bir", english: "11", russian: "11" },
      { turkish: "On iki", pronunciation: "on i-KI", english: "12", russian: "12" },
      { turkish: "On üç", pronunciation: "on üch", english: "13", russian: "13" },
      { turkish: "On dört", pronunciation: "on dört", english: "14", russian: "14" },
      { turkish: "On beş", pronunciation: "on besh", english: "15", russian: "15" },
    ],
  },
  {
    title: "Tens",
    items: [
      { turkish: "Yirmi", pronunciation: "yir-MI", english: "20", russian: "20" },
      { turkish: "Otuz", pronunciation: "o-TUZ", english: "30", russian: "30" },
      { turkish: "Kırk", pronunciation: "kirk", english: "40", russian: "40" },
      { turkish: "Elli", pronunciation: "el-LI", english: "50", russian: "50" },
      { turkish: "Altmış", pronunciation: "alt-MISH", english: "60", russian: "60" },
      { turkish: "Yetmiş", pronunciation: "yet-MISH", english: "70", russian: "70" },
      { turkish: "Seksen", pronunciation: "sek-SEN", english: "80", russian: "80" },
      { turkish: "Doksan", pronunciation: "dok-SAN", english: "90", russian: "90" },
    ],
  },
  {
    title: "Big Numbers",
    items: [
      { turkish: "Yüz", pronunciation: "yüz", english: "100", russian: "100" },
      { turkish: "İki yüz", pronunciation: "i-KI yüz", english: "200", russian: "200" },
      { turkish: "Bin", pronunciation: "bin", english: "1,000", russian: "1000" },
      { turkish: "Milyon", pronunciation: "mil-YON", english: "1,000,000", russian: "1000000" },
    ],
  },
  {
    title: "Formation Examples",
    items: [
      { turkish: "Yirmi bir", pronunciation: "yir-MI bir", english: "21 (20+1)", russian: "21" },
      { turkish: "Otuz beş", pronunciation: "o-TUZ besh", english: "35 (30+5)", russian: "35" },
      { turkish: "Yüz kırk iki", pronunciation: "yüz kirk i-KI", english: "142 (100+40+2)", russian: "142" },
      { turkish: "Bin dokuz yüz", pronunciation: "bin do-KUZ yüz", english: "1900", russian: "1900" },
    ],
  },
];

// Questions
const questionGroups: PhraseGroup[] = [
  {
    title: "Who / What?",
    items: [
      { turkish: "Kim?", pronunciation: "kim?", english: "Who?", russian: "Кто?" },
      { turkish: "Kim o?", pronunciation: "kim o?", english: "Who is that?", russian: "Кто это?" },
      { turkish: "Bu kim?", pronunciation: "bu kim?", english: "Who is this?", russian: "Кто это?" },
      { turkish: "Ne?", pronunciation: "ne?", english: "What?", russian: "Что?" },
      { turkish: "Ne oldu?", pronunciation: "ne ol-DU?", english: "What happened?", russian: "Что случилось?" },
    ],
  },
  {
    title: "Where?",
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
    title: "How?",
    items: [
      { turkish: "... nasıl?", pronunciation: "... na-SIL?", english: "How is ...? / How to ...?", russian: "Как ...?" },
      { turkish: "Nasılsın?", pronunciation: "na-SIL-sin?", english: "How are you?", russian: "Как дела?" },
      { turkish: "Buraya nasıl gidilir?", pronunciation: "bu-ra-YA na-SIL gi-di-LIR?", english: "How do I get here?", russian: "Как сюда добраться?" },
      { turkish: "Bu nasıl söylenir?", pronunciation: "bu na-SIL söy-le-NIR?", english: "How do you say this?", russian: "Как это сказать?" },
    ],
  },
  {
    title: "When?",
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

function CategorySection({
  title,
  groups,
  atom,
}: {
  title: string;
  groups: PhraseGroup[];
  atom: ReturnType<typeof atomWithStorage<boolean>>;
}) {
  const [isOpen, setIsOpen] = useAtom(atom);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b last:border-b-0">
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 transition-colors px-1 rounded">
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs text-muted-foreground">({groups.length} groups)</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 py-4 pl-6">
          {groups.map((group) => (
            <PhraseColumn key={group.title} group={group} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function QuickReference() {
  const [isOpen, setIsOpen] = useAtom(quickRefMainOpenAtom);

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <CardTitle className="text-lg">Quick Reference</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <CategorySection title="Grammar Basics" groups={grammarGroups} atom={quickRefGrammarOpenAtom} />
            <CategorySection title="Common Words & Phrases" groups={commonGroups} atom={quickRefCommonOpenAtom} />
            <CategorySection title="Numbers" groups={numberGroups} atom={quickRefNumbersOpenAtom} />
            <CategorySection title="Questions" groups={questionGroups} atom={quickRefQuestionsOpenAtom} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
