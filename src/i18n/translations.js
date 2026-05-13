// ─── Central UI translations ──────────────────────────────────────────────
// Add new strings here. Components access them via useLanguage() → t("key.sub")

export const translations = {
  en: {
    nav: {
      appName: "Tinder for Books",
      home:     "Home",
      swipe:    "Swipe",
      wishlist: "Wishlist",
      read:     "Read",
      profile:  "Profile",
      guest:    "Guest",
    },

    home: {
      eyebrow:    "✦ Book Discovery",
      title:      "Find your next great read.",
      subtitle:   "Tell us your taste. We'll find the pages.",
      cta:        "Match with a book",
      footnote:   "No account needed · Free forever",
      card1Title: "Real bestsellers, matched to you",
      card1Body:  "We pull from curated lists and match books to your mood, genre taste and reading pace.",
      card2Title: "Swipe to save, swipe to remember",
      card2Body:  "Right to wish for it. Down when you've read it. Your list is always there, no sign-up required.",
    },

    swipe: {
      like:    "Save",
      read:    "Read",
      dislike: "Next",
      empty:   "No more books available.",
    },

    preferences: {
      title:             "How do you like to read?",
      genreLabel:        "Your genres",
      genreDesc:         "Pick the genres you love",
      lengthLabel:       "Book length",
      lengthDesc:        "Short reads or long adventures?",
      languageLabel:     "Choose a language",
      languageDesc:      "Which language do you prefer?",
      authorLabel:       "A favourite author?",
      authorDesc:        "Optional — we'll look for their books first",
      authorPlaceholder: "Type an author (optional)",
      submit:            "Start swiping",
    },

    wishlist: {
      title:          "Your Wishlist",
      empty:          "Your wishlist is empty.",
      emptyHint:      "Swipe right on books you like to add them here!",
      clearAll:       "Clear All",
      confirmClear:   "Remove all books from your wishlist?",
      buyOnAmazon:    "📚 Buy on Amazon",
      countSingular:  "1 book in your wishlist",
      countPlural:    "{n} books in your wishlist",
      by:             "by",
      noDescription:  "No description available.",
    },

    read: {
      title:          "Already Read",
      empty:          "You haven't marked any books as read yet.",
      emptyHint:      "Swipe down on books you've already read to add them here!",
      clearAll:       "Clear All",
      confirmClear:   "Remove all books from your read list?",
      countSingular:  "1 book you've already read",
      countPlural:    "{n} books you've already read",
    },

    profile: {
      avatarLabel:      "G",
      guestLabel:       "Guest",
      modeLabel:        "Guest Mode",
      modeHint:         "You're using the app without an account. Your data is stored locally only.",
      login:            "Sign in",
      register:         "Create account",
      comingSoon:       "🔐 Login & accounts coming soon.",
      comingSoonDetail: "With an account, your wishlist, swipe history and preferences are saved permanently.",
    },
  },

  de: {
    nav: {
      appName: "Tinder for Books",
      home:     "Start",
      swipe:    "Entdecken",
      wishlist: "Merkliste",
      read:     "Gelesen",
      profile:  "Profil",
      guest:    "Gast",
    },

    home: {
      eyebrow:    "✦ Bücher entdecken",
      title:      "Dein nächstes Lieblingsbuch wartet.",
      subtitle:   "Sag uns deinen Geschmack. Wir finden die Seiten.",
      cta:        "Bücher matchen",
      footnote:   "Kein Account nötig · Kostenlos",
      card1Title: "Echte Bestseller, passend zu dir",
      card1Body:  "Wir nutzen kuratierte Listen und matchen Bücher mit deiner Stimmung, deinem Genre-Geschmack und deinem Lesetempo.",
      card2Title: "Wischen zum Merken, wischen zum Erinnern",
      card2Body:  "Rechts zum Merken. Runter wenn du's gelesen hast. Deine Liste ist immer da — ohne Anmeldung.",
    },

    swipe: {
      like:    "Merken",
      read:    "Gelesen",
      dislike: "Weiter",
      empty:   "Keine weiteren Bücher verfügbar.",
    },

    preferences: {
      title:             "Wie liest du am liebsten?",
      genreLabel:        "Deine Genres",
      genreDesc:         "Wähle die Genres, die du liebst",
      lengthLabel:       "Buchlänge",
      lengthDesc:        "Kurzgeschichten oder lange Abenteuer?",
      languageLabel:     "Sprache wählen",
      languageDesc:      "Welche Sprache bevorzugst du?",
      authorLabel:       "Ein Lieblingsautor?",
      authorDesc:        "Optional — wir suchen zuerst nach ihren Büchern",
      authorPlaceholder: "Autor eingeben (optional)",
      submit:            "Jetzt swipen",
    },

    wishlist: {
      title:          "Deine Merkliste",
      empty:          "Deine Merkliste ist leer.",
      emptyHint:      "Swipe rechts auf Bücher, die du magst, um sie hier zu speichern!",
      clearAll:       "Alle löschen",
      confirmClear:   "Alle Bücher aus deiner Merkliste entfernen?",
      buyOnAmazon:    "📚 Bei Amazon kaufen",
      countSingular:  "1 Buch auf deiner Merkliste",
      countPlural:    "{n} Bücher auf deiner Merkliste",
      by:             "von",
      noDescription:  "Keine Beschreibung verfügbar.",
    },

    read: {
      title:          "Bereits gelesen",
      empty:          "Du hast noch keine Bücher als gelesen markiert.",
      emptyHint:      "Swipe runter auf Bücher, die du bereits gelesen hast!",
      clearAll:       "Alle löschen",
      confirmClear:   "Alle Bücher aus deiner Leseliste entfernen?",
      countSingular:  "1 Buch bereits gelesen",
      countPlural:    "{n} Bücher bereits gelesen",
    },

    profile: {
      avatarLabel:      "G",
      guestLabel:       "Gast",
      modeLabel:        "Gastmodus",
      modeHint:         "Du verwendest die App ohne Account. Deine Daten werden nur lokal gespeichert.",
      login:            "Anmelden",
      register:         "Registrieren",
      comingSoon:       "🔐 Login & Accounts kommen bald.",
      comingSoonDetail: "Mit einem Account werden deine Merkliste, Swipe-History und Präferenzen dauerhaft gespeichert.",
    },
  },
};
