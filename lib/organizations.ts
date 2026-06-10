export type OrgType =
  | "ngo"
  | "university"
  | "foundation"
  | "company"
  | "eu-program"
  | "startup"
  | "international";

export interface Organization {
  slug: string;
  name: string;
  logoInitials: string;
  logoColor: string;
  coverFrom: string;
  coverTo: string;
  type: OrgType;
  typeName: string;
  country: string;
  flag: string;
  founded?: string;
  size?: string;
  description: string;
  mission?: string;
  website?: string;
  email?: string;
  socials: {
    telegram?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  verified: boolean;
  tags: string[];
  focusAreas: string[];
  stats: {
    opportunities: number;
    countries: number;
    participants?: string;
  };
}

export const organizations: Organization[] = [
  {
    slug: "erasmus-plus",
    name: "Erasmus+",
    logoInitials: "E+",
    logoColor: "bg-blue-600",
    coverFrom: "#003DA5",
    coverTo: "#0052CC",
    type: "eu-program",
    typeName: "Програма ЄС",
    country: "Бельгія",
    flag: "🇧🇪",
    founded: "1987",
    description:
      "Erasmus+ — флагманська освітня програма Європейського Союзу, що підтримує навчання, стажування та молодіжні обміни для громадян держав-членів ЄС та країн-партнерів, включаючи Україну. Програма охоплює вищу освіту, профтехосвіту, шкільну освіту та молодіжну роботу.",
    mission:
      "Сприяти особистісному розвитку, підвищенню кваліфікації та залученню громадян через освіту, навчання, молодіжну роботу та спорт.",
    website: "https://erasmus-plus.ec.europa.eu",
    email: "erasmus-info@eacea.ec.europa.eu",
    socials: {
      facebook: "https://facebook.com/ErasmusPlusEU",
      twitter: "https://twitter.com/ErasmusPlusEU",
      instagram: "https://instagram.com/erasmuspluseu",
      youtube: "https://youtube.com/@ErasmusPlusEU",
    },
    verified: true,
    tags: ["ЄС", "стипендії", "обміни", "вища освіта", "молодь"],
    focusAreas: ["Вища освіта", "Молодіжні обміни", "Проф. навчання", "Громадянська активність"],
    stats: { opportunities: 340, countries: 35, participants: "10 млн+" },
  },
  {
    slug: "daad",
    name: "DAAD",
    logoInitials: "DA",
    logoColor: "bg-yellow-500",
    coverFrom: "#FFD700",
    coverTo: "#FFA500",
    type: "foundation",
    typeName: "Академічна організація",
    country: "Німеччина",
    flag: "🇩🇪",
    founded: "1925",
    description:
      "DAAD (Deutscher Akademischer Austauschdienst / Германська служба академічних обмінів) — найбільша у світі організація з підтримки міжнародного академічного обміну. DAAD пропонує стипендії та гранти для студентів, аспірантів та дослідників по всьому світу, приділяючи особливу увагу підтримці України.",
    mission:
      "Просування міжнародного обміну між студентами та вченими шляхом надання стипендій та підтримки партнерств між університетами.",
    website: "https://www.daad.de",
    email: "ukraine@daad.de",
    socials: {
      facebook: "https://facebook.com/daad.de",
      instagram: "https://instagram.com/daad_germany",
      linkedin: "https://linkedin.com/company/daad",
      twitter: "https://twitter.com/DAAD_Germany",
    },
    verified: true,
    tags: ["Німеччина", "стипендії", "дослідження", "вища освіта"],
    focusAreas: ["Навчання за кордоном", "Наукові дослідження", "Мовні курси", "Підтримка України"],
    stats: { opportunities: 45, countries: 1, participants: "100 000+" },
  },
  {
    slug: "ucu",
    name: "Український Католицький Університет",
    logoInitials: "УКУ",
    logoColor: "bg-primary",
    coverFrom: "#3B4FE8",
    coverTo: "#2D3DD6",
    type: "university",
    typeName: "Університет",
    country: "Україна",
    flag: "🇺🇦",
    founded: "1994",
    description:
      "Українській Католицький Університет (УКУ) — єдиний католицький університет у пострадянських країнах. Університет відомий своїм духом академічної свободи, міждисциплінарним підходом та активною громадянською позицією. УКУ входить до рейтингів найкращих університетів України та є визнаним центром гуманітарних та соціальних наук.",
    mission:
      "Формувати лідерів із сильними цінностями, критичним мисленням та здатністю служити суспільству через якісну освіту та наукові дослідження.",
    website: "https://ucu.edu.ua",
    email: "info@ucu.edu.ua",
    socials: {
      facebook: "https://facebook.com/ucu.edu.ua",
      instagram: "https://instagram.com/ucu.lviv",
      telegram: "https://t.me/ucu_official",
      youtube: "https://youtube.com/@UCUuniversity",
    },
    verified: true,
    tags: ["Львів", "університет", "гуманітарні науки", "лідерство"],
    focusAreas: ["Гуманітарні науки", "Богослов'я", "Бізнес-освіта", "Лідерство"],
    stats: { opportunities: 8, countries: 1, participants: "2 000+" },
  },
  {
    slug: "fulbright-ukraine",
    name: "Програма Фулбрайта в Україні",
    logoInitials: "F",
    logoColor: "bg-red-600",
    coverFrom: "#B22234",
    coverTo: "#3C3B6E",
    type: "foundation",
    typeName: "Програма обміну",
    country: "США",
    flag: "🇺🇸",
    founded: "1992",
    description:
      "Програма Фулбрайта в Україні — частина міжнародної програми обміну Fulbright, заснованої сенатором Джеймсом Вільямом Фулбрайтом у 1946 році. В Україні програма діє з 1992 року та фінансується Державним департаментом США. Щороку програма надає стипендії українським громадянам для навчання та досліджень у США.",
    mission:
      "Зміцнення взаєморозуміння між народами США та України через освітній та культурний обмін.",
    website: "https://fulbright.org.ua",
    email: "fulbright@fulbright.org.ua",
    socials: {
      facebook: "https://facebook.com/FulbrightUkraine",
      instagram: "https://instagram.com/fulbright_ukraine",
      twitter: "https://twitter.com/FulbrightUA",
    },
    verified: true,
    tags: ["США", "магістратура", "PhD", "повне фінансування"],
    focusAreas: ["Академічні дослідження", "Магістратура в США", "Культурний обмін", "PhD"],
    stats: { opportunities: 5, countries: 1, participants: "1 500+" },
  },
  {
    slug: "uwc",
    name: "United World Colleges",
    logoInitials: "UWC",
    logoColor: "bg-teal-600",
    coverFrom: "#0D9488",
    coverTo: "#0F766E",
    type: "international",
    typeName: "Міжнародна організація",
    country: "Велика Британія",
    flag: "🇬🇧",
    founded: "1962",
    description:
      "United World Colleges (UWC) — міжнародний освітній рух, що об'єднує 18 шкіл та коледжів на 4 континентах. Місія UWC — перетворити освіту на силу, що об'єднує людей, нації та культури заради миру та сталого майбутнього. Студенти з 150+ країн навчаються разом, отримуючи диплом IB.",
    mission:
      "Робити освіту силою для єдності людей, незалежно від їхнього походження, заради миру та сталого розвитку.",
    website: "https://www.uwc.org",
    email: "ukraine@uwc.org",
    socials: {
      facebook: "https://facebook.com/uwcint",
      instagram: "https://instagram.com/uwc_international",
      twitter: "https://twitter.com/UWCInt",
      linkedin: "https://linkedin.com/company/uwc-international",
    },
    verified: true,
    tags: ["IB диплом", "міжнародна школа", "обмін", "стипендія"],
    focusAreas: ["Середня освіта", "IB Diploma", "Міжкультурний діалог", "Лідерство"],
    stats: { opportunities: 18, countries: 18, participants: "60 000+" },
  },
  {
    slug: "google",
    name: "Google",
    logoInitials: "G",
    logoColor: "bg-[#4285F4]",
    coverFrom: "#4285F4",
    coverTo: "#0F9D58",
    type: "company",
    typeName: "Технологічна компанія",
    country: "США",
    flag: "🇺🇸",
    founded: "1998",
    size: "100 000+ співробітників",
    description:
      "Google — одна з найбільших технологічних компаній світу, що пропонує широкий спектр програм для студентів та молодих фахівців: від стажувань у штаб-квартирі та офісах по всьому світу до онлайн-програм навчання та сертифікації. Google активно підтримує молодих розробників через програми Google Summer of Code, STEP Internship та інші.",
    mission:
      "Організувати світову інформацію, щоб зробити її загальнодоступною та корисною.",
    website: "https://careers.google.com/students",
    socials: {
      linkedin: "https://linkedin.com/company/google",
      twitter: "https://twitter.com/googledevs",
      youtube: "https://youtube.com/@Google",
      instagram: "https://instagram.com/google",
    },
    verified: true,
    tags: ["IT", "стажування", "розробка", "хмарні технології"],
    focusAreas: ["Розробка ПЗ", "Машинне навчання", "UX/UI", "Cloud"],
    stats: { opportunities: 12, countries: 20, participants: "5 000+" },
  },
  {
    slug: "aiesec",
    name: "AIESEC",
    logoInitials: "AI",
    logoColor: "bg-[#037EF3]",
    coverFrom: "#037EF3",
    coverTo: "#F85A40",
    type: "ngo",
    typeName: "Молодіжна організація",
    country: "Нідерланди",
    flag: "🇳🇱",
    founded: "1948",
    description:
      "AIESEC — найбільша молодіжна організація у світі, представлена у 120+ країнах. Організація надає молоді можливість розвивати лідерські якості через міжнародні стажування та волонтерські проекти. В Україні AIESEC діє у 18 містах та щороку відправляє сотні студентів на міжнародні програми.",
    mission:
      "Активізувати лідерський потенціал молоді через практичний досвід для позитивних змін у світі.",
    website: "https://aiesec.org",
    email: "ukraine@aiesec.net",
    socials: {
      facebook: "https://facebook.com/AIESECinUkraine",
      instagram: "https://instagram.com/aiesec_ukraine",
      linkedin: "https://linkedin.com/company/aiesec",
      telegram: "https://t.me/aiesecukraine",
    },
    verified: true,
    tags: ["лідерство", "волонтерство", "стажування", "міжнародний досвід"],
    focusAreas: ["Лідерський розвиток", "Міжнародні стажування", "Волонтерство", "Обмін"],
    stats: { opportunities: 25, countries: 120, participants: "1 млн+" },
  },
  {
    slug: "flex",
    name: "Програма FLEX",
    logoInitials: "FL",
    logoColor: "bg-blue-700",
    coverFrom: "#1D4ED8",
    coverTo: "#DC2626",
    type: "foundation",
    typeName: "Програма обміну",
    country: "США",
    flag: "🇺🇸",
    founded: "1992",
    description:
      "FLEX (Future Leaders Exchange) — програма обміну для учнів старших класів, що фінансується Конгресом США через Бюро освітніх та культурних справ Державного департаменту. Учасники проводять один навчальний рік у американській сім'ї та школі, вивчають американську культуру та беруть участь у громадській діяльності.",
    mission:
      "Розвивати взаєморозуміння між молоддю США та країн Євразії через безпосереднє занурення в американське суспільство.",
    website: "https://www.iie.org/programs/flex",
    email: "flex-ukraine@iie.org",
    socials: {
      facebook: "https://facebook.com/FLEXprogram",
      instagram: "https://instagram.com/flexprogram",
    },
    verified: true,
    tags: ["США", "школярі", "культурний обмін", "повне фінансування"],
    focusAreas: ["Шкільний обмін", "Культурна адаптація", "Лідерство", "Англійська мова"],
    stats: { opportunities: 1, countries: 1, participants: "30 000+" },
  },
  {
    slug: "esc",
    name: "European Solidarity Corps",
    logoInitials: "ESC",
    logoColor: "bg-indigo-600",
    coverFrom: "#4F46E5",
    coverTo: "#7C3AED",
    type: "eu-program",
    typeName: "Програма ЄС",
    country: "Бельгія",
    flag: "🇧🇪",
    founded: "2016",
    description:
      "European Solidarity Corps (ESC) — ініціатива Євросоюзу, що надає молодим людям (17–30 років) можливість брати участь у волонтерських проектах, стажуваннях та роботі в організаціях по всій Європі. Програма покриває витрати на проїзд, проживання, харчування та надає кишенькові гроші.",
    mission:
      "Залучити молодь до вирішення суспільних викликів через волонтерство та солідарність.",
    website: "https://europa.eu/youth/solidarity_en",
    email: "esc-info@eacea.ec.europa.eu",
    socials: {
      facebook: "https://facebook.com/EuropeanSolidarityCorps",
      instagram: "https://instagram.com/european.solidarity.corps",
      twitter: "https://twitter.com/EUSolidarity",
    },
    verified: true,
    tags: ["ЄС", "волонтерство", "молодь", "соціальні проекти"],
    focusAreas: ["Волонтерство", "Соціальні проекти", "Екологія", "Освіта"],
    stats: { opportunities: 15, countries: 33, participants: "350 000+" },
  },
  {
    slug: "hack4good",
    name: "Hack4Good Global",
    logoInitials: "H4",
    logoColor: "bg-red-500",
    coverFrom: "#EF4444",
    coverTo: "#DC2626",
    type: "startup",
    typeName: "Технологічна ініціатива",
    country: "Швейцарія",
    flag: "🇨🇭",
    founded: "2015",
    description:
      "Hack4Good — глобальна ініціатива, що об'єднує розробників, дизайнерів та інноваторів для вирішення соціальних проблем на хакатонах. Організація проводить заходи у 30+ країнах, запрошуючи учасників розробити технологічні рішення для НГО та соціальних підприємств за 48 годин.",
    mission:
      "Використовувати технології та hackathon-формат для вирішення реальних соціальних та екологічних викликів.",
    website: "https://hack4good.io",
    email: "hello@hack4good.io",
    socials: {
      instagram: "https://instagram.com/hack4good",
      twitter: "https://twitter.com/hack4good",
      linkedin: "https://linkedin.com/company/hack4good",
    },
    verified: true,
    tags: ["хакатон", "IT", "соціальні інновації", "tech for good"],
    focusAreas: ["Tech for Good", "Хакатони", "Соціальні інновації", "Розробка"],
    stats: { opportunities: 6, countries: 30, participants: "20 000+" },
  },
  {
    slug: "one-young-world",
    name: "One Young World",
    logoInitials: "OYW",
    logoColor: "bg-orange-500",
    coverFrom: "#F97316",
    coverTo: "#EA580C",
    type: "international",
    typeName: "Міжнародна організація",
    country: "Велика Британія",
    flag: "🇬🇧",
    founded: "2009",
    description:
      "One Young World — провідна глобальна організація молодіжного лідерства, що щороку збирає найбільш здібних та відповідальних молодих лідерів з усього світу на Summit. Серед колишніх учасників — лауреати Нобелівської премії миру, прем'єр-міністри та засновники компаній-єдинорогів.",
    mission:
      "Визначати, просувати та з'єднувати найвидатніших молодих лідерів світу для вирішення ключових глобальних проблем.",
    website: "https://www.oneyoungworld.com",
    email: "apply@oneyoungworld.com",
    socials: {
      facebook: "https://facebook.com/oneyoungworld",
      instagram: "https://instagram.com/oneyoungworld",
      twitter: "https://twitter.com/oneyoungworld",
      linkedin: "https://linkedin.com/company/one-young-world",
      youtube: "https://youtube.com/@OneYoungWorld",
    },
    verified: true,
    tags: ["лідерство", "саміт", "глобальний вплив", "мережа"],
    focusAreas: ["Глобальне лідерство", "Сталий розвиток", "Рівність", "Мир та безпека"],
    stats: { opportunities: 3, countries: 197, participants: "15 000+" },
  },
  {
    slug: "teach-for-ukraine",
    name: "Teach For Ukraine",
    logoInitials: "TFU",
    logoColor: "bg-green-600",
    coverFrom: "#16A34A",
    coverTo: "#15803D",
    type: "ngo",
    typeName: "НГО",
    country: "Україна",
    flag: "🇺🇦",
    founded: "2015",
    description:
      "Teach For Ukraine — частина глобальної мережі Teach For All. Організація залучає та підтримує талановитих лідерів, які йдуть викладати у школи з обмеженими ресурсами, одночасно навчаючись у Master програмі та розвиваючи системне розуміння освіти. Понад 300 Alumni TFU продовжують змінювати освіту в Україні та за кордоном.",
    mission:
      "Забезпечити, щоб всі діти в Україні мали доступ до якісної освіти та можливості реалізувати свій потенціал.",
    website: "https://teachforukraine.org",
    email: "apply@teachforukraine.org",
    socials: {
      facebook: "https://facebook.com/teachforukraine",
      instagram: "https://instagram.com/teach_for_ukraine",
      linkedin: "https://linkedin.com/company/teach-for-ukraine",
      telegram: "https://t.me/teachforukraine",
    },
    verified: true,
    tags: ["освіта", "НГО", "Україна", "лідерство", "викладання"],
    focusAreas: ["Освіта", "Лідерський розвиток", "Соціальний вплив", "Викладання"],
    stats: { opportunities: 4, countries: 1, participants: "300+" },
  },
];

export const orgsBySlug: Record<string, Organization> = Object.fromEntries(
  organizations.map((o) => [o.slug, o]),
);

export const orgNameToSlug: Record<string, string> = {
  "Erasmus+": "erasmus-plus",
  "DAAD": "daad",
  "Український Католицький Університет": "ucu",
  "Програма Фулбрайта в Україні": "fulbright-ukraine",
  "United World Colleges (UWC)": "uwc",
  "Google": "google",
  "AIESEC": "aiesec",
  "Програма FLEX": "flex",
  "European Solidarity Corps (ESC)": "esc",
  "Hack4Good Global": "hack4good",
  "One Young World": "one-young-world",
  "Teach For Ukraine": "teach-for-ukraine",
};
