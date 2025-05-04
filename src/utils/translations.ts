
type TranslationKey = 
  | "dashboardTitle"
  | "welcome"
  | "newList"
  | "totalLists"
  | "allTimeGroceryLists"
  | "totalItems"
  | "itemsAcrossAllLists"
  | "totalSpent"
  | "estimatedTotalExpenses"
  | "avgListCost"
  | "averagePerGroceryList"
  | "spendingHistory"
  | "expensesOverTime"
  | "recentLists"
  | "recentlyCreatedLists"
  | "listName"
  | "items"
  | "estCost"
  | "noListsYet"
  | "createFirstList"
  | "language";

type Translations = {
  [key in TranslationKey]: {
    en: string;
    bn: string;
  }
};

export const translations: Translations = {
  dashboardTitle: {
    en: "Dashboard",
    bn: "ড্যাশবোর্ড"
  },
  welcome: {
    en: "Welcome back,",
    bn: "আবারও স্বাগতম,"
  },
  newList: {
    en: "New List",
    bn: "নতুন তালিকা"
  },
  totalLists: {
    en: "Total Lists",
    bn: "মোট তালিকা"
  },
  allTimeGroceryLists: {
    en: "All-time grocery lists",
    bn: "সব সময়ের মুদি তালিকা"
  },
  totalItems: {
    en: "Total Items",
    bn: "মোট আইটেম"
  },
  itemsAcrossAllLists: {
    en: "Items across all lists",
    bn: "সকল তালিকার আইটেম"
  },
  totalSpent: {
    en: "Total Spent",
    bn: "মোট ব্যয়"
  },
  estimatedTotalExpenses: {
    en: "Estimated total expenses",
    bn: "অনুমানিত মোট ব্যয়"
  },
  avgListCost: {
    en: "Avg. List Cost",
    bn: "গড় তালিকা ব্যয়"
  },
  averagePerGroceryList: {
    en: "Average per grocery list",
    bn: "প্রতি মুদি তালিকার গড়"
  },
  spendingHistory: {
    en: "Spending History",
    bn: "ব্যয়ের ইতিহাস"
  },
  expensesOverTime: {
    en: "Your estimated grocery expenses over the last 6 months",
    bn: "গত 6 মাসে আপনার অনুমানিত মুদি ব্যয়"
  },
  recentLists: {
    en: "Recent Lists",
    bn: "সাম্প্রতিক তালিকা"
  },
  recentlyCreatedLists: {
    en: "Your most recently created grocery lists",
    bn: "আপনার সাম্প্রতিক তৈরি করা মুদি তালিকা"
  },
  listName: {
    en: "List Name",
    bn: "তালিকার নাম"
  },
  items: {
    en: "Items",
    bn: "আইটেম"
  },
  estCost: {
    en: "Est. Cost",
    bn: "অনুমিত মূল্য"
  },
  noListsYet: {
    en: "You haven't created any grocery lists yet.",
    bn: "আপনি এখনো কোন মুদি তালিকা তৈরি করেননি।"
  },
  createFirstList: {
    en: "Create Your First List",
    bn: "আপনার প্রথম তালিকা তৈরি করুন"
  },
  language: {
    en: "বাংলা",
    bn: "English"
  }
};

export const getText = (key: TranslationKey, language: "en" | "bn"): string => {
  return translations[key][language];
};
