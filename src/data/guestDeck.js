import coverDarkRomance from "../assets/covers/dark-romance.jpg";
import coverRomance from "../assets/covers/romance.jpg";
import coverFourthWing from "../assets/covers/fourth-wing.jpg";
import coverBlackwood from "../assets/covers/blackwood-institute.jpg";
import coverMimik from "../assets/covers/mimik.jpg";

// Offline fallback deck: shown when the Google Books request fails or comes
// back empty, so the swipe screen is never blank. Same covers as Guest Home.
export const FALLBACK_DECK = [
  {
    id: "vbb",
    title: "Very Bad Bastard",
    author: "L. S. Wonda",
    genre: "Dark Romance",
    cover: coverDarkRomance,
    claptext:
      "Kingston University's most dangerous player has one rule: never fall. Then she walks into his lecture hall and rewrites the game.",
    amazonLink: "https://www.amazon.de/s?k=Very+Bad+Bastard+L+S+Wonda",
  },
  {
    id: "ftl",
    title: "Friends to Lovers",
    author: "Sally Blakely",
    genre: "Romance",
    cover: coverRomance,
    claptext:
      "One last summer to fall for each other. They swore it would stay platonic — the lake house had other plans.",
    amazonLink: "https://www.amazon.de/s?k=Friends+to+Lovers+Sally+Blakely",
  },
  {
    id: "fw",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    genre: "Romantasy",
    cover: coverFourthWing,
    claptext:
      "Enter the deadly world of dragon riders, where friends can become enemies overnight and the only way out is to bond a dragon — or die trying.",
    amazonLink: "https://www.amazon.de/s?k=Fourth+Wing+Rebecca+Yarros",
  },
  {
    id: "bi",
    title: "Blackwood Institute",
    author: "J. Rose",
    genre: "Horror",
    cover: coverBlackwood,
    claptext:
      "Three girls check into the Institute for treatment. What lives in its walls has been waiting a very long time for new company.",
    amazonLink: "https://www.amazon.de/s?k=Blackwood+Institute+J+Rose",
  },
  {
    id: "mimik",
    title: "Mimik",
    author: "Sebastian Fitzek",
    genre: "Thriller",
    cover: coverMimik,
    claptext:
      "A psychologist who can read every micro-expression is confronted with the one face he cannot decode — his own daughter's.",
    amazonLink: "https://www.amazon.de/s?k=Mimik+Sebastian+Fitzek",
  },
];
