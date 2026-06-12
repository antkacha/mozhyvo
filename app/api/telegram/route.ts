import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const BOT_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name: string; username?: string };
  chat:  { id: number; type: string };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?:  TelegramMessage;
}

async function sendMessage(chatId: number, text: string, parseMode = "HTML") {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (BOT_SECRET && secret !== BOT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update: TelegramUpdate = await req.json();
  const msg = update.message;
  if (!msg || !msg.text) return NextResponse.json({ ok: true });

  const chatId    = msg.chat.id;
  const text      = msg.text.trim();
  const firstName = msg.from?.first_name ?? "друже";

  if (text === "/start") {
    await sendMessage(
      chatId,
      `👋 <b>Привіт, ${firstName}!</b>\n\nЯ бот Моживо — допомагаю знаходити гранти, стипендії та обміни для молоді України.\n\n<b>Команди:</b>\n/opportunities — 🔥 Гарячі можливості\n/deadlines — ⏰ Найближчі дедлайни\n/scholarships — 🎓 Стипендії\n/internships — 💼 Стажування\n/subscribe — 🔔 Щотижнева розсилка\n/help — ❓ Допомога`,
    );
  } else if (text === "/opportunities" || text === "/hot") {
    await sendMessage(
      chatId,
      `🔥 <b>Гарячі можливості</b>\n\nПереглянь актуальні програми на сайті:\n👉 <a href="https://mozhyvo.ua/opportunities">mozhyvo.ua/opportunities</a>\n\nАбо обери категорію:\n• 🎓 /scholarships — стипендії\n• 💼 /internships — стажування\n• ✈️ /exchanges — обміни\n• 💰 /grants — гранти`,
    );
  } else if (text === "/scholarships") {
    await sendMessage(
      chatId,
      `🎓 <b>Стипендії</b>\n\nВсі стипендійні програми:\n👉 <a href="https://mozhyvo.ua/opportunities?category=scholarships">mozhyvo.ua/opportunities?category=scholarships</a>\n\n<b>Популярні:</b>\n• Erasmus+ (ЄС) — до €1000/міс\n• DAAD (Германія) — стипендія на навчання\n• Fulbright (США) — магістратура та PhD`,
    );
  } else if (text === "/internships") {
    await sendMessage(
      chatId,
      `💼 <b>Стажування</b>\n\nВсі стажування:\n👉 <a href="https://mozhyvo.ua/opportunities?category=internships">mozhyvo.ua/opportunities?category=internships</a>`,
    );
  } else if (text === "/deadlines") {
    await sendMessage(
      chatId,
      `⏰ <b>Найближчі дедлайни</b>\n\nПрограми зі спливаючим дедлайном:\n👉 <a href="https://mozhyvo.ua/opportunities?sort=deadline">mozhyvo.ua/opportunities?sort=deadline</a>\n\nПорада: зареєструйся на сайті та збережи програми, щоб отримувати нагадування!`,
    );
  } else if (text === "/subscribe") {
    await sendMessage(
      chatId,
      `🔔 <b>Щотижнева розсилка</b>\n\nПідпишись на email-розсилку з новими можливостями:\n👉 <a href="https://mozhyvo.ua/#newsletter">mozhyvo.ua/#newsletter</a>\n\nАбо зареєструйся на сайті і налаштуй сповіщення в особистому кабінеті.`,
    );
  } else if (text === "/help") {
    await sendMessage(
      chatId,
      `❓ <b>Допомога</b>\n\nМоживо — платформа можливостей для молоді України.\n\n<b>Команди бота:</b>\n/opportunities — гарячі можливості\n/deadlines — найближчі дедлайни\n/scholarships — стипендії\n/internships — стажування\n/subscribe — розсилка\n\n<b>Зворотний зв'язок:</b> mozhyvo@gmail.com\n<b>Сайт:</b> <a href="https://mozhyvo.ua">mozhyvo.ua</a>`,
    );
  } else {
    await sendMessage(
      chatId,
      `🤔 Не розумію цю команду.\n\nНапиши /help щоб побачити доступні команди, або відвідай сайт:\n👉 <a href="https://mozhyvo.ua">mozhyvo.ua</a>`,
    );
  }

  return NextResponse.json({ ok: true });
}

// Health check
export async function GET() {
  return NextResponse.json({
    ok:  true,
    bot: BOT_TOKEN ? "configured" : "not configured (set TELEGRAM_BOT_TOKEN)",
  });
}
